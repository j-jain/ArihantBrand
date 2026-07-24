"""Prove the mobile layer stays contained.

The binding rule in CLAUDE.md/DESIGN.md is that every rule in src/app/mobile.css
sits inside an `@media (max-width: 767px)` block, so stripping those blocks from
the compiled CSS leaves desktop rendering untouched.

The original check diffed compiled CSS before/after a mobile-only edit. That
only works when nothing else changed; this brief deliberately changes desktop
too, so the byte-diff cannot run. This checks the invariant that the byte-diff
was standing in for, directly on the source: no rule outside a max-width:767px
media block, and no media block in the file that is not max-width-bounded.

Usage: python check_mobile_containment.py [path/to/mobile.css]
Exit code 0 = contained, 1 = a rule escaped.
"""

import re
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "src/app/mobile.css"
src = open(path, encoding="utf-8").read()

# Strip comments so braces inside them never count.
src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)

depth = 0
media_depth = None          # brace depth at which the current @media opened
line = 1
i = 0
escaped = []                # (line, snippet) for anything outside a media block
bad_media = []              # @media blocks that are not max-width bounded
pending = ""                # text since the last brace / semicolon

while i < len(src):
    ch = src[i]
    if ch == "\n":
        line += 1
    if ch == "{":
        selector = pending.strip()
        if selector.startswith("@media"):
            if media_depth is None:
                if "max-width" not in selector:
                    bad_media.append((line, selector))
                media_depth = depth
        elif media_depth is None and selector:
            # A selector opening a block while no media block is active.
            escaped.append((line, selector.splitlines()[-1].strip()[:70]))
        depth += 1
        pending = ""
    elif ch == "}":
        depth -= 1
        if media_depth is not None and depth == media_depth:
            media_depth = None
        pending = ""
    elif ch == ";":
        decl = pending.strip()
        # Top-level at-rules without a block (@import, @charset) are fine.
        if media_depth is None and depth == 0 and decl and not decl.startswith("@"):
            escaped.append((line, decl[:70]))
        pending = ""
    else:
        pending += ch
    i += 1

if escaped:
    print(f"FAIL: {len(escaped)} rule(s) outside @media (max-width: 767px) in {path}")
    for ln, sel in escaped:
        print(f"  line {ln}: {sel}")
if bad_media:
    print(f"FAIL: {len(bad_media)} @media block(s) not bounded by max-width in {path}")
    for ln, sel in bad_media:
        print(f"  line {ln}: {sel}")

if not escaped and not bad_media:
    blocks = len(re.findall(r"@media[^{]*max-width", src))
    print(f"PASS: every rule in {path} is inside a max-width media block ({blocks} blocks).")
    sys.exit(0)

sys.exit(1)
