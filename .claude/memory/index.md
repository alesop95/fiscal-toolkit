# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. E' la fonte di verita' su cosa e'
> fatto, non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: d95d721 (Fase 0 committata; motori di Fase 1 implementati e non ancora committati)
Data snapshot:         2026-07-24
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | 1368f95 | da aggiornare (esiste ora codice in src/, params/) |
| design-and-security.md | 1368f95 | aggiornata |
| deployment.md | 1368f95 | aggiornata |
| dev-testing.md | d95d721 | aggiornata (anonimizzata) |
| current-work.md | d95d721 | aggiornata (Fase 1 in corso) |
| roadmap.md | d95d721 | aggiornata (DoD corretta 23/35/43, ADR-006) |

Nota: Fase 0 committata a d95d721 (scaffolding, dominio money, schema parametri). I motori di
Fase 1 (`src/engine/irpef.ts`, `detrazioni.ts`, `cuneo.ts`) sono implementati e testati ma non
ancora committati; da committare a mano. Dopo il commit, `STACK.md` va aggiornato con i simboli
reali e i `last-verified-commit` vanno riallineati con `sync-context`.

## Punto di ripresa

Committare a mano la Fase 1 finora prodotta (motori + test + anonimizzazione + file di stato).
Poi proseguire la Fase 1: `src/engine/inps.ts`, `src/engine/lordo-netto.ts` (orchestratore), i
file `params/2024.ts 2025 2026` validati dallo schema con citazioni, `src/normative/legge-it.ts`
(lettura sola lettura di `legge.sqlite` con better-sqlite3) e lo script `verify-params`, la CLI
`netto`, la `knowledge-base/` e i fixture golden. Le addizionali (Marche, Civitanova Marche)
richiedono la fonte ufficiale, non presente nel corpus nazionale. La sessione gira su
claude-account3; dettagli in `_notes/RESUME-PROMPT.md`.
