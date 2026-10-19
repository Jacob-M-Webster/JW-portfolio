"""Generic quadruped and range rings (docs/05-3d-and-motion.md sections 2.5 and 2.6).

    python scripts/make_quadruped.py --preview DIR

Built from primitives only; no third-party model. mesh_to_points.py imports
these functions so both shapes are paired in one pass.
"""

import argparse
import sys
from pathlib import Path

import numpy as np

import scene_common as c

HIP_Y = 0.58
UPPER = 0.34
LOWER = 0.34
FOOT_R = 0.04
UPPER_ANGLE = 30.0  # degrees from vertical: front legs forward, hind legs back


def leg(hip_x, hip_z, forward):
    """Upper leg, lower leg and foot; the foot lands at y = FOOT_R."""
    s = 1.0 if forward else -1.0
    a = np.radians(UPPER_ANGLE)
    hip = np.array([hip_x, HIP_Y, hip_z])
    knee = hip + UPPER * np.array([s * np.sin(a), -np.cos(a), 0.0])
    drop = knee[1] - FOOT_R
    b = np.arccos(np.clip(drop / LOWER, -1, 1))
    foot = knee + LOWER * np.array([-s * np.sin(b), -np.cos(b), 0.0])
    return [
        c.cylinder(hip, knee, 0.035),
        c.cylinder(knee, foot, 0.028),
        c.sphere(knee, 0.036),
        c.sphere(foot, FOOT_R),
    ]


def quadruped_parts():
    parts = [
        c.box((0.0, 0.62, 0.0), (1.00, 0.22, 0.38)),  # body
        c.box((0.55, 0.72, 0.0), (0.18, 0.14, 0.30)),  # head or sensor pod
    ]
    for hx in (0.38, -0.38):
        for hz in (0.22, -0.22):
            parts += leg(hx, hz, forward=hx > 0)
    return parts


def make_quadruped(seed, n=c.N_POINTS):
    rng = np.random.default_rng(seed)
    return c.normalize(c.sample_surface(quadruped_parts(), n, rng))


def make_rings(n=c.N_RINGS):
    """Five rings (radii 0.6 to 3.0) in the ground plane plus eight radial ticks."""
    radii = [0.6, 1.2, 1.8, 2.4, 3.0]
    ticks, per_tick = 8, 15
    ring_total = n - ticks * per_tick
    counts = [round(ring_total * r / sum(radii)) for r in radii]
    counts[-1] = ring_total - sum(counts[:-1])
    pts = []
    for r, k in zip(radii, counts):
        ang = np.arange(k) * 2 * np.pi / k
        pts.append(np.stack([r * np.cos(ang), np.zeros(k), r * np.sin(ang)], axis=1))
    for i in range(ticks):
        ang = i * 2 * np.pi / ticks + np.pi / ticks
        rr = np.linspace(2.4, 3.0, per_tick + 2)[1:-1]
        pts.append(np.stack([rr * np.cos(ang), np.zeros(per_tick), rr * np.sin(ang)], axis=1))
    return np.concatenate(pts)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", metavar="DIR", required=True)
    out = Path(ap.parse_args().preview).resolve()
    if c.ROOT in out.parents:
        sys.exit("preview: write previews outside the repo")
    light, _ = c.token_colors()
    ramp = [c.hex_rgb(light[k]) for k in ("ramp-ground", "ramp-mid", "ramp-top")]
    p = make_quadruped(c.SEED + 1)
    rgb = c.height_colors(p[:, 1], p[:, 1].max(), *ramp)
    views = [
        c.flatten(c.rasterize(p, rgb, np.ones(len(p)), 800, 600, 2.4, yaw=yaw), light["viewport"])
        for yaw in (0.0, c.YAW_DEG)
    ]
    c.write_png(out / "quadruped.png", np.concatenate(views, axis=1))
    print("preview:", out / "quadruped.png")
