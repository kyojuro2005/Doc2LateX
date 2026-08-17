# Mémoire de travail

## Chronologie

1. **Analyse du dépôt et de la structure du projet**
   - Étude approfondie des directives strictes du document `imperatif/point_de_verite_site_web.txt`.
   - Élimination des signatures et dégradés IA interdits (suppression du dégradé pourpre/bleu du logo).

2. **Refonte et transition LLM (Anthropic -> OpenAI Exclusif)**
   - Remplacement complet d'Anthropic par OpenAI Vision (`gpt-4o`) avec la clé `OPENAI_API_KEY`.
   - Mise à jour de `config.py`, `convert.py`, `requirements.txt`, `.env.example`, `docker-compose.yml` et `DECISIONS.md`.
   - Correction des caractères d'échappement LaTeX (`escape_latex`) et refonte du prompt pour l'extraction mathématique et tabulaire.
   - Détection automatique et gestion robuste des compilateurs LaTeX locaux (`tectonic`, `pdflatex`, `xelatex`, `lualatex`).

3. **Corrections Backend & Base de données**
   - Modernisation SQLAlchemy 2.0 avec `DeclarativeBase`.
   - Utilisation systématique de `SessionLocal()`.
   - Ajout des points de terminaison `DELETE /api/job/{job_id}` et `GET /api/system/info`.
   - Validation 100% des tests unitaires et d'API via `pytest` (7/7 tests passants).

4. **Refonte Frontend & Ergonomie (Conforme Point de Vérité)**
   - Palette de couleurs artisanale : fond crème `#FAF9F6`, barre latérale charbon `#1C1B18`, accent moutarde `#D9A441`, indicateurs sauge et bordeaux.
   - Typographie soignée : *Libre Baskerville* (titres), *Source Sans 3* (corps) et *JetBrains Mono* (code).
   - Monogramme typographique `\TeX` sur la barre latérale.
   - Éditeur CodeMirror avec raccourci `Ctrl+S`, barre de snippets mathématiques et visionneuse PDF synchronisée.
   - Création de la page **Configuration** (`/settings`) et de la page **Documentation** (`/help`).
   - Service Worker PWA opérationnel (`/sw.js`) et nettoyage des doublons.

## État actuel

- Backend et API : Opérationnels et validés par suite de tests automatisés.
- Frontend React / Vite : Build de production validé (`npm run build` réussi).

