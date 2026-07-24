# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. E' la fonte di verita' su cosa e'
> fatto, non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: 1368f95
Data snapshot:         2026-07-24
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | 1368f95 | aggiornata |
| design-and-security.md | 1368f95 | aggiornata |
| deployment.md | 1368f95 | aggiornata |
| dev-testing.md | 1368f95 | aggiornata |
| current-work.md | 1368f95 | aggiornata |
| roadmap.md | 1368f95 | aggiornata |

Nota: al commit di riferimento non esiste ancora codice applicativo. Le schede descrivono la
direzione decisa, non codice esistente; `covers-paths` punta alle aree previste e diventera'
verificabile dalla Fase 0 in poi.

## Punto di ripresa

Committare a mano l'allineamento (`git add .gitignore CLAUDE.md README.md .claude`), poi avviare la
Fase 0 (scaffolding Node/TypeScript): `package.json`, `tsconfig`, config vitest/tsx/tsup,
`params/schema.ts`, `src/domain/money.ts`. La prossima sessione gira su claude-account3; dettagli in
`_notes/RESUME-PROMPT.md`.
