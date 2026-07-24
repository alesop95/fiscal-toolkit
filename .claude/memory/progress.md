# Work-log

> Append-only, in ordine cronologico inverso (la voce piu' recente in alto). Ogni passo
> significativo di codice e ogni intervento manuale rilevante lascia una voce con data, file
> toccati, motivo e commit di riferimento.

## 2026-07-24 — Fase 1: nucleo nazionale, CLI, modulo normativo e knowledge base

Commit di riferimento: 6f653d1 (ultimo committato) piu' lavoro nuovo da committare.
File toccati: aggiunti `src/engine/inps.ts` e `src/engine/lordo-netto.ts` (orchestratore) con test;
riscritto `params/schema.ts` in forma strutturata allineata ai motori, creati `params/2025.ts`,
`params/2026.ts`, `params/index.ts` e il ponte `src/engine/params-motore.ts`, rimosso
`params/example.ts`; cablata la CLI `netto` in `src/cli.ts`; creato il modulo normativo isolato
`src/normative/legge-it.ts` su `node:sqlite` e lo script `scripts/verify-params.ts`; creata la
`knowledge-base/` (metodologie IRPEF, detrazioni, cuneo, INPS, previdenza; formati cedolino, CU,
730, previdenza) e la cartella `tools/`; predisposta la cartella locale `documenti/` per
l'ingestione, ignorata da git tranne il README.
Motivo: completare il nucleo di calcolo lordo-netto eseguibile da CLI, con i parametri per anno
citati e verificabili, e predisporre le cartelle di conoscenza e ingestione. Numeri verificati
contro `E:\legal-consultant`; `verify-params` riconcilia scaglioni 23/35/43 (soglie 28k/50k),
detrazione 1.955 EUR e tetto 5.164,57 EUR contro il testo di legge. Deciso in ADR-007 il passaggio
da better-sqlite3 a `node:sqlite` (better-sqlite3 non compila su questa macchina senza toolchain
C++). Restano da fare addizionali (Marche/Civitanova, fonte fuori dal corpus), anno 2024 (cuneo
diverso) e i fixture golden col caso reale di conguaglio anonimizzato.

## 2026-07-24 — Fase 0 completata e avvio Fase 1 (motori verificati)

Commit di riferimento: Fase 0 su d95d721 (scaffolding); il lavoro di Fase 1 qui descritto e'
successivo e ancora da committare a mano.
File toccati: creato lo scaffolding Fase 0 (`package.json`, `tsconfig.json`, `tsconfig.build.json`,
`vitest.config.ts`, `tsup.config.ts`, `biome.json`, `src/domain/money.ts`, `params/schema.ts`,
`params/example.ts`, `src/index.ts`, `src/cli.ts`, test di money e schema); anonimizzati i file
pubblici (`CLAUDE.md`, `.claude/context/dev-testing.md`) spostando identita' e percorsi personali
in `CLAUDE.local.md`; avviata la Fase 1 con tre motori puri e testati: `src/engine/irpef.ts`
(scaglioni marginali), `src/engine/detrazioni.ts` (TUIR art. 13), `src/engine/cuneo.ts`
(L. 207/2024 art. 1 co. 4-6), con i relativi test (32 test verdi in totale).
Motivo: costruire le fondamenta e il nucleo di calcolo deterministico. I numeri normativi sono
stati verificati contro `E:\legal-consultant` (`legge.sqlite`): scaglioni 23/35/43 con soglie
28k/50k (D.Lgs. 216/2023 art. 1; L. 207/2024 art. 1 co. 2), detrazione lavoro dipendente (TUIR
art. 13, fascia piena 1.955 EUR), cuneo 2025 (L. 207/2024 art. 1 co. 4-6), tetto previdenza
5.164,57 EUR (D.Lgs. 252/2005 art. 8). Emersa e registrata in ADR-006 la correzione 33 -> 35 sul
secondo scaglione. Le addizionali regionale (Marche) e comunale (Civitanova Marche) non sono nel
corpus nazionale e restano da acquisire da fonte ufficiale dedicata.

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
