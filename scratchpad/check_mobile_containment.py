"""Prove the mobile layer stays contained (v2, mobile revamp).

The binding rule in CLAUDE.md/DESIGN.md: every phone rule lives in
src/app/mobile.css, inside a media block that can never match a 768px or wider
viewport, so desktop rendering is frozen by construction.

v1 only checked that each top-level @media in mobile.css contained the text
"max-width", so `max-width: 1023px` would have passed. v2 checks:

  1. mobile.css: every top-level block is an @media whose EVERY comma-separated
     query carries an upper width bound below 768px; nothing sits outside one;
     nested blocks are only style rules, @keyframes, @supports, or @media
     bounded the same way.
  2. every other src/**/*.css: no phone-bounded @media at all (phone rules
     belong in mobile.css).
  3. optional, `--diff <git-ref>`: the TSX/TS lines added since <ref> carry no
     new `sm:`/`max-*:` Tailwind variants and no `mm.add(` whose condition
     lacks `max-width: 767px` (flagged for review, not failed).

Usage: python scratchpad/check_mobile_containment.py [--diff <ref>]
Exit code 0 = contained, 1 = a rule escaped.
"""

import glob
import re
import subprocess
import sys

ROOT_CSS = "src/app/mobile.css"


def to_px(value, unit):
    return float(value) * (1 if unit == "px" else 16)


def split_queries(prelude):
    q = re.sub(r"^@media\s*", "", prelude.strip(), flags=re.I)
    parts, depth, cur = [], 0, ""
    for ch in q:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    return parts


def phone_only(prelude):
    """True when every query has an upper width bound below 768px."""
    def bounded(query):
        for m in re.finditer(r"max-width\s*:\s*([\d.]+)(px|rem|em)", query, re.I):
            if to_px(m.group(1), m.group(2)) < 768:
                return True
        for m in re.finditer(r"width\s*(<=?)\s*([\d.]+)(px|rem|em)", query, re.I):
            px = to_px(m.group(2), m.group(3))
            if (m.group(1) == "<" and px <= 768) or (m.group(1) == "<=" and px < 768):
                return True
        return False

    return all(bounded(q) for q in split_queries(prelude))


def strip_comments(src):
    return re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), src, flags=re.S)


def blocks(src):
    """Yield (line, depth, prelude, parent_preludes) for every block opening."""
    depth, line, pending, stack = 0, 1, "", []
    for ch in src:
        if ch == "\n":
            line += 1
        if ch == "{":
            prelude = " ".join(pending.split())
            yield line, depth, prelude, list(stack), "open"
            stack.append(prelude)
            depth += 1
            pending = ""
        elif ch == "}":
            depth -= 1
            if stack:
                stack.pop()
            pending = ""
        elif ch == ";":
            decl = " ".join(pending.split())
            if depth == 0 and decl:
                yield line, depth, decl, [], "stmt"
            pending = ""
        else:
            pending += ch


failures = []

# 1 -- mobile.css
src = strip_comments(open(ROOT_CSS, encoding="utf-8").read())
media_blocks = 0
for line, depth, prelude, parents, kind in blocks(src):
    if kind == "stmt":
        failures.append(f"{ROOT_CSS}:{line}: top-level statement outside a media block: {prelude[:70]}")
        continue
    if depth == 0:
        if not prelude.lower().startswith("@media"):
            failures.append(f"{ROOT_CSS}:{line}: block outside a media block: {prelude[:70]}")
        elif not phone_only(prelude):
            failures.append(f"{ROOT_CSS}:{line}: media block can match >=768px: {prelude[:90]}")
        else:
            media_blocks += 1
        continue
    if prelude.startswith("@"):
        name = prelude.split()[0].lower()
        if name == "@media" and not phone_only(prelude):
            failures.append(f"{ROOT_CSS}:{line}: nested media block can match >=768px: {prelude[:90]}")
        elif name not in ("@media", "@keyframes", "@supports", "@container"):
            failures.append(f"{ROOT_CSS}:{line}: unexpected nested at-rule: {prelude[:70]}")

# 2 -- every other stylesheet carries no phone-only media block
for path in sorted(glob.glob("src/**/*.css", recursive=True)):
    path = path.replace("\\", "/")
    if path == ROOT_CSS:
        continue
    other = strip_comments(open(path, encoding="utf-8").read())
    for line, depth, prelude, parents, kind in blocks(other):
        if kind == "open" and prelude.lower().startswith("@media") and phone_only(prelude):
            failures.append(f"{path}:{line}: phone-only media block outside mobile.css: {prelude[:80]}")

# 3 -- optional review of added TSX lines
warnings = []
if "--diff" in sys.argv:
    ref = sys.argv[sys.argv.index("--diff") + 1]
    diff = subprocess.run(
        ["git", "diff", "-U0", ref, "--", "src/**/*.tsx", "src/**/*.ts", "src/*.tsx", "src/*.ts"],
        capture_output=True, text=True, encoding="utf-8",
    ).stdout
    current = None
    for raw in diff.splitlines():
        if raw.startswith("+++ "):
            current = raw[6:]
            continue
        if not raw.startswith("+") or raw.startswith("+++"):
            continue
        added = raw[1:]
        if re.search(r"(?<![\w-])(max-)?(sm|md|lg|xl|2xl):[\w\[]", added) and re.search(r"(?<![\w-])(max-\w+|sm):", added):
            warnings.append(f"{current}: new responsive variant: {added.strip()[:100]}")
        if "mm.add(" in added and "767" not in added and "reduce" not in added:
            warnings.append(f"{current}: matchMedia context without max-width: 767px: {added.strip()[:100]}")

if failures:
    print(f"FAIL: {len(failures)} containment problem(s)")
    for f in failures:
        print("  " + f)
else:
    print(f"PASS: {ROOT_CSS} holds {media_blocks} phone-only media blocks and nothing else; "
          f"no phone-only media block in any other stylesheet.")
for w in warnings:
    print("  REVIEW " + w)

sys.exit(1 if failures else 0)
