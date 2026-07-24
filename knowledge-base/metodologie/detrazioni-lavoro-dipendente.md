# Detrazione per redditi di lavoro dipendente

## Metodologia

La detrazione da lavoro dipendente riduce l'imposta lorda ed e' decrescente al crescere del reddito complessivo, fino ad azzerarsi. Si articola in tre fasce piu' una maggiorazione fissa per una fascia intermedia. Opera fino a concorrenza dell'imposta lorda (TUIR art. 11 comma 3): non puo' generare un credito.

## Formula vigente (2024, 2025, 2026)

```
reddito complessivo (R) <= 15.000 EUR    detrazione = 1.955 EUR
15.000 < R <= 28.000 EUR                 1.910 + 1.190 * (28.000 - R) / 13.000
28.000 < R <= 50.000 EUR                 1.910 * (50.000 - R) / 22.000
R > 50.000 EUR                           0
```

A questa si aggiunge la maggiorazione del comma 1.1: piu' 65 EUR se il reddito complessivo e' superiore a 25.000 e non superiore a 35.000 EUR.

La legge prevede inoltre importi minimi rilevanti per i rapporti di durata inferiore all'anno: la detrazione effettivamente spettante non puo' essere inferiore a 690 EUR, elevati a 1.380 EUR per i rapporti a tempo determinato. Questi minimi mordono solo quando la detrazione e' ragguagliata a un periodo breve.

## Fonte

TUIR, DPR 917/1986, art. 13 comma 1 lettere a/b/c e comma 1.1 (urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917). L'importo della prima fascia e' stato portato da 1.880 a 1.955 EUR dalla legge 30 dicembre 2024, n. 207, art. 1 comma 2 lettera b (urn:nir:stato:legge:2024-12-30;207), gia' anticipato per il 2024 dal decreto legislativo 216/2023.

## Implementazione e semplificazioni

Il calcolo e' in `src/engine/detrazioni.ts` (`calcolaDetrazioneLavoroDipendente`), su base annua piena; il ragguaglio a giorni e i minimi per periodo breve sono un affinamento successivo, marcato come da verificare nel codice. I valori e la citazione stanno in `params/2025.ts`, blocco `detrazioni.lavoroDipendente`. I test sono in `test/engine/detrazioni.test.ts`.
