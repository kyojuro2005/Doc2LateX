from __future__ import annotations

from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import RUNTIME_DIR, MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB, GEMINI_API_KEY, GEMINI_MODEL
from .database import Base, engine, get_db, SessionLocal
from .models import ConversionJob
from .schemas import JobCreateResponse, JobStatusResponse, TexUpdateRequest
from .utils import is_allowed_file, safe_filename, validate_file_size
from .convert import docx_to_latex, xlsx_to_latex, pdf_to_latex, image_to_latex, compile_latex, find_latex_compiler

app = FastAPI(title='Doc2LaTeX API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)


def get_job(job_id: int, db: Session) -> ConversionJob:
    job = db.get(ConversionJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail='Job non trouvé')
    return job


def run_conversion(job_id: int):
    db = SessionLocal()
    try:
        job = db.get(ConversionJob, job_id)
        if not job:
            return
        source_path = Path(job.source_path)
        ext = source_path.suffix.lower()
        job.status = 'processing'
        db.commit()

        if ext == '.docx':
            tex_content = docx_to_latex(source_path)
        elif ext == '.xlsx':
            tex_content = xlsx_to_latex(source_path)
        elif ext == '.pdf':
            tex_content = pdf_to_latex(source_path)
        elif ext in {'.png', '.jpg', '.jpeg'}:
            tex_content = image_to_latex(source_path)
        else:
            raise RuntimeError(f'Type de fichier non géré: {ext}')

        tex_path = Path(job.source_path).with_suffix('.tex')
        tex_path.write_text(tex_content, encoding='utf-8')
        pdf_path = compile_latex(tex_path, RUNTIME_DIR)
        job.tex_path = str(tex_path)
        job.pdf_path = str(pdf_path)
        job.status = 'completed'
        job.error = None
        db.commit()
    except Exception as exc:
        if job:
            job.status = 'failed'
            job.error = str(exc)
            db.commit()
    finally:
        db.close()


@app.post('/api/upload', response_model=JobCreateResponse)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail='Extension non autorisée. Formats acceptés : .png, .jpg, .jpeg, .pdf, .docx, .xlsx')
    
    content = await file.read()
    try:
        validate_file_size(len(content))
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    
    filename = safe_filename(file.filename)
    output_path = RUNTIME_DIR / filename
    output_path.write_bytes(content)
    
    job = ConversionJob(
        filename=filename,
        content_type=file.content_type or 'application/octet-stream',
        status='pending',
        source_path=str(output_path),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    background_tasks.add_task(run_conversion, job.id)
    return JobCreateResponse(job_id=job.id, status=job.status, message='Fichier reçu. Conversion en cours.')


@app.get('/api/job/{job_id}', response_model=JobStatusResponse)
def get_job_status(job_id: int, db: Session = Depends(get_db)):
    job = get_job(job_id, db)
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        filename=job.filename,
        content_type=job.content_type,
        error=job.error,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@app.get('/api/job/{job_id}/tex')
def get_tex(job_id: int, db: Session = Depends(get_db)):
    job = get_job(job_id, db)
    if not job.tex_path or not Path(job.tex_path).exists():
        raise HTTPException(status_code=404, detail='Fichier .tex non disponible')
    return FileResponse(path=job.tex_path, filename=Path(job.tex_path).name, media_type='text/x-tex')


@app.get('/api/job/{job_id}/pdf')
def get_pdf(job_id: int, db: Session = Depends(get_db)):
    job = get_job(job_id, db)
    if not job.pdf_path or not Path(job.pdf_path).exists():
        raise HTTPException(status_code=404, detail='PDF non disponible')
    return FileResponse(path=job.pdf_path, filename=Path(job.pdf_path).name, media_type='application/pdf')


@app.get('/api/job/{job_id}/tex/content')
def get_tex_content(job_id: int, db: Session = Depends(get_db)):
    """Return the LaTeX source code as JSON text (for inline preview)."""
    job = get_job(job_id, db)
    if not job.tex_path or not Path(job.tex_path).exists():
        raise HTTPException(status_code=404, detail='Fichier .tex non disponible')
    tex_text = Path(job.tex_path).read_text(encoding='utf-8')
    return {'tex': tex_text}



@app.post('/api/job/{job_id}/tex', response_model=JobStatusResponse)
def update_tex(job_id: int, request: TexUpdateRequest, db: Session = Depends(get_db)):
    job = get_job(job_id, db)
    if not job.tex_path:
        raise HTTPException(status_code=404, detail='Fichier .tex non disponible')
    tex_path = Path(job.tex_path)
    tex_path.write_text(request.tex, encoding='utf-8')
    try:
        pdf_path = compile_latex(tex_path, RUNTIME_DIR)
        job.pdf_path = str(pdf_path)
        job.status = 'completed'
        job.error = None
        db.commit()
    except Exception as exc:
        job.status = 'failed'
        job.error = str(exc)
        db.commit()
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        filename=job.filename,
        content_type=job.content_type,
        error=job.error,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@app.delete('/api/job/{job_id}')
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = get_job(job_id, db)
    for path_str in [job.source_path, job.tex_path, job.pdf_path]:
        if path_str:
            p = Path(path_str)
            if p.exists():
                try:
                    p.unlink()
                except Exception:
                    pass
    db.delete(job)
    db.commit()
    return {'message': 'Projet supprimé', 'job_id': job_id}


@app.get('/api/jobs')
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(ConversionJob).order_by(ConversionJob.created_at.desc()).all()
    return [
        JobStatusResponse(
            job_id=j.id,
            status=j.status,
            filename=j.filename,
            content_type=j.content_type,
            error=j.error,
            created_at=j.created_at,
            updated_at=j.updated_at,
        )
        for j in jobs
    ]


@app.get('/api/system/info')
def get_system_info():
    compiler_name = None
    try:
        compiler_name, _ = find_latex_compiler()
    except Exception:
        compiler_name = 'Non détecté'
    return {
        'gemini_configured': bool(GEMINI_API_KEY),
        'gemini_model': GEMINI_MODEL,
        'latex_compiler': compiler_name,
        'max_upload_size_mb': MAX_UPLOAD_SIZE_MB,
    }


@app.get('/api/health')
def health_check():
    return {'status': 'ok'}


# Serve frontend static assets & SPA routes if built
FRONTEND_DIST = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
if FRONTEND_DIST.exists():
    if (FRONTEND_DIST / 'assets').exists():
        app.mount('/assets', StaticFiles(directory=str(FRONTEND_DIST / 'assets')), name='assets')

    @app.get('/{full_path:path}')
    async def serve_spa(full_path: str):
        if full_path.startswith('api/'):
            raise HTTPException(status_code=404, detail='Endpoint non trouvé')
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / 'index.html')


