"""Shared pieces of the offline asset pipeline (docs/05-3d-and-motion.md sections 2 and 6.1).

Mesh readers, area-weighted sampling, the scatter hash, the poster camera and a
small point rasterizer. Only numpy and the standard library are used.
"""

import json
import re
import struct
import zlib
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "src" / "styles" / "tokens.css"
MODELS = ROOT / "public" / "models"

N_POINTS = 30_000
N_RINGS = 1_200
QUANT = 32767
SEED = 20261019

# ---------------------------------------------------------------- mesh input


def read_obj(path):
    """Return {group: (vertices (n, 3), triangles (m, 3))} for a Wavefront OBJ.

    Faces are fan-triangulated. Groups come from `g` lines, which this file
    places before each group's faces.
    """
    verts, groups, cur = [], {}, None
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            if line.startswith("v "):
                verts.append([float(t) for t in line.split()[1:4]])
            elif line.startswith("g "):
                cur = line.split(None, 1)[1].strip()
                groups.setdefault(cur, [])
            elif line.startswith("f "):
                idx = [int(t.split("/")[0]) for t in line.split()[1:]]
                idx = [i - 1 if i > 0 else len(verts) + i for i in idx]
                for k in range(1, len(idx) - 1):
                    groups.setdefault(cur, []).append((idx[0], idx[k], idx[k + 1]))
    v = np.array(verts, dtype=np.float64)
    out = {}
    for name, tris in groups.items():
        t = np.array(tris, dtype=np.int64)
        used, inv = np.unique(t, return_inverse=True)
        out[name] = (v[used], inv.reshape(-1, 3))
    return out


def obj_face_counts(path):
    """{group: polygon faces as written} (before triangulation), for the report."""
    counts, cur = {}, None
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            if line.startswith("g "):
                cur = line.split(None, 1)[1].strip()
                counts.setdefault(cur, 0)
            elif line.startswith("f "):
                counts[cur] = counts.get(cur, 0) + 1
    return counts


_GL_TYPES = {5120: "b", 5121: "B", 5122: "h", 5123: "H", 5125: "I", 5126: "f"}
_GL_WIDTH = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def read_gltf(path):
    """Return {node name: (world vertices, triangles)} for a .gltf with one .bin.

    Node transforms are applied, so the result is in the scene's world space.
    """
    path = Path(path)
    g = json.loads(path.read_text(encoding="utf-8"))
    bins = [(path.parent / b["uri"]).read_bytes() for b in g["buffers"]]

    def accessor(i):
        a = g["accessors"][i]
        view = g["bufferViews"][a["bufferView"]]
        code = _GL_TYPES[a["componentType"]]
        width = _GL_WIDTH[a["type"]]
        size = struct.calcsize(code)
        stride = view.get("byteStride", size * width)
        start = view.get("byteOffset", 0) + a.get("byteOffset", 0)
        buf = bins[view["buffer"]]
        rows = [
            struct.unpack_from("<" + code * width, buf, start + r * stride)
            for r in range(a["count"])
        ]
        return np.array(rows)

    def local(node):
        if "matrix" in node:
            return np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
        m = np.eye(4)
        if "scale" in node:
            m = np.diag([*node["scale"], 1.0]) @ m
        if "rotation" in node:
            x, y, z, w = node["rotation"]
            r = np.array(
                [
                    [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
                ]
            )
            rm = np.eye(4)
            rm[:3, :3] = r
            m = rm @ m
        if "translation" in node:
            t = np.eye(4)
            t[:3, 3] = node["translation"]
            m = t @ m
        return m

    out = {}

    def walk(i, parent):
        node = g["nodes"][i]
        world = parent @ local(node)
        if "mesh" in node:
            for p in g["meshes"][node["mesh"]]["primitives"]:
                if p.get("mode", 4) != 4:
                    continue
                v = accessor(p["attributes"]["POSITION"]).astype(np.float64)
                v = (np.c_[v, np.ones(len(v))] @ world.T)[:, :3]
                t = accessor(p["indices"]).reshape(-1, 3).astype(np.int64)
                out[node.get("name", f"node{i}")] = (v, t)
        for c in node.get("children", []):
            walk(c, world)

    for root in g["scenes"][g.get("scene", 0)]["nodes"]:
        walk(root, np.eye(4))
    return out


def bounds(v):
    return v.min(axis=0), v.max(axis=0)


def islands(v, t):
    """Split a group into connected mesh islands (vertices merged by position).

    Returns a list of (key, triangles) sorted by triangle count, largest first,
    where key = (triangle count, rounded bbox min and max) identifies the island.
    """
    _, inv = np.unique(np.round(v, 4), axis=0, return_inverse=True)
    tt = inv.ravel()[t]
    parent = np.arange(tt.max() + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b, d in tt:
        ra = find(a)
        parent[find(b)] = ra
        parent[find(d)] = ra
    comp = np.array([find(x) for x in tt[:, 0]])
    out = []
    for cid in np.unique(comp):
        tri = t[comp == cid]
        lo, hi = bounds(v[tri.ravel()])
        key = (len(tri), tuple(np.round(lo, 1).tolist()), tuple(np.round(hi, 1).tolist()))
        out.append((key, tri))
    out.sort(key=lambda kt: (-kt[0][0], kt[0][1], kt[0][2]))
    return out


# ---------------------------------------------------------------- sampling


def triangle_areas(v, t):
    a, b, c = v[t[:, 0]], v[t[:, 1]], v[t[:, 2]]
    return 0.5 * np.linalg.norm(np.cross(b - a, c - a), axis=1)


def sample_surface(parts, n, rng):
    """Area-weighted uniform samples over a list of (vertices, triangles)."""
    tris = np.concatenate([v[t] for v, t in parts])  # (m, 3, 3)
    a, b, c = tris[:, 0], tris[:, 1], tris[:, 2]
    area = 0.5 * np.linalg.norm(np.cross(b - a, c - a), axis=1)
    pick = rng.choice(len(tris), size=n, p=area / area.sum())
    r1 = np.sqrt(rng.random(n))
    r2 = rng.random(n)
    w0, w1, w2 = 1 - r1, r1 * (1 - r2), r1 * r2
    return w0[:, None] * a[pick] + w1[:, None] * b[pick] + w2[:, None] * c[pick]


def normalize(p):
    """Center X and Z, lowest point at y = 0, fit a radius-1 sphere around (0, h/2, 0)."""
    p = p.copy()
    lo, hi = bounds(p)
    p[:, 0] -= (lo[0] + hi[0]) / 2
    p[:, 2] -= (lo[2] + hi[2]) / 2
    p[:, 1] -= lo[1]
    center = np.array([0.0, p[:, 1].max() / 2, 0.0])
    return p / np.linalg.norm(p - center, axis=1).max()


# ---------------------------------------------------------------- primitives


def box(center, size):
    cx, cy, cz = center
    sx, sy, sz = (s / 2 for s in size)
    v = np.array(
        [[cx + dx * sx, cy + dy * sy, cz + dz * sz] for dx in (-1, 1) for dy in (-1, 1) for dz in (-1, 1)]
    )
    t = np.array(
        [
            [0, 1, 3], [0, 3, 2], [4, 6, 7], [4, 7, 5],  # x faces
            [0, 4, 5], [0, 5, 1], [2, 3, 7], [2, 7, 6],  # y faces
            [0, 2, 6], [0, 6, 4], [1, 5, 7], [1, 7, 3],  # z faces
        ]
    )
    return v, t


def cylinder(a, b, radius, segments=24):
    """Open-sided tube from point a to point b (caps are hidden inside joints)."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    axis = (b - a) / np.linalg.norm(b - a)
    helper = np.array([0.0, 0.0, 1.0]) if abs(axis[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    u = np.cross(axis, helper)
    u /= np.linalg.norm(u)
    w = np.cross(axis, u)
    ang = np.arange(segments) * 2 * np.pi / segments
    ring = radius * (np.cos(ang)[:, None] * u + np.sin(ang)[:, None] * w)
    v = np.concatenate([a + ring, b + ring])
    t = []
    for i in range(segments):
        j = (i + 1) % segments
        t += [[i, j, segments + j], [i, segments + j, segments + i]]
    return v, np.array(t)


def sphere(center, radius, rows=12, cols=24):
    v = []
    for r in range(rows + 1):
        th = np.pi * r / rows
        for c in range(cols):
            ph = 2 * np.pi * c / cols
            v.append([np.sin(th) * np.cos(ph), np.cos(th), np.sin(th) * np.sin(ph)])
    v = np.array(v) * radius + np.asarray(center, float)
    t = []
    for r in range(rows):
        for c in range(cols):
            i, j = r * cols + c, r * cols + (c + 1) % cols
            t += [[i, j, j + cols], [i, j + cols, i + cols]]
    return v, np.array(t)


# ---------------------------------------------------------------- pairing and output


def morton_order(p, lo, hi):
    """Indices that sort points along a 10-bit-per-axis Z-order curve."""
    q = np.clip(((p - lo) / (hi - lo) * 1023).astype(np.uint64), 0, 1023)

    def spread(x):
        x = (x | (x << 16)) & 0x030000FF
        x = (x | (x << 8)) & 0x0300F00F
        x = (x | (x << 4)) & 0x030C30C3
        x = (x | (x << 2)) & 0x09249249
        return x

    code = spread(q[:, 0]) | (spread(q[:, 1]) << 1) | (spread(q[:, 2]) << 2)
    return np.argsort(code, kind="stable")


def quantize(p, scale):
    return np.round(p / scale * QUANT).clip(-QUANT, QUANT).astype("<i2")


def read_scene(models=MODELS):
    meta = json.loads((models / "scene-points.json").read_text(encoding="utf-8"))
    raw = (models / "scene-points.bin").read_bytes()
    shapes = {}
    for s in meta["shapes"]:
        a = np.frombuffer(raw, dtype="<i2", count=s["points"] * 3, offset=s["offsetBytes"])
        shapes[s["name"]] = a.reshape(-1, 3).astype(np.float64) / meta["quant"] * s["scale"]
    return meta, shapes


# ---------------------------------------------------------------- scatter hash
# The GLSL version lives in docs/05 section 3.2; both must give the test vectors.

M32 = 0xFFFFFFFF


def pcg_hash(v):
    """PCG-RXS-M-XS 32-bit hash, on numpy uint32 arrays or Python ints."""
    v = np.asarray(v, dtype=np.uint64) & M32
    state = (v * 747796405 + 2891336453) & M32
    word = (((state >> ((state >> 28) + 4)) ^ state) * 277803737) & M32
    return ((word >> 22) ^ word) & M32


def to_unit(h):
    return np.asarray(h, dtype=np.float64) * (1.0 / 4294967296.0)


def scatter_points(n):
    """Scatter state: a loose cloud around the subject, a ball of radius 1.3
    squashed to 0.45 in height and resting on y = 0.05 (docs/05 section 3.2)."""
    h1 = pcg_hash(np.arange(n))
    h2 = pcg_hash(h1)
    h3 = pcg_hash(h2)
    r = 1.3 * np.cbrt(to_unit(h1))
    ang = 6.283185307179586 * to_unit(h2)
    cos_t = 2.0 * to_unit(h3) - 1.0
    sin_t = np.sqrt(1.0 - cos_t * cos_t)
    return np.stack(
        [r * sin_t * np.cos(ang), 0.635 + 0.45 * r * cos_t, r * sin_t * np.sin(ang)], axis=1
    )


# ---------------------------------------------------------------- colors


def token_colors():
    """Light-theme and dark-theme hex values from the token file."""
    css = re.sub(r"/\*[\s\S]*?\*/", "", TOKENS.read_text(encoding="utf-8"))
    dark_at = css.index("@media (prefers-color-scheme: dark)")

    def grab(block):
        return dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;", block))

    light = grab(css[:dark_at])
    return light, {**light, **grab(css[dark_at:])}


def hex_rgb(h):
    return np.array([int(h[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float64) / 255


def height_colors(y, height_max, ground, mid, top):
    """The scene's two-segment ramp: ground to mid to top (docs/05 section 3.2)."""
    h = np.clip(y / height_max, 0, 1)[:, None]
    lo = ground + (mid - ground) * np.clip(h * 2, 0, 1)
    return np.where(h < 0.5, lo, mid + (top - mid) * np.clip(h * 2 - 1, 0, 1))


# ---------------------------------------------------------------- camera and raster
# Base view (docs/05 section 3.5): yaw 0 looks at the car's left side (+Z), and
# positive yaw swings the camera toward the front (+X).

FOV_DEG = 35.0
YAW_DEG = 28.0
PITCH_DEG = 14.0
CAM_DISTANCE = 4.0  # scene units; the car spans about 58 % of the width
CAM_TARGET_Y = 0.32  # scene units; the car's vertical middle


def view_proj(width, height, yaw=YAW_DEG, pitch=PITCH_DEG, distance=CAM_DISTANCE):
    yw, pt = np.radians(yaw), np.radians(pitch)
    target = np.array([0.0, CAM_TARGET_Y, 0.0])
    eye = target + distance * np.array([np.sin(yw) * np.cos(pt), np.sin(pt), np.cos(yw) * np.cos(pt)])
    f = (target - eye) / np.linalg.norm(target - eye)
    r = np.cross(f, [0.0, 1.0, 0.0])
    r /= np.linalg.norm(r)
    u = np.cross(r, f)
    focal = (height / 2) / np.tan(np.radians(FOV_DEG) / 2)
    return eye, r, u, f, focal


def project(p, width, height, **cam):
    eye, r, u, f, focal = view_proj(width, height, **cam)
    d = p - eye
    z = d @ f
    sx = width / 2 + focal * (d @ r) / z
    sy = height / 2 - focal * (d @ u) / z
    return sx, sy, z, focal


def rasterize(p, rgb, alpha, width, height, size_px, **cam):
    """Round points, far to near, each a disc with a 1 px soft edge, onto a
    transparent canvas. Returns straight-alpha RGBA uint8.

    size_px is the diameter at the camera distance; nearer points draw larger.
    """
    sx, sy, z, _ = project(p, width, height, **cam)
    dist0 = cam.get("distance", CAM_DISTANCE)
    radius = np.maximum(size_px * dist0 / z / 2, 0.75)
    order = np.argsort(-z, kind="stable")
    acc = np.zeros((height, width, 3))  # premultiplied color
    cov = np.zeros((height, width))
    for i in order:
        x, y, rad = sx[i], sy[i], radius[i]
        x0, x1 = int(np.floor(x - rad - 1)), int(np.ceil(x + rad + 1))
        y0, y1 = int(np.floor(y - rad - 1)), int(np.ceil(y + rad + 1))
        x0c, x1c, y0c, y1c = max(x0, 0), min(x1, width), max(y0, 0), min(y1, height)
        if x0c >= x1c or y0c >= y1c:
            continue
        gx = np.arange(x0c, x1c) + 0.5 - x
        gy = np.arange(y0c, y1c) + 0.5 - y
        d = np.sqrt(gx[None, :] ** 2 + gy[:, None] ** 2)
        a = np.clip(rad + 0.5 - d, 0, 1) * alpha[i]
        sl = (slice(y0c, y1c), slice(x0c, x1c))
        acc[sl] = rgb[i] * a[..., None] + acc[sl] * (1 - a[..., None])
        cov[sl] = a + cov[sl] * (1 - a)
    out = np.zeros((height, width, 4))
    nz = cov > 0
    out[nz, :3] = acc[nz] / cov[nz, None]
    out[..., 3] = cov
    return np.round(out * 255).clip(0, 255).astype(np.uint8)


def flatten(rgba, bg_hex):
    """Composite a straight-alpha RGBA image over a solid color (for previews)."""
    bg = hex_rgb(bg_hex) * 255
    a = rgba[..., 3:4] / 255
    return np.round(rgba[..., :3] * a + bg * (1 - a)).astype(np.uint8)


def write_png(path, img):
    """Deterministic 8-bit PNG (RGB or RGBA), filter 0, zlib level 9."""
    img = np.ascontiguousarray(img, dtype=np.uint8)
    h, w = img.shape[:2]
    channels = img.shape[2]
    color_type = {3: 2, 4: 6}[channels]
    raw = b"".join(b"\x00" + img[y].tobytes() for y in range(h))

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, color_type, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_bytes(png)
