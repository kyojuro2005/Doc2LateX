from __future__ import annotations

import os
import shutil
import subprocess
import re
import base64
from pathlib import Path

import fitz  # PyMuPDF
import docx
import openpyxl
from google import genai
from google.genai import types

from .config import RUNTIME_DIR, GEMINI_API_KEY, GEMINI_MODEL


def tex_template(document_body: str, use_exam_class: bool = False) -> str:
    document_class = 'exam' if use_exam_class else 'article'
    return f"""\\documentclass[12pt]{{{document_class}}}
\\usepackage[T1]{{fontenc}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{amsmath,amssymb,amsfonts,mathtools}}
\\usepackage{{booktabs}}
\\usepackage{{geometry}}
\\geometry{{margin=2.5cm}}
\\usepackage{{hyperref}}
\\usepackage{{enumitem}}
\\begin{{document}}
{document_body}
\\end{{document}}
"""


def escape_latex(text: str) -> str:
    replacements = {
        '\\': r'\textbackslash{}',
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
    }
    return ''.join(replacements.get(ch, ch) for ch in text)


def clean_llm_latex_response(text: str) -> str:
    text = text.strip()
    # Strip markdown codeblocks if present (e.g. ```latex ... ```)
    if text.startswith('```'):
        lines = text.splitlines()
        if lines and lines[0].startswith('```'):
            lines = lines[1:]
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        text = '\n'.join(lines).strip()

    # If the response already contains a full document, extract the body
    if r'\begin{document}' in text and r'\end{document}' in text:
        match = re.search(r'\\begin\{document\}(.*?)\\end\{document\}', text, re.DOTALL)
        if match:
            return match.group(1).strip()
    return text


def docx_to_latex(docx_path: Path) -> str:
    document = docx.Document(docx_path)
    lines: list[str] = []
    in_list = False

    for para in document.paragraphs:
        style = para.style.name.lower() if para.style else ''
        text = para.text.strip()
        if not text:
            if in_list:
                lines.append('\\end{itemize}')
                in_list = False
            continue

        if 'heading' in style:
            if in_list:
                lines.append('\\end{itemize}')
                in_list = False
            level = 1
            try:
                level = int(style.replace('heading', '').strip())
            except ValueError:
                pass
            section_cmd = 'sub' * max(0, level - 1) + 'section'
            lines.append(f'\\{section_cmd}{{{escape_latex(text)}}}')
        elif para.style.name.startswith('List') or 'bullet' in style:
            if not in_list:
                lines.append('\\begin{itemize}')
                in_list = True
            lines.append(f'\\item {escape_latex(text)}')
        else:
            if in_list:
                lines.append('\\end{itemize}')
                in_list = False
            lines.append(f'{escape_latex(text)}\\\\')

    if in_list:
        lines.append('\\end{itemize}')

    # Process tables if any
    for table in document.tables:
        col_count = len(table.columns)
        if col_count == 0:
            continue
        lines.append('\\begin{table}[h]')
        lines.append('\\centering')
        lines.append(f'\\begin{{tabular}}{{{ "l" * col_count }}}')
        lines.append('\\toprule')
        for i, row in enumerate(table.rows):
            row_cells = [escape_latex(cell.text.strip()) for cell in row.cells]
            lines.append(' & '.join(row_cells) + ' \\\\')
            if i == 0:
                lines.append('\\midrule')
        lines.append('\\bottomrule')
        lines.append('\\end{tabular}')
        lines.append('\\end{table}')

    return tex_template('\n'.join(lines))


def xlsx_to_latex(xlsx_path: Path) -> str:
    workbook = openpyxl.load_workbook(xlsx_path, data_only=True)
    body: list[str] = []
    for sheet in workbook.worksheets:
        body.append(f'\\section*{{{escape_latex(sheet.title)}}}')
        max_row = sheet.max_row or 0
        max_col = sheet.max_column or 0
        if max_row == 0 or max_col == 0:
            continue
        body.append(f'\\begin{{tabular}}{{{ "l" * max_col }}}')
        body.append('\\toprule')
        rows: list[str] = []
        is_first = True
        for row in sheet.iter_rows(values_only=True):
            cells = [escape_latex(str(cell)) if cell is not None else '' for cell in row]
            rows.append(' & '.join(cells) + ' \\\\')
            if is_first:
                rows.append('\\midrule')
                is_first = False
        body.append('\n'.join(rows))
        body.append('\\bottomrule')
        body.append('\\end{tabular}')
        body.append('')
    return tex_template('\n'.join(body))


def pdf_to_latex(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    body: list[str] = []
    has_text = False

    for page in doc:
        text = page.get_text('text').strip()
        if text:
            has_text = True
            for line in text.splitlines():
                line = line.strip()
                if line:
                    body.append(escape_latex(line) + '\\\\')

    # If the PDF is scanned / empty text, convert first page to image and use Gemini Vision
    if not has_text and len(doc) > 0 and GEMINI_API_KEY:
        pix = doc[0].get_pixmap(dpi=150)
        temp_img = pdf_path.with_suffix('.page1.png')
        pix.save(str(temp_img))
        try:
            return image_to_latex(temp_img)
        finally:
            if temp_img.exists():
                temp_img.unlink()

    return tex_template('\n'.join(body) if body else '% Aucun texte extrait du PDF')


def image_to_latex(image_path: Path) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "Aucune clé API Gemini (GEMINI_API_KEY) n'est configurée. "
            "Obtenez une clé gratuite sur https://aistudio.google.com/app/apikey"
        )

    client = genai.Client(api_key=GEMINI_API_KEY)

    with image_path.open('rb') as f:
        image_bytes = f.read()

    suffix = image_path.suffix.lower()
    media_type_map = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}
    media_type = media_type_map.get(suffix, 'image/png')

    prompt = (
        "Vous êtes un expert en conversion de documents en code LaTeX de haute qualité.\n"
        "Analysez l'image fournie et transcrivez fidèlement l'intégralité du contenu en code LaTeX structuré.\n"
        "Directives :\n"
        "1. Conservez scrupuleusement la hiérarchie des titres (\\section, \\subsection, etc.).\n"
        "2. Formatez toutes les équations et formules mathématiques avec une syntaxe rigoureuse "
        "($...$ en ligne, \\[...\\] ou \\begin{equation} en bloc, \\frac, \\sum, matrices, symboles grecs, etc.).\n"
        "3. Convertissez les tableaux en environnements LaTeX 'tabular' ou 'table' avec booktabs "
        "(\\toprule, \\midrule, \\bottomrule).\n"
        "4. Utilisez des listes ordonnées ou à puces (\\begin{enumerate}, \\begin{itemize}).\n"
        "5. Ne retournez QUE le corps du document LaTeX (sans balises markdown ```latex et sans explications conversationnelles)."
    )

    image_part = types.Part.from_bytes(data=image_bytes, mime_type=media_type)
    
    # Try preferred model and fallbacks
    models_to_try = [GEMINI_MODEL, 'gemini-3-flash-preview', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest']
    # Deduplicate while preserving order
    seen = set()
    models_to_try = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    body = ''
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[image_part, prompt]
            )
            body = response.text or ''
            if body:
                break
        except Exception as e:
            last_error = e
            continue

    if not body and last_error:
        raise RuntimeError(f"Erreur lors de la transcription Gemini Vision : {last_error}")

    clean_body = clean_llm_latex_response(body)
    return tex_template(clean_body)


def find_latex_compiler() -> tuple[str, list[str]]:
    # Check available compilers in order of preference
    if shutil.which('tectonic'):
        return 'tectonic', ['tectonic', '{tex}', '--outdir', '{outdir}', '--keep-logs', '--quiet']
    if shutil.which('pdflatex'):
        return 'pdflatex', ['pdflatex', '-enable-installer', '-interaction=nonstopmode', '-output-directory', '{outdir}', '{tex}']
    if shutil.which('xelatex'):
        return 'xelatex', ['xelatex', '-interaction=nonstopmode', '-output-directory', '{outdir}', '{tex}']
    if shutil.which('lualatex'):
        return 'lualatex', ['lualatex', '-interaction=nonstopmode', '-output-directory', '{outdir}', '{tex}']
    raise FileNotFoundError("Aucun compilateur LaTeX (tectonic, pdflatex, xelatex, lualatex) n'a été trouvé sur le système.")


def compile_latex(tex_path: Path, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = output_dir / (tex_path.stem + '.pdf')
    compiler_name, cmd_template = find_latex_compiler()

    cmd = [arg.replace('{tex}', str(tex_path)).replace('{outdir}', str(output_dir)) for arg in cmd_template]

    process = subprocess.run(cmd, capture_output=True, text=True, timeout=300, cwd=output_dir)

    if process.returncode != 0 and not pdf_path.exists():
        log_file = output_dir / (tex_path.stem + '.log')
        log_content = ''
        if log_file.exists():
            log_lines = log_file.read_text(encoding='latin-1', errors='ignore').splitlines()
            log_content = '\n'.join(log_lines[-25:])
        error_msg = f"Échec de la compilation avec {compiler_name} (code {process.returncode}).\n{process.stderr}\n{log_content}"
        raise RuntimeError(error_msg.strip())

    return pdf_path
