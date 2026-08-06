---
generated-from-commit: 1ad1282
generated-from-branch: main
generated-date: 2026-07-27
covers-paths:
  - package.json
  - tsconfig*.json
  - src/**
  - params/**
  - knowledge-base/**
last-verified-commit: 1ad1282
---

# Stack applicativo

> Documento di recupero piu' importante: tracciato, perche' un collega che clona deve vederlo. Descrive lo stack in uso e il ruolo architetturale dei moduli esistenti; i moduli non ancora scritti sono marcati come previsti.

## Stack e runtime

Node.js (v22 in sviluppo) con TypeScript in modalita' strict, moduli ESM con risoluzione `NodeNext`, target ES2022. Package manager npm con `package-lock.json` versionato. Esecuzione in sviluppo con `tsx`, test con `vitest`, bundling con `tsup` (solo per dist e CLI). Validazione dei confini con Zod. Il progetto e' una libreria CLI-first: la logica di dominio, calcolo, ingestione e composizione resta pura in `src/`, la CLI e' un adattatore sottile, cosi' una eventuale UI futura importa gli stessi moduli.

## Alternative deliberatamente escluse

Python: valutato perche' coerente con `legal-consultant`, scartato per scelta esplicita dell'utente a favore di Node/TypeScript. Conseguenza: nessun import diretto del pacchetto Python di `legal-consultant`; la verifica normativa legge direttamente l'indice SQLite.

## Flussi di codice e ruolo architetturale dei file

`params/` contiene i parametri normativi per anno d'imposta, ognuno con la propria citazione di legge; `params/schema.ts` definisce lo schema Zod e il wrapper `Cited<T>`. `src/domain/` sono i tipi puri (importi in centesimi in `money.ts`; `FiscalDocument` e `FotografiaFiscale` sono previsti, non ancora scritti). `src/engine/` e' il calcolo deterministico (IRPEF, detrazioni, addizionali, INPS, cuneo, orchestratore `lordo-netto`) e consuma i parametri. `src/report/` sta sopra il motore e sotto le viste: trasforma il risultato del calcolo in modelli esplicabili, serializzabili e testati, ed e' l'unico punto in cui vivono le grandezze derivate che le viste mostrano. `src/cli.ts` e `src/ui/` sono adattatori: consumano gli stessi modelli e non fanno aritmetica propria (ADR-008). `src/ingestion/` estrae i dati dai PDF (CU, cedolini, previdenza) verso `FiscalDocument` e valida ricalcolando col motore, e `src/fotografia/` compone i documenti in una fotografia riconciliata: entrambi sono previsti per la Fase 2 e non esistono ancora. `src/normative/` e' isolato e serve solo alla manutenzione: legge `legge.sqlite` in sola lettura per verificare i parametri. `knowledge-base/` raccoglie le metodologie offline citate.

La direzione delle dipendenze e' a senso unico: `domain` non dipende da nulla, `engine` dipende da `domain` e `params`, `report` dipende da `engine`, e le viste dipendono da `report`. Nessuna vista importa il motore direttamente.

## Riferimenti a snippet

Dominio: `src/domain/money.ts` definisce il tipo `Money` (centesimi interi, branded) e le operazioni con arrotondamento fiscale (`euros`, `cents`, `applyRate`, `roundToWholeEuro`, `format`).

Parametri: `params/schema.ts` (`paramsAnnoSchema`, `parseParams`, `cited`, tipo `Scaglione`), `params/2025.ts` e `params/2026.ts` (`params2025`, `params2026`), registro in `params/index.ts` (`parametriAnno`, `anniDisponibili`).

Motore: `src/engine/irpef.ts` (`calcolaIrpefLorda`, `aliquotaMarginale`), `src/engine/detrazioni.ts` (`calcolaDetrazioneLavoroDipendente`), `src/engine/cuneo.ts` (`calcolaCuneo`), `src/engine/inps.ts` (`calcolaInpsDipendente`), orchestratore `src/engine/lordo-netto.ts` (`calcolaLordoNetto`, tipo `ParametriMotore`), ponte parametri-motore `src/engine/params-motore.ts` (`toParametriMotore`, `calcolaLordoNettoAnno`).

Report: `src/report/prospetto.ts` (`componiProspetto`, `serializzaProspetto`, tipi `Prospetto`, `VoceProspetto`, `ComposizioneRal`, `Mensilita`, costante `RATE_MENSILITA`) e' il modello esplicabile del calcolo, voce per voce, con la composizione della RAL e le mensilita' gia' derivate; `src/report/fonte.ts` (`formattaFonte`, tipo `FonteLeggibile`) traduce l'URN Normattiva nella sigla d'uso e non ne inventa una per le fonti che su Normattiva non ci sono; `src/report/curva.ts` (`componiCurva`, `serializzaCurva`, costanti `CURVA_DEFAULT` e `MAX_PUNTI`) campiona il calcolo su una scala di RAL e affianca l'aliquota marginale effettiva a quella di legge.

Normativa (manutenzione): `src/normative/legge-it.ts` (`apriDb`, `leggiArticolo`, `cerca`) legge `legge.sqlite` con `node:sqlite` in sola lettura; lo script `scripts/verify-params.ts` riconcilia i parametri con la legge.

CLI: `src/cli.ts` (comandi `netto`, `confronta`, `curva`, tutti con `--json`). UI locale: `src/ui/server.ts` (`gestisciRichiesta`, `avvia`, costante `RAL_MASSIMA`), `src/ui/page.ts` (`PAGINA_HTML`), `src/ui/main.ts`. Barrel di libreria: `src/index.ts`.

Cartelle di conoscenza e strumenti: `knowledge-base/` (metodologie citate e formati documento), `tools/` (strumenti locali), `documenti/` (ingestione locale, ignorata da git tranne il README).
