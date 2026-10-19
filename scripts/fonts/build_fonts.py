"""Subset the two site fonts to Latin and write WOFF2 files to public/fonts/.

Run by hand, offline; never part of the production build.

    python -m venv .venv && .venv/bin/pip install fonttools brotli
    python -I scripts/fonts/build_fonts.py <src-dir> <fallback-dir>

<src-dir> holds the google/fonts files:
    overpass/Overpass[wght].ttf, overpass/OFL.txt
    sourceserif4/SourceSerif4[opsz,wght].ttf, sourceserif4/OFL.txt
<fallback-dir> holds arial.ttf and georgia.ttf (for fallback metrics).

Source Serif 4 carries the Reserved Font Name "Source" in its copyright
notice, so the subset is renamed "JW Serif" (OFL section 3).
"""

import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "fonts"

# Google Fonts' "latin" unicode-range.
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
    "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,"
    "U+FEFF,U+FFFD"
)
FEATURES = ["ccmp", "locl", "mark", "mkmk", "kern", "liga", "calt", "tnum", "lnum", "pnum", "case"]

# English letter frequencies (per 1000) plus space, for an average text width.
FREQ = {
    " ": 180, "e": 102, "t": 75, "a": 66, "o": 61, "i": 57, "n": 57, "s": 53,
    "h": 49, "r": 49, "d": 35, "l": 33, "u": 23, "c": 23, "m": 20, "w": 19,
    "f": 18, "g": 16, "y": 16, "p": 15, "b": 12, "v": 8, "k": 6, "j": 1,
    "x": 1, "q": 1, "z": 1,
}


def avg_width(font: TTFont) -> float:
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    upm = font["head"].unitsPerEm
    total = sum(FREQ.values())
    return sum(hmtx[cmap[ord(ch)]][0] * n for ch, n in FREQ.items()) / total / upm


def overrides(font: TTFont, fallback: TTFont) -> dict:
    size_adjust = avg_width(font) / avg_width(fallback)
    upm = font["head"].unitsPerEm
    hhea = font["hhea"]
    return {
        "size-adjust": f"{size_adjust * 100:.2f}%",
        "ascent-override": f"{hhea.ascent / upm / size_adjust * 100:.2f}%",
        "descent-override": f"{abs(hhea.descent) / upm / size_adjust * 100:.2f}%",
        "line-gap-override": f"{hhea.lineGap / upm / size_adjust * 100:.2f}%",
    }


def rename(font: TTFont, family: str, postscript: str) -> None:
    name = font["name"]
    for rec in list(name.names):
        if rec.nameID in (1, 3, 4, 6, 16, 17, 25):
            name.removeNames(nameID=rec.nameID)
    name.setName(family, 1, 3, 1, 0x409)
    name.setName("Regular", 2, 3, 1, 0x409)
    name.setName(f"{postscript};subset", 3, 3, 1, 0x409)
    name.setName(f"{family} Regular", 4, 3, 1, 0x409)
    name.setName(postscript, 6, 3, 1, 0x409)
    for table in ("STAT",):
        if table in font:
            del font[table]


def subset_font(font: TTFont) -> None:
    options = subset.Options()
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.desubroutinize = True
    sub = subset.Subsetter(options)
    sub.populate(unicodes=subset.parse_unicodes(LATIN))
    sub.subset(font)


def save_woff2(font: TTFont, dest: Path) -> None:
    font.flavor = "woff2"
    font.save(dest)


def main(src: Path, fallbacks: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    arial = TTFont(fallbacks / "arial.ttf")
    georgia = TTFont(fallbacks / "georgia.ttf")

    # Subset before instancing: the instancer leaves gvar entries the subsetter can't resolve.
    overpass = TTFont(src / "overpass" / "Overpass[wght].ttf")
    subset_font(overpass)
    overpass = instancer.instantiateVariableFont(overpass, {"wght": (400, 800)})
    sans_metrics = overrides(overpass, arial)
    save_woff2(overpass, OUT / "overpass-latin.woff2")
    shutil.copyfile(src / "overpass" / "OFL.txt", OUT / "LICENSE-Overpass-OFL.txt")

    serif = TTFont(src / "sourceserif4" / "SourceSerif4[opsz,wght].ttf")
    subset_font(serif)
    serif = instancer.instantiateVariableFont(serif, {"wght": 400, "opsz": 18})
    rename(serif, "JW Serif", "JWSerif-Regular")
    serif_metrics = overrides(serif, georgia)
    save_woff2(serif, OUT / "serif-latin.woff2")
    shutil.copyfile(src / "sourceserif4" / "OFL.txt", OUT / "LICENSE-SourceSerif4-OFL.txt")

    for label, metrics, local in (
        ("Overpass fallback", sans_metrics, "Arial"),
        ("JW Serif fallback", serif_metrics, "Georgia"),
    ):
        print(f'@font-face {{ font-family: "{label}"; src: local("{local}");')
        for key, value in metrics.items():
            print(f"  {key}: {value};")
        print("}")

    for path in sorted(OUT.glob("*.woff2")):
        print(f"{path.name}: {path.stat().st_size} bytes")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
