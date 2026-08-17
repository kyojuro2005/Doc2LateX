import { FileText, Code2, Keyboard, Layers } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto font-sans">
      {/* Title */}
      <div className="mb-8 border-b border-surface-border pb-6">
        <h1 className="font-serif font-bold text-2xl lg:text-3xl text-charcoal tracking-tight">
          Documentation & Guide d'utilisation
        </h1>
        <p className="text-stone-600 mt-1.5 text-sm">
          Guide technique pour la conversion de documents, la syntaxe mathématique et la compilation TeX.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Processus de conversion */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border/60">
            <FileText size={20} className="text-charcoal" />
            <h2 className="font-serif font-bold text-lg text-charcoal">
              Comment fonctionne la conversion ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-stone-600">
            <div className="p-4 rounded-lg bg-surface border border-surface-border">
              <h3 className="font-bold text-charcoal text-sm mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-charcoal text-white font-mono text-[10px] flex items-center justify-center">1</span>
                Images & PDF manuscrits
              </h3>
              <p>
                Traités par le modèle de vision multimodal Google Gemini. Le modèle analyse la typographie, extrait les théorèmes, les systèmes d'équations, les symboles grecs et formate le code source en blocs LaTeX standard.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-surface-border">
              <h3 className="font-bold text-charcoal text-sm mb-1.5 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-charcoal text-white font-mono text-[10px] flex items-center justify-center">2</span>
                Documents Word (.docx) & Excel (.xlsx)
              </h3>
              <p>
                Convertis en local sans appel API. Les styles de titres deviennent des commandes <code className="font-mono text-stone-800 bg-surface-muted px-1 py-0.5 rounded">\section</code>, les tableaux sont transformés avec la rigueur des packages <code className="font-mono text-stone-800 bg-surface-muted px-1 py-0.5 rounded">booktabs</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Packages LaTeX pré-inclus */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border/60">
            <Layers size={20} className="text-charcoal" />
            <h2 className="font-serif font-bold text-lg text-charcoal">
              Packages inclus dans le préambule standard
            </h2>
          </div>

          <p className="text-xs text-stone-600 mb-4">
            Chaque document généré hérite automatiquement des packages typographiques suivants :
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">amsmath</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Structures mathématiques</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">amssymb</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Symboles étendus</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">mathtools</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Extensions d'amsmath</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">booktabs</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Tableaux académiques</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">geometry</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Marges à 2.5cm</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">enumitem</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Listes personnalisées</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">hyperref</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Liens & métadonnées</p>
            </div>
            <div className="p-2.5 rounded bg-surface border border-surface-border">
              <span className="font-bold text-charcoal">inputenc</span>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">Encodage UTF-8 natif</p>
            </div>
          </div>
        </div>

        {/* Section 3: Mémo Syntaxe Mathématique */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border/60">
            <Code2 size={20} className="text-charcoal" />
            <h2 className="font-serif font-bold text-lg text-charcoal">
              Aide-mémoire de syntaxe LaTeX
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-surface-border text-stone-400 font-mono text-[11px]">
                  <th className="pb-2 font-semibold">Élément</th>
                  <th className="pb-2 font-semibold">Code LaTeX</th>
                  <th className="pb-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 text-stone-700">
                <tr>
                  <td className="py-2.5 font-medium text-charcoal">Formule en ligne</td>
                  <td className="py-2.5 font-mono text-stone-800">$f(x) = ax^2 + bx + c$</td>
                  <td className="py-2.5 text-stone-500">Intégrée dans le paragraphe courant</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-charcoal">Formule en bloc</td>
                  <td className="py-2.5 font-mono text-stone-800">{'\\['} \lim_{'{x \\to 0}'} \frac{'{'}\sin x{'}'}{'{'}x{'}'} = 1 {'\\]'}</td>
                  <td className="py-2.5 text-stone-500">Centrée sur sa propre ligne</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-charcoal">Système d'équations</td>
                  <td className="py-2.5 font-mono text-stone-800">\begin{'{cases}'} 2x + y = 5 \\ x - y = 1 \end{'{cases}'}</td>
                  <td className="py-2.5 text-stone-500">Avec accolade gauche</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-charcoal">Matrice</td>
                  <td className="py-2.5 font-mono text-stone-800">\begin{'{pmatrix}'} a & b \\ c & d \end{'{pmatrix}'}</td>
                  <td className="py-2.5 text-stone-500">Matrice entre parenthèses</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-charcoal">Tableau avec booktabs</td>
                  <td className="py-2.5 font-mono text-stone-800">\toprule \midrule \bottomrule</td>
                  <td className="py-2.5 text-stone-500">Lignes horizontales soignées</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Raccourcis clavier */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-surface-border/60">
            <Keyboard size={20} className="text-charcoal" />
            <h2 className="font-serif font-bold text-lg text-charcoal">
              Raccourcis clavier de l'éditeur
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
              <span className="text-stone-700">Recompiler le document et actualiser le PDF</span>
              <kbd className="px-2 py-1 rounded bg-surface-card border border-surface-border font-mono text-charcoal font-semibold shadow-xs">
                Ctrl + S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
              <span className="text-stone-700">Recherche dans le code source</span>
              <kbd className="px-2 py-1 rounded bg-surface-card border border-surface-border font-mono text-charcoal font-semibold shadow-xs">
                Ctrl + F
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
