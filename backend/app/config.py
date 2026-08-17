from __future__ import annotations

from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

BASE_DIR = Path(__file__).resolve().parents[1]
RUNTIME_DIR = BASE_DIR / 'runtime'
RUNTIME_DIR.mkdir(exist_ok=True)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3-flash-preview')
BACKEND_PORT = int(os.getenv('BACKEND_PORT', '8000'))
MAX_UPLOAD_SIZE_MB = int(os.getenv('MAX_UPLOAD_SIZE_MB', '20'))
DATABASE_URL = f"sqlite:///{RUNTIME_DIR / 'doc2latex.db'}"

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.pdf', '.docx', '.xlsx'}
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

