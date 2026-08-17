# Doc2LaTeX

Doc2LaTeX est une PWA permettant de convertir des documents (images, PDF, DOCX, XLSX) en fichier LaTeX compilable avec aperçu PDF et éditeur intégré.

## Structure

- `frontend/` : application React + Vite + Tailwind CSS + CodeMirror
- `backend/` : API FastAPI + conversion et compilation LaTeX
- `tests/` : tests Python pour le backend
- `imperatif/` : directives de design obligatoires

## Installation

### Prérequis

- Python 3.12+
- Node.js 18+ / npm
- Un compilateur LaTeX installé (`pdflatex`, `xelatex`, `lualatex` ou `tectonic`)
- Docker et Docker Compose (optionnel)

### Backend

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
```

Créer un fichier `backend/.env` à partir de `backend/.env.example` et y renseigner votre clé OpenAI.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `OPENAI_API_KEY` | Oui (pour images/PDF scannés) | Clé API OpenAI pour la conversion vision |
| `OPENAI_MODEL` | Non (défaut : `gpt-4o`) | Modèle OpenAI à utiliser |
| `BACKEND_PORT` | Non (défaut : `8000`) | Port du serveur backend |
| `MAX_UPLOAD_SIZE_MB` | Non (défaut : `20`) | Taille max d'upload en Mo |

## Tests

```bash
python -m pytest tests/ -v
```
