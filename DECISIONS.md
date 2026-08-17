# DECISIONS

- Compilateurs LaTeX supportés : détection dynamique automatique (`tectonic`, `pdflatex`, `xelatex`, `lualatex`) avec remontée précise des logs d'erreurs en cas d'échec de compilation.
- Le backend stocke les fichiers de travail dans `backend/runtime/` et indexe les projets via SQLite locale (`doc2latex.db`).
- Les conversions `.docx` et `.xlsx` sont traitées en local sans LLM avec conversion typographique soignée (styles, tableaux booktabs, listes).
- Les images (`.png`, `.jpg`, `.jpeg`) et PDF scannés sont convertis exclusivement via l'API OpenAI Vision (`gpt-4o`) à l'aide de la clé `OPENAI_API_KEY`.
- Le frontend propose une interface artisanale et typographique sobre (sans dégradé IA pourpre/bleu), un éditeur CodeMirror et un visualiseur PDF synchronisé.
- Le PWA est assuré par un manifeste statique (`manifest.json`) et un service worker.

