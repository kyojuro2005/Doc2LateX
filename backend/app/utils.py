from __future__ import annotations

import re
from pathlib import Path
from .config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_BYTES


def is_allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def safe_filename(filename: str) -> str:
    filename = Path(filename).name
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    return filename


def validate_file_size(size: int) -> None:
    if size > MAX_UPLOAD_SIZE_BYTES:
        raise ValueError(f'Fichier trop volumineux ({size} bytes), maximum {MAX_UPLOAD_SIZE_BYTES} bytes')
