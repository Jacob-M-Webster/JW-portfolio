"""Poster renderer (docs/05-3d-and-motion.md section 6.1).

    python scripts/render_poster.py [--out DIR]

Reads only the shipped point data (public/models/scene-points.*), never the
purchased model, and draws it with the scene's camera and ramp onto each
theme's --viewport, so the poster matches the live scene. Opaque posters are
about a quarter of the size of transparent ones. Writes PNG masters;
scripts/encode-posters.mjs turns them into AVIF and WebP.
"""

import argparse
import hashlib
from pathlib import Path

import numpy as np

import scene_common as c

SIZES = [(800, 600), (1600, 1200), (2000, 1500)]
POINT_SIZE = 0.0021  # point diameter at the camera distance, as a fraction of the width
SCATTER_DIM = 0.45  # docs/05 section 4.1; mix(color, bg, dim) is alpha 1 - dim over bg
OUT = c.ROOT / ".posters-src"


def themes():
    """{theme: (ramp colors, ring color, background hex)} from the token file."""
    out = {}
    for name, tokens in zip(("light", "dark"), c.token_colors()):
        ramp = [c.hex_rgb(tokens[k]) for k in ("ramp-ground", "ramp-mid", "ramp-top")]
        out[name] = (ramp, c.hex_rgb(tokens["concrete"]), tokens["viewport"])
    return out


def scene_state(state, shapes, ramp, ring_rgb):
    """Points, colors and alpha for one state, rings included where visible."""
    if state == "scatter":
        p = c.scatter_points(c.N_POINTS)
        rgb = c.height_colors(p[:, 1], p[:, 1].max(), *ramp)
        return p, rgb, np.full(len(p), 1 - SCATTER_DIM)
    p = shapes[state]
    rgb = c.height_colors(p[:, 1], p[:, 1].max(), *ramp)
    rings = shapes["rings"]
    return (
        np.concatenate([p, rings]),
        np.concatenate([rgb, np.tile(ring_rgb, (len(rings), 1))]),
        np.ones(len(p) + len(rings)),
    )


def render(out_dir=OUT, models=c.MODELS):
    _, shapes = c.read_scene(models)
    out_dir = Path(out_dir)
    for theme, (ramp, ring_rgb, bg) in themes().items():
        for state in ("car", "quad", "scatter"):
            p, rgb, alpha = scene_state(state, shapes, ramp, ring_rgb)
            for w, h in SIZES:
                img = c.flatten(c.rasterize(p, rgb, alpha, w, h, POINT_SIZE * w), bg)
                path = out_dir / f"poster-{state}-{theme}-{w}.png"
                c.write_png(path, img)
                print(f"{path.name}: sha256 {hashlib.sha256(path.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(OUT))
    ap.add_argument("--models", default=str(c.MODELS))
    args = ap.parse_args()
    render(args.out, Path(args.models))
