#!/usr/bin/env python3
"""Inspect OG PNGs for size and editor-dark descender clipping.

Background — the "@arach/og" title is rendered in Syne, whose lowercase 'g' is a
single-story glyph with a SHALLOW, blunt, flat-terminated descender (it drops only
~12px below the baseline at 60px). That blunt terminal *looks* chopped, but it is
the typeface's design, not a rendering clip. Do not chase it with line-height /
padding / overflow tweaks — they move the title's position but never the glyph's
completeness.

What this check actually guards: a *container* clip (e.g. overflow:hidden on a
too-short box) would eat the descender, collapsing its depth below the baseline to
~0. So we measure depth RELATIVE TO THE BASELINE (bottom of the adjacent 'o'),
which is robust to the title's vertical position and only fails on a genuine clip.
It deliberately does NOT try to police Syne's blunt terminal — that's not a bug.
"""
from __future__ import annotations

import sys
from PIL import Image

# Syne 'g' at 60px drops ~12px below the baseline. A real container clip collapses
# this toward 0. Threshold leaves margin for AA/scale while catching a true clip.
MIN_DESCENDER_DEPTH = 7


def white(px) -> bool:
    r, g, b, a = px
    return a > 200 and r > 210 and g > 210 and b > 210


def column_bottom(px, x_range, y_range) -> int | None:
    """Lowest y in y_range that has any white pixel within x_range."""
    bottom = None
    for y in y_range:
        if any(white(px[x, y]) for x in x_range):
            bottom = y
    return bottom


def inspect(path: str, template: str) -> list[str]:
    issues = []
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    if (w, h) != (1200, 630):
        issues.append(f"wrong size {w}x{h}")

    if template != "editor-dark":
        return issues

    px = im.load()

    # Title band lives in the upper-middle; the brand mark at the bottom (y>500)
    # is excluded by the y window so it can't be mistaken for the title.
    band_y = range(180, 430)

    # Locate the title's right edge — the final glyph is the 'g'.
    right_edge = None
    for x in range(w - 1, -1, -1):
        if any(white(px[x, y]) for y in band_y):
            right_edge = x
            break
    if right_edge is None:
        issues.append("title not found")
        return issues

    # 'g' bowl+descender sit just inside the right edge; the adjacent 'o' (no
    # descender) gives the baseline. Windows are relative to the detected edge so
    # the check survives the title moving vertically or horizontally.
    g_window = range(max(0, right_edge - 42), right_edge + 2)
    o_window = range(max(0, right_edge - 98), max(0, right_edge - 56))

    baseline = column_bottom(px, o_window, band_y)   # bottom of 'o'
    g_bottom = column_bottom(px, g_window, band_y)   # bottom of 'g' descender

    if baseline is None or g_bottom is None:
        issues.append("title g-tail not found")
        return issues

    depth = g_bottom - baseline
    if depth < MIN_DESCENDER_DEPTH:
        issues.append(
            f"g descender clipped (depth={depth}px below baseline, "
            f"need >={MIN_DESCENDER_DEPTH}) — a container is cutting the tail"
        )

    return issues


if __name__ == "__main__":
    path, template = sys.argv[1], sys.argv[2]
    problems = inspect(path, template)
    if problems:
        print("; ".join(problems))
        sys.exit(1)
    print("ok")
    sys.exit(0)
