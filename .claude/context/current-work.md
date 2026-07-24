---
generated-from-commit: 1368f95
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - package.json
  - tsconfig*.json
  - params/**
  - src/domain/**
last-verified-commit: 1368f95
stato: in pianificazione
---

# Lavoro in corso

> La fonte di verita' su cosa e' fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file.

## Feature: Fase 0 — scaffolding Node/TypeScript

Cosa fa: prepara le fondamenta del progetto (build, test, tipi base, schema dei parametri) su cui
poggiano il motore di calcolo e l'ingestione.

File da creare:

```
package.json          manifesto, moduli ESM, bin CLI + exports libreria
tsconfig.json         config dev (strict, NodeNext), + tsconfig.build.json per l'emit
vitest.config.ts      runner dei test
tsup.config.ts        bundling libreria + CLI
params/schema.ts      schema Zod dei parametri e wrapper Cited<T>
src/domain/money.ts   tipo Money in centesimi e arrotondamento fiscale
```

File da modificare:

```
(nessuno: il codice applicativo non esiste ancora)
```

Definition of done:

- [ ] `npm install` e type-check passano su un progetto vuoto ma configurato
- [ ] `vitest` esegue almeno un test di `money.ts`
- [ ] `params/schema.ts` valida un file di parametri di esempio

Domande aperte:

Licenza del repo da confermare (non-GPL, reimplementazione clean-room di stipendio.top).
Provider del cedolino reale e regione/comune dell'utente, utili gia' in Fase 2 per priorita' degli
extractor e tabella addizionali.

## Riconciliazione

Ultima verifica: 2026-07-24 al commit 1368f95.
