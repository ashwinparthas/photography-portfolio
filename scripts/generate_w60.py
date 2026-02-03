#!/usr/bin/env python3

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path


IMG_EXTS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
SUFFIX_RE = re.compile(r"-w(\d+)$")


def get_dimensions(path: Path) -> tuple[int, int]:
    proc = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Failed to read image size for {path}")

    width = height = None
    for line in proc.stdout.splitlines():
        if "pixelWidth:" in line:
            width = int(line.split(":")[-1].strip())
        if "pixelHeight:" in line:
            height = int(line.split(":")[-1].strip())

    if not width or not height:
        raise RuntimeError(f"Missing pixel size info for {path}")

    return width, height


def generate_w60(path: Path) -> None:
    width, height = get_dimensions(path)
    out_path = path.with_name(f"{path.stem}-w60{path.suffix}")
    new_w = max(1, int(round(width * 0.6)))
    new_h = max(1, int(round(height * 0.6)))

    cmd = ["sips"]
    if path.suffix.lower() in {".jpg", ".jpeg"}:
        cmd += ["-s", "formatOptions", "60"]
    cmd += ["-z", str(new_h), str(new_w), str(path), "--out", str(out_path)]

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(f"Failed to write {out_path}: {proc.stderr.strip()}")


def main() -> int:
    if not shutil.which("sips"):
        print("Error: 'sips' is required (macOS) and was not found.")
        return 1

    root = Path(__file__).resolve().parents[1]
    photos_dir = root / "public" / "photos"
    if not photos_dir.exists():
        print(f"Error: {photos_dir} not found.")
        return 1

    originals: list[Path] = []
    extra_variants: list[Path] = []

    for path in photos_dir.rglob("*"):
        if not path.is_file() or path.suffix not in IMG_EXTS:
            continue

        match = SUFFIX_RE.search(path.stem)
        if match:
            if match.group(1) != "60":
                extra_variants.append(path)
            continue

        originals.append(path)

    generated = 0
    for index, path in enumerate(originals, 1):
        try:
            generate_w60(path)
            generated += 1
        except RuntimeError as exc:
            print(str(exc))
        if index % 20 == 0:
            print(f"Processed {index}/{len(originals)} originals")

    removed = 0
    for path in extra_variants:
        try:
            path.unlink()
            removed += 1
        except OSError as exc:
            print(f"Failed to remove {path}: {exc}")

    print(f"Generated {generated} w60 images.")
    print(f"Removed {removed} old variants.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
