---
generated-from-commit: 1368f95
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - vitest.config.ts
  - test/**
  - test/fixtures/**
last-verified-commit: 1368f95
---

# Test di sviluppo

> Popolare leggendo la configurazione reale dei test quando esistera'. La checklist operativa
> locale dei test manuali vive in `_notes/TEST-CHECKLIST.md`, ignorata da git.

## Test runner e comandi

Previsto: `vitest` (TypeScript ed ESM nativi, snapshot per le viste). I comandi esatti si fissano
in Fase 0. La strategia poggia su scenari golden `RAL -> netto/IRPEF/detrazioni` per anno e su
fixture di ingestione con l'atteso `FiscalDocument`.

## Rotte e dati mockati

Nessun servizio esterno a runtime, quindi niente mock di rete. Le fixture sono PDF o testo redatto
sintetico piu' il JSON atteso. Il caso di test reale (calcolo IRPEF con conguaglio) e' esterno e
privato in `E:\my-cv\_notes\` e va trascritto come fixture numerica anonimizzata.

## Hook e controlli di qualita'

Prima del commit: lint (eslint o biome), type-check e build (tsc/tsup), test (vitest), piu' il
test guardia sui dati sensibili (nessun file `_notes/` tracciato, nessuna fixture con codice
fiscale valido).
