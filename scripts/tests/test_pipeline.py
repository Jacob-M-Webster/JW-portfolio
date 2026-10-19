"""Unit tests for the offline asset pipeline (docs/05-3d-and-motion.md section 2.7).

    python -m unittest discover -s scripts/tests -v
"""

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import scene_common as c  # noqa: E402
import make_quadruped  # noqa: E402

HAVE_PRIVATE = (c.ROOT / "assets-private").is_dir()

# docs/05 section 3.2: the shader's hash must give the same values.
HASH_VECTORS = {0: 0x07BB2FE2, 1: 0xA8BEEA3C, 12345: 0xF45EAD0E}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class Hash(unittest.TestCase):
    def test_vectors(self):
        for i, want in HASH_VECTORS.items():
            self.assertEqual(int(c.pcg_hash(i)), want, f"hash({i})")

    def test_vectors_match_plain_integer_version(self):
        # A second implementation on Python ints, written like the GLSL in docs/05.
        def ref(v):
            state = (v * 747796405 + 2891336453) & 0xFFFFFFFF
            word = (((state >> ((state >> 28) + 4)) ^ state) * 277803737) & 0xFFFFFFFF
            return ((word >> 22) ^ word) & 0xFFFFFFFF

        idx = np.arange(0, 200_000, 7)
        self.assertTrue(np.array_equal(c.pcg_hash(idx), [ref(int(i)) for i in idx]))


class SceneData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.meta, cls.shapes = c.read_scene()
        cls.raw = (c.MODELS / "scene-points.bin").read_bytes()

    def test_counts_match_manifest(self):
        self.assertEqual(self.meta["count"], c.N_POINTS)
        total = 0
        for s in self.meta["shapes"]:
            self.assertEqual(len(self.shapes[s["name"]]), s["points"])
            self.assertEqual(s["offsetBytes"], total)
            total += s["points"] * 6
        self.assertEqual(total, len(self.raw))
        self.assertEqual([s["name"] for s in self.meta["shapes"]], ["car", "quad", "rings"])
        self.assertEqual(self.meta["shapes"][2]["points"], c.N_RINGS)

    def test_coordinates_in_range(self):
        q = np.frombuffer(self.raw, dtype="<i2")
        self.assertGreaterEqual(int(q.min()), -c.QUANT)
        self.assertLessEqual(int(q.max()), c.QUANT)

    def test_shapes_normalized(self):
        for name in ("car", "quad"):
            p = self.shapes[name]
            self.assertAlmostEqual(p[:, 1].min(), 0.0, places=3, msg=name)
            center = np.array([0.0, p[:, 1].max() / 2, 0.0])
            self.assertLessEqual(np.linalg.norm(p - center, axis=1).max(), 1.0 + 1e-3, name)
        lo, hi = c.bounds(self.shapes["car"])
        self.assertGreater(hi[0] - lo[0], hi[2] - lo[2], "car is longer along +X than it is wide")

    def test_prefix_is_unbiased(self):
        for name in ("car", "quad"):
            p = self.shapes[name]
            lo, hi = c.bounds(p)
            plo, phi = c.bounds(p[:12_000])
            tol = 0.05 * (hi - lo)
            self.assertTrue(np.all(np.abs(plo - lo) <= tol), f"{name} prefix min {plo} vs {lo}")
            self.assertTrue(np.all(np.abs(phi - hi) <= tol), f"{name} prefix max {phi} vs {hi}")

    def test_sizes_in_budget(self):
        import zlib

        for s in self.meta["shapes"]:
            self.assertLessEqual(s["points"] * 6, 200 * 1024, s["name"])
        self.assertLessEqual(len(self.raw), 450 * 1024)
        # Brotli is measured by check:assets (Node); zlib here is a looser upper bound.
        self.assertLess(len(zlib.compress(self.raw, 9)), 450 * 1024)


class Quadruped(unittest.TestCase):
    def test_deterministic(self):
        a = make_quadruped.make_quadruped(c.SEED + 1)
        b = make_quadruped.make_quadruped(c.SEED + 1)
        self.assertTrue(np.array_equal(a, b))

    def test_four_feet_on_the_ground(self):
        p = make_quadruped.make_quadruped(c.SEED + 1)
        low = p[p[:, 1] < 0.02]
        # Feet sit at the four corners: both signs of x and of z.
        for sx in (1, -1):
            for sz in (1, -1):
                self.assertTrue(np.any((np.sign(low[:, 0]) == sx) & (np.sign(low[:, 2]) == sz)))

    def test_rings(self):
        r = make_quadruped.make_rings()
        self.assertEqual(len(r), c.N_RINGS)
        self.assertTrue(np.all(r[:, 1] == 0))
        self.assertAlmostEqual(np.linalg.norm(r[:, [0, 2]], axis=1).max(), 3.0, places=6)


@unittest.skipUnless(HAVE_PRIVATE, "assets-private/ is not here; the sampler needs the purchased model")
class Determinism(unittest.TestCase):
    def test_sampler_twice(self):
        import mesh_to_points

        with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
            mesh_to_points.build(a)
            mesh_to_points.build(b)
            for f in ("scene-points.bin", "scene-points.json"):
                self.assertEqual(sha(Path(a) / f), sha(Path(b) / f), f)
                self.assertEqual(sha(Path(a) / f), sha(c.MODELS / f), f"{f} matches the committed file")


class PosterDeterminism(unittest.TestCase):
    def test_render_twice(self):
        import render_poster

        with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
            render_poster.render(a)
            render_poster.render(b)
            names = sorted(p.name for p in Path(a).glob("*.png"))
            self.assertEqual(len(names), 18)
            for n in names:
                self.assertEqual(sha(Path(a) / n), sha(Path(b) / n), n)


class Manifest(unittest.TestCase):
    def test_json_shape(self):
        meta = json.loads((c.MODELS / "scene-points.json").read_text(encoding="utf-8"))
        self.assertEqual(meta["version"], 1)
        self.assertEqual(meta["quant"], 32767)
        self.assertEqual(len(meta["sourceHash"]), 64)


if __name__ == "__main__":
    unittest.main()
