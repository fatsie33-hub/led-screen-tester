#!/usr/bin/env python3
"""Génère build/icon.png (512x512) sans dépendance externe."""

import os
import struct
import zlib

SIZE = 512
COLORS = [
    (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 255),
    (0, 255, 255), (255, 0, 255), (255, 255, 0), (0, 0, 0),
    (128, 128, 128), (255, 136, 0), (34, 211, 238), (191, 191, 191),
]
BG = (18, 22, 27)
BORDER = (58, 68, 79)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "icon.png")

pixels = [[(0, 0, 0, 0)] * SIZE for _ in range(SIZE)]


def in_round_rect(x, y, x0, y0, x1, y1, r):
    if x < x0 or x >= x1 or y < y0 or y >= y1:
        return False
    cx = min(max(x, x0 + r), x1 - 1 - r)
    cy = min(max(y, y0 + r), y1 - 1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


for y in range(SIZE):
    for x in range(SIZE):
        if in_round_rect(x, y, 8, 8, SIZE - 8, SIZE - 8, 96):
            pixels[y][x] = BG + (255,)

# Grille 4 x 3 de pastilles de couleur.
COLS, ROWS = 4, 3
MARGIN = 96
GAP = 14
cell_w = (SIZE - 2 * MARGIN) // COLS
cell_h = (ROWS * cell_w + (ROWS - 1) * GAP)
top = (SIZE - cell_h) // 2

for row in range(ROWS):
    for col in range(COLS):
        r, g, b = COLORS[row * COLS + col]
        x0 = MARGIN + col * cell_w + GAP // 2
        y0 = top + row * (cell_w + GAP) + GAP // 2
        x1 = x0 + cell_w - GAP
        y1 = y0 + cell_w - GAP
        for y in range(y0, y1):
            for x in range(x0, x1):
                edge = x < x0 + 2 or x >= x1 - 2 or y < y0 + 2 or y >= y1 - 2
                pixels[y][x] = (BORDER + (255,)) if edge else (r, g, b, 255)

raw = bytearray()
for y in range(SIZE):
    raw.append(0)
    for x in range(SIZE):
        raw.extend(pixels[y][x])


def chunk(tag, data):
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
png += chunk(b"IEND", b"")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "wb") as fh:
    fh.write(png)
print("icon ->", OUT, len(png), "octets")
