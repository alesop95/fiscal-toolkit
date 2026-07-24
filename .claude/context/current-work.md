---
generated-from-commit: d95d721
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - params/**
  - src/domain/**
  - src/engine/**
  - test/**
last-verified-commit: d95d721
stato: in corso
---

# Lavoro in corso

> La fonte di verita' su cosa e' fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file.

## Feature: Fase 1 — motore di calcolo piu' parametri normativi

Cosa fa: calcolo deterministico lordo/netto per un lavoratore dipendente, riproducibile e citato,
con i numeri normativi verificati contro `E:\legal-consultant`.

Fatto finora (motori puri e testati, ancora da committare):

```
src/engine/irpef.ts        scaglioni marginali; boundary 28k/50k verificati
src/engine/detrazioni.ts   detrazione lavoro dipendente, TUIR art. 13 (fascia piena 1.955 EUR)
src/engine/cuneo.ts        cuneo 2025, L. 207/2024 art. 1 co. 4 (somma) e co. 6 (detrazione)
test/engine/*.test.ts      IRPEF, detrazioni, cuneo (32 test verdi in totale con money e schema)
```

Da fare per chiudere la fase:

```
src/engine/inps.ts         aliquota contributiva lavoratore dipendente (fonte da fissare)
src/engine/addizionali.ts  addizionale regionale Marche + comunale Civitanova (fonte non nel corpus)
src/engine/lordo-netto.ts  orchestratore che compone imponibile, IRPEF, detrazioni, cuneo, netto
params/2024.ts 2025 2026   parametri per anno con citazione URN + articolo, validati dallo schema
src/normative/legge-it.ts  lettura sola lettura di legge.sqlite (better-sqlite3), modulo isolato
scripts/verify-params      riconciliazione valori memorizzati contro legge modificatrice vigente
knowledge-base/            metodologie citate (IRPEF, detrazioni, cuneo)
CLI netto                  adattatore sottile sopra l'orchestratore
fixture golden RAL->netto  inclusi i boundary e il caso reale di conguaglio anonimizzato
```

Definition of done (corretta, vedi ADR-006):

- [ ] scenari golden `RAL -> netto` entro la tolleranza di arrotondamento
- [x] boundary degli scaglioni 27.999 / 28.000 / 50.000 corretti (test IRPEF)
- [ ] `verify-params` riconcilia i valori con la legge vigente e stampa 23/35/43 con soglie 28k/50k

Numeri verificati contro `legge.sqlite`:

```
Scaglioni IRPEF   23% <=28k, 35% 28k-50k, 43% >50k   D.Lgs. 216/2023 art.1; L.207/2024 art.1 co.2
Detrazione lav.   art. 13 co.1 (a/b/c) + 65 EUR co.1.1   TUIR art.13; 1.955 EUR da L.207/2024
Cuneo 2025        somma 7,1/5,3/4,8%; detrazione 1.000   L.207/2024 art.1 co.4 e co.6
Tetto previdenza  5.164,57 EUR                            D.Lgs. 252/2005 art.8
```

Domande aperte:

Addizionali regionale (Marche) e comunale (Civitanova Marche): non presenti nel corpus nazionale,
da acquisire da fonte ufficiale (Regione Marche, MEF, delibera comunale) prima di scrivere i
relativi parametri. Aliquota INPS del lavoratore dipendente: valore amministrativo (9,19 per cento
IVS piu' 1 per cento sull'eccedenza della prima fascia), fonte di citazione da fissare.

## Riconciliazione

Ultima verifica: 2026-07-24. Fase 0 committata a d95d721; i motori di Fase 1 sono implementati e
in attesa di commit manuale.
