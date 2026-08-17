import os
from pathlib import Path
from backend.app.convert import docx_to_latex, xlsx_to_latex, pdf_to_latex, escape_latex

BASE_DIR = Path(__file__).resolve().parent
FIXTURES_DIR = BASE_DIR / 'fixtures'


def test_escape_latex():
    assert escape_latex('10% & 5$') == '10\\% \\& 5\\$'


def test_docx_to_latex():
    docx_path = FIXTURES_DIR / 'sample.docx'
    assert docx_path.exists(), 'Le fixture DOCX doit exister'
    tex = docx_to_latex(docx_path)
    assert '\\begin{document}' in tex
    assert 'sample' not in tex.lower() or len(tex) > 0


def test_xlsx_to_latex():
    xlsx_path = FIXTURES_DIR / 'sample.xlsx'
    assert xlsx_path.exists(), 'Le fixture XLSX doit exister'
    tex = xlsx_to_latex(xlsx_path)
    assert '\\begin{tabular}' in tex


def test_pdf_to_latex():
    pdf_path = FIXTURES_DIR / 'sample.pdf'
    assert pdf_path.exists(), 'Le fixture PDF doit exister'
    tex = pdf_to_latex(pdf_path)
    assert '\\begin{document}' in tex



from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_api_system_info():
    response = client.get('/api/system/info')
    assert response.status_code == 200
    data = response.json()
    assert 'gemini_configured' in data
    assert 'latex_compiler' in data
    assert 'max_upload_size_mb' in data


def test_api_invalid_upload():
    response = client.post(
        '/api/upload',
        files={'file': ('test.exe', b'fake binary content', 'application/octet-stream')},
    )
    assert response.status_code == 400

