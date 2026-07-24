---
generated-from-commit: 6f653d1
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - params/**
  - src/**
  - scripts/**
  - knowledge-base/**
  - tools/**
  - test/**
last-verified-commit: 6f653d1
stato: in corso
---

# Lavoro in corso

> La fonte di verita' su cosa e' fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file.

## Feature: Fase 1 — motore di calcolo piu' parametri normativi

Cosa fa: calcolo deterministico lordo/netto per un lavoratore dipendente, riproducibile e citato,
con i numeri normativi verificati contro `E:\legal-consultant`.

Fatto (committato fino a 6f653d1, piu' lavoro nuovo da committare):

```
src/domain/money.ts        tipo Money e arrotondamento fiscale
src/engine/irpef.ts        scaglioni marginali; boundary 28k/50k verificati
src/engine/detrazioni.ts   detrazione lavoro dipendente, TUIR art. 13
src/engine/cuneo.ts        cuneo 2025, L. 207/2024 art. 1 co. 4 e co. 6
src/engine/inps.ts         contributi lavoratore dipendente
src/engine/lordo-netto.ts  orchestratore RAL -> netto, voce per voce
src/engine/params-motore.ts ponte parametri validati -> motore
params/schema.ts + 2025/2026 + index  parametri citati e validati
src/cli.ts                 CLI netto (funzionante)
src/normative/legge-it.ts  lettura sola lettura di legge.sqlite con node:sqlite (ADR-007)
scripts/verify-params.ts   riconciliazione parametri vs legge (npm run verify-params -- AAAA)
knowledge-base/            metodologie citate e formati documento (cedolino, CU, 730, previdenza)
tools/, documenti/         strumenti locali; cartella ingestione ignorata da git
```

Da fare per chiudere la fase:

```
src/engine/addizionali.ts  addizionale regionale Marche + comunale Civitanova (fonte non nel corpus)
params/2024.ts             anno 2024 (cuneo diverso: esonero contributivo, da modellare a parte)
fixture golden RAL->netto  inclusi i boundary e il caso reale di conguaglio anonimizzato
```

Definition of done (corretta, vedi ADR-006):

- [ ] scenari golden `RAL -> netto` entro la tolleranza di arrotondamento
- [x] boundary degli scaglioni 27.999 / 28.000 / 50.000 corretti (test IRPEF)
- [x] `verify-params` riconcilia i valori con la legge vigente e stampa 23/35/43 con soglie 28k/50k

Domande aperte:

Addizionali regionale (Marche) e comunale (Civitanova Marche): fissate da legge regionale e
delibera comunale, non presenti nel corpus nazionale; da acquisire da fonte ufficiale (Regione
Marche, MEF, delibera comunale) prima di scrivere i parametri. Aliquota INPS del lavoratore
dipendente: valore amministrativo (9,19 per cento IVS piu' 1 per cento sull'eccedenza della prima
fascia); la prima fascia annua e' da confermare con la circolare INPS dell'anno.

## Riconciliazione

Ultima verifica: 2026-07-24. Motore nazionale, parametri 2025/2026, CLI netto, modulo normativo,
verify-params e knowledge base completati e testati (40 test verdi); nuovo lavoro in attesa di
commit manuale.
