# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. E' la fonte di verita' su cosa e'
> fatto, non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: 6f653d1 (Fase 1: parametri, CLI; lavoro nuovo nazionale+normativa da committare)
Data snapshot:         2026-07-24
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | 6f653d1 | aggiornata (simboli reali, node:sqlite) |
| design-and-security.md | 6f653d1 | aggiornata (node:sqlite) |
| deployment.md | 1368f95 | aggiornata |
| dev-testing.md | d95d721 | aggiornata (anonimizzata) |
| current-work.md | 6f653d1 | aggiornata (Fase 1 nucleo completo) |
| roadmap.md | d95d721 | aggiornata (DoD corretta 23/35/43, ADR-006) |

Nota: il nucleo nazionale della Fase 1 e' completo e testato (40 test verdi): dominio money,
motori IRPEF/detrazioni/cuneo/INPS, orchestratore lordo-netto, parametri 2025/2026 citati, CLI
`netto`, modulo normativo su node:sqlite e `verify-params`, knowledge base. Il codice fino a
6f653d1 e' committato; il lavoro nuovo (INPS, orchestratore, parametri, CLI, normativa, knowledge
base) e' da committare a mano. Dopo il commit riallineare i `last-verified-commit` con
`sync-context`.

## Punto di ripresa

Committare a mano il nuovo lavoro di Fase 1. Poi chiudere la fase con: `src/engine/addizionali.ts`
(addizionale regionale Marche e comunale Civitanova, da fonte ufficiale esterna al corpus
nazionale), `params/2024.ts` (anno 2024, con il suo cuneo diverso, l'esonero contributivo), e i
fixture golden `RAL -> netto` incluso il caso reale di conguaglio anonimizzato in `test/fixtures/`.
La prima fascia annua INPS va confermata con la circolare INPS. Verifica normativa con
`npm run verify-params -- AAAA` contro `E:\legal-consultant`. La sessione gira su claude-account3;
dettagli in `_notes/RESUME-PROMPT.md`.
