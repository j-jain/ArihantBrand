"""Cut the award photographs out of their backgrounds (change round 11).

The /recognition cabinet stands every trophy and certificate on a drawn
shelf, so each one has to be an object on a transparent ground rather than a
snapshot of it on an office table. This reads the ten originals in
`Awards/` (gitignored WhatsApp JPEGs; the mapping to output names is the one
`scripts/process-photos.mjs` uses), removes the background with rembg,
cleans the edge, trims to the object plus a little air, and writes:

  public/images/photos/awards/cut/<name>.webp   RGBA WebP, long edge <= 1400
  src/content/award-cutout-sizes.ts             the generated size table the
                                                seed reads (never hand-edited)

Every run reads the originals and overwrites the outputs.

Setup (once, OUTSIDE the repo; Python 3.13):
  py -3.13 -m venv <somewhere>\\venv
  <somewhere>\\venv\\Scripts\\pip install "rembg[cpu]" pillow
Run (from the repo root):
  <somewhere>\\venv\\Scripts\\python -I scripts/cutout-awards.py [--model birefnet-general]
      [--only <name> ...] [--matting] [--sheet <png>]

  --model    rembg session name; birefnet-general (default) keys the finest
             edges, isnet-general-use is the lighter fallback
  --only     process only these output names
  --matting  rembg alpha matting (slower; helps soft edges, hurts thin ones)
  --sheet    also write a contact sheet of the results on a grey ground, for
             checking by eye

A file the models cannot key cleanly can carry hand-set corrections below,
all as pixels of the oriented original: QUAD_FALLBACK (four corners of the
object's outline, clockwise from top-left; the file is then cut as a
straight-edged object instead of matted), ERASE (regions where dark or grey
pixels the matte kept are dropped) and RESTORE (polygons where the original
pixels come back). The models download on first use into the user's
.rembg/models folder; on a network that blocks GitHub release downloads,
fetch the .onnx file from a mirror into that folder and run with
MODEL_CHECKSUM_DISABLED=1 (the mirror's bytes differ from rembg's hash).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "Awards"
OUT_DIR = ROOT / "public" / "images" / "photos" / "awards" / "cut"
SIZES_TS = ROOT / "src" / "content" / "award-cutout-sizes.ts"

MAX_EDGE = 1400
PAD = 0.03
WEBP_QUALITY = 92

# Original (in Awards/) -> output base name. Keep in step with
# scripts/process-photos.mjs, which wrote the committed JPEGs from the same
# files.
JOBS: dict[str, str] = {
    "WhatsApp Image 2026-07-21 at 7.01.33 PM.jpeg": "award-tadpole-champion-2122",
    "WhatsApp Image 2026-07-21 at 7.01.33 PM (1).jpeg": "award-indian-terrain-east-india",
    "WhatsApp Image 2026-07-21 at 7.01.31 PM (2).jpeg": "award-twills-2021",
    "WhatsApp Image 2026-07-21 at 7.01.32 PM (1).jpeg": "award-indian-terrain-2023",
    "WhatsApp Image 2026-07-21 at 7.01.32 PM (2).jpeg": "award-distributor-of-the-year",
    "WhatsApp Image 2026-07-21 at 7.01.31 PM (1).jpeg": "award-octave-excellence-2024",
    "WhatsApp Image 2026-07-21 at 7.01.32 PM.jpeg": "award-tadpole-15yr-thailand",
    "WhatsApp Image 2026-07-21 at 7.01.30 PM (1).jpeg": "award-tadpole-launch-2018",
    "WhatsApp Image 2026-07-21 at 7.01.31 PM.jpeg": "award-tadpole-assam",
    "WhatsApp Image 2026-07-21 at 7.01.30 PM.jpeg": "award-cmai-nigf-2024",
}

# name -> ((x, y) top-left, top-right, bottom-right, bottom-left) in oriented
# pixels: the outer corners of the object, used instead of the model for
# that file (see the header). The two framed certificates are here because
# isnet keeps the paper and throws the frame away.
QUAD_FALLBACK: dict[str, tuple[tuple[int, int], tuple[int, int], tuple[int, int], tuple[int, int]]] = {
    # The dark wood frame, photographed almost square on; its top edge runs
    # along the top of the photograph.
    "award-indian-terrain-east-india": ((168, 0), (1452, 2), (1422, 858), (158, 856)),
    # The light wood frame, its left edge on the photograph's edge.
    "award-octave-excellence-2024": ((2, 128), (897, 140), (896, 1312), (2, 1300)),
}

# Per-file touch-ups applied to the matte before it is trimmed, all in
# oriented original pixels.
#
# ERASE: regions (a box (x0, y0, x1, y1) or a polygon [(x, y), ...]) in which
# every pixel darker than `lum` or greyer than `sat` (max channel minus min
# channel) is made transparent. For something the model cannot tell from the
# object: the gold tick trophy stands in front of a black office chair, which
# the matte keeps under the left wing and in the gap between the V and the
# sphere, with a grey anti-aliased rim; the trophy itself is gold, bright
# and saturated, so neither threshold touches it.
#
# RESTORE: polygons inside which the original pixels come back (alpha 255,
# the polygon's edge softened by a pixel). For a part of the object the model
# threw away: the same trophy's right wing was cut off at the blinds' cord,
# so its tip is traced here from the photograph.
Region = tuple[str, object, int, int]
ERASE: dict[str, list[Region]] = {
    "award-distributor-of-the-year": [
        ("box", (95, 755, 326, 1015), 60, 36),
        (
            "poly",
            [
                (300, 770), (350, 806), (402, 846), (402, 850), (388, 858), (365, 872),
                (348, 888), (337, 910), (331, 935), (328, 960), (330, 985), (336, 1012),
                (300, 1012),
            ],
            60,
            36,
        ),
    ],
}
RESTORE: dict[str, list[list[tuple[int, int]]]] = {
    "award-distributor-of-the-year": [
        [
            (640, 453), (700, 397), (750, 350), (800, 304), (850, 257), (867, 235),
            (897, 284), (850, 340), (800, 395), (750, 450), (700, 505), (640, 569),
        ],
    ],
}


def log(msg: str) -> None:
    print(msg, flush=True)


def defringe(rgba: Image.Image) -> Image.Image:
    """Kill the faint halo the matte leaves (near-transparent pixels carrying
    the background's colour), solidify the near-opaque interior, and soften
    the step so the edge still anti-aliases."""
    r, g, b, a = rgba.split()
    a = a.point(lambda v: 0 if v < 28 else (255 if v > 228 else v))
    a = a.filter(ImageFilter.GaussianBlur(0.45))
    return Image.merge("RGBA", (r, g, b, a))


def erase_regions(rgba: Image.Image, regions: list[Region]) -> Image.Image:
    """See ERASE. Works on the oriented, untrimmed matte."""
    import numpy as np

    arr = np.array(rgba)
    rgb = arr[..., :3].astype(np.int16)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    sat = rgb.max(axis=-1) - rgb.min(axis=-1)
    for kind, shape, lum_max, sat_max in regions:
        mask = Image.new("L", rgba.size, 0)
        draw = ImageDraw.Draw(mask)
        if kind == "box":
            x0, y0, x1, y1 = shape  # type: ignore[misc]
            draw.rectangle((x0, y0, x1 - 1, y1 - 1), fill=255)
        else:
            draw.polygon(shape, fill=255)  # type: ignore[arg-type]
        inside = np.array(mask) > 0
        gone = inside & ((lum < lum_max) | (sat < sat_max))
        arr[..., 3] = np.where(gone, 0, arr[..., 3])
    return Image.fromarray(arr, "RGBA")


def restore_polygons(
    rgba: Image.Image, original: Image.Image, polygons: list[list[tuple[int, int]]]
) -> Image.Image:
    """See RESTORE: inside each polygon the photograph's own pixels come back
    (rembg blanks the colour under a transparent pixel, so they are copied
    from the oriented original), the polygon's edge softened by about a
    pixel so it anti-aliases like the matte's own edges. Works on the
    oriented, untrimmed matte."""
    import numpy as np

    mask = Image.new("L", rgba.size, 0)
    draw = ImageDraw.Draw(mask)
    for poly in polygons:
        draw.polygon(poly, fill=255)
    soft = np.array(mask.filter(ImageFilter.GaussianBlur(0.9)))
    arr = np.array(rgba)
    src = np.array(original.convert("RGB"))
    inside = soft > 0
    arr[..., :3] = np.where(inside[..., None], src, arr[..., :3])
    arr[..., 3] = np.maximum(arr[..., 3], soft)
    return Image.fromarray(arr, "RGBA")


def trim_pad(rgba: Image.Image) -> Image.Image:
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError("the matte left nothing")
    obj = rgba.crop(bbox)
    pad_x = round(obj.width * PAD)
    pad_y = round(obj.height * PAD)
    canvas = Image.new("RGBA", (obj.width + 2 * pad_x, obj.height + 2 * pad_y), (0, 0, 0, 0))
    canvas.paste(obj, (pad_x, pad_y))
    return canvas


def fit(rgba: Image.Image) -> Image.Image:
    if max(rgba.size) <= MAX_EDGE:
        return rgba
    rgba = rgba.copy()
    rgba.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
    return rgba


def quad_cut(img: Image.Image, quad) -> Image.Image:
    """A straight-edged object: the four corners are mapped onto a rectangle
    the size of the quad's longest edges, which also squares a certificate
    photographed at an angle."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = quad
    w = round(max(((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5, ((x2 - x3) ** 2 + (y2 - y3) ** 2) ** 0.5))
    h = round(max(((x3 - x0) ** 2 + (y3 - y0) ** 2) ** 0.5, ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5))
    # PIL's QUAD takes the source corners as top-left, bottom-left,
    # bottom-right, top-right.
    flat = img.convert("RGB").transform((w, h), Image.Transform.QUAD, (x0, y0, x3, y3, x2, y2, x1, y1), Image.Resampling.BICUBIC)
    rgba = flat.convert("RGBA")
    return rgba


def save_webp(rgba: Image.Image, path: Path) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        rgba.save(path, "WEBP", quality=WEBP_QUALITY, method=6, alpha_quality=100)
    except TypeError:
        rgba.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    return path.stat().st_size


def write_sizes(sizes: dict[str, tuple[int, int]]) -> None:
    lines = [
        "/* GENERATED by scripts/cutout-awards.py. Do not edit by hand: re-run the",
        "   script, which rewrites this file from the cut-out award photographs.",
        "",
        "   Pixel size of every award cut-out under public/images/photos/awards/cut/,",
        "   keyed by base name. The seed reads it (src/content/seed.ts,",
        "   recognitionPhotos) because the cabinet's shelf stands each object by",
        "   height and so needs its ratio. */",
        "",
        "export const awardCutoutSizes: Record<string, { w: number; h: number }> = {",
    ]
    for name in sorted(sizes):
        w, h = sizes[name]
        lines.append(f'  "{name}": {{ w: {w}, h: {h} }},')
    lines.append("};")
    lines.append("")
    SIZES_TS.write_text("\n".join(lines), encoding="utf-8")


def contact_sheet(results: list[tuple[str, Image.Image]], path: Path) -> None:
    cell_h = 420
    gap = 24
    tiles = []
    for name, img in results:
        t = img.copy()
        t.thumbnail((cell_h * 2, cell_h), Image.Resampling.LANCZOS)
        tiles.append((name, t))
    width = sum(t.width for _, t in tiles) + gap * (len(tiles) + 1)
    sheet = Image.new("RGB", (width, cell_h + 2 * gap + 30), (221, 219, 216))
    x = gap
    for _, t in tiles:
        ground = Image.new("RGBA", t.size, (221, 219, 216, 255))
        ground.alpha_composite(t)
        sheet.paste(ground.convert("RGB"), (x, gap + (cell_h - t.height)))
        x += t.width + gap
    sheet.save(path)
    log(f"contact sheet: {path}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="birefnet-general")
    ap.add_argument("--only", nargs="*", default=None)
    ap.add_argument("--matting", action="store_true")
    ap.add_argument("--sheet", default=None)
    args = ap.parse_args()

    from rembg import new_session, remove  # imported late: slow, and only needed here

    session = new_session(args.model)
    wanted = set(args.only) if args.only else None

    existing: dict[str, tuple[int, int]] = {}
    if SIZES_TS.exists():
        # Keep sizes of files not processed this run (a --only run).
        import re

        for m in re.finditer(r'"([^"]+)": \{ w: (\d+), h: (\d+) \}', SIZES_TS.read_text(encoding="utf-8")):
            existing[m.group(1)] = (int(m.group(2)), int(m.group(3)))

    sizes = dict(existing)
    results: list[tuple[str, Image.Image]] = []
    for src_name, out_name in JOBS.items():
        if wanted and out_name not in wanted:
            continue
        src = SRC_DIR / src_name
        if not src.exists():
            log(f"MISSING {src_name}")
            continue
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        how = args.model
        if out_name in QUAD_FALLBACK:
            rgba = quad_cut(img, QUAD_FALLBACK[out_name])
            how = "quad"
        else:
            rgba = remove(
                img,
                session=session,
                alpha_matting=args.matting,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10,
                post_process_mask=True,
            )
            rgba = defringe(rgba)
            if out_name in ERASE:
                rgba = erase_regions(rgba, ERASE[out_name])
                how += "+erase"
            if out_name in RESTORE:
                rgba = restore_polygons(rgba, img, RESTORE[out_name])
                how += "+restore"
        rgba = fit(trim_pad(rgba))
        size_kb = save_webp(rgba, OUT_DIR / f"{out_name}.webp") / 1024
        sizes[out_name] = rgba.size
        results.append((out_name, rgba))
        log(f"{out_name}.webp  {rgba.width}x{rgba.height}  {size_kb:.0f}KB  ({how})")

    write_sizes(sizes)
    log(f"\nwrote {SIZES_TS.relative_to(ROOT)} ({len(sizes)} entries)")
    if args.sheet and results:
        contact_sheet(results, Path(args.sheet))
    return 0


if __name__ == "__main__":
    sys.exit(main())
