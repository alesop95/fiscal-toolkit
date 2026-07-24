# Work-log

> Append-only, in ordine cronologico inverso (la voce piu' recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento.

## 2026-07-24 — Allineamento allo standard e registrazione della direzione

Commit di riferimento: 1368f95
File toccati: importato il motore in `.claude/` (`PROJECT-SYSTEM.md`, `rules/`, skill
`init-project-system`/`sync-context`/`git-sync`/`repo-status`/`onboard`, `templates/`); creato
`.claude/settings.json`; fuso `.gitignore`; creati `CLAUDE.local.md`, il layer `_notes/`, la
cartella `.claude/memory/` e le sei schede `.claude/context/`; aggiornati `README.md` e `CLAUDE.md`.
Motivo: portare il progetto sullo standard portabile descritto in `.claude/PROJECT-SYSTEM.md` e
registrare la direzione del tool (stack Node/TypeScript, MVP di ingestione documenti, parametri
locali verificati contro `legal-consultant`, knowledge base offline).

## 2026-07-10 — Nascita del progetto (dalla storia git)

Commit: 4207058 (scaffolding), 1368f95 (espansione README).
File toccati: `README.md`, `CLAUDE.md`, `.gitignore`.
Motivo: estrazione del progetto dalla sessione di ricerca in `my-cv` come repository a se' stante.
Nessuna implementazione: solo scaffolding di documentazione.
