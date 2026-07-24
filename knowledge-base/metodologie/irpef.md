# IRPEF: scaglioni e imposta lorda

## Metodologia

L'imposta sul reddito delle persone fisiche si determina applicando al reddito imponibile aliquote crescenti per scaglioni. Ogni scaglione tassa solo la porzione di reddito compresa fra il suo limite inferiore e il suo limite superiore, secondo il criterio dell'aliquota marginale: non e' l'intero reddito a essere tassato all'aliquota dello scaglione piu' alto raggiunto, ma ciascuna fetta alla propria aliquota. L'imposta lorda e' la somma dei contributi di ogni scaglione.

## Valori vigenti (2024, 2025, 2026)

```
fino a 28.000 EUR            23 per cento
oltre 28.000 e fino a 50.000 35 per cento
oltre 50.000 EUR            43 per cento
```

## Fonte e nota sulla catena normativa

Il testo base e' il TUIR[^1], DPR 22 dicembre 1986, n. 917, art. 11 (urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917). Attenzione pero' a una insidia verificata e registrata in ADR-006: il testo consolidato dell'art. 11 presente nel corpus riporta ancora 33 per cento sul secondo scaglione, perche' non riflette la novella successiva. Il valore vigente e' 35 per cento, fissato per il 2024 dal decreto legislativo 30 dicembre 2023, n. 216, art. 1 (urn:nir:stato:decreto.legislativo:2023-12-30;216) e reso strutturale dal 2025 dalla legge 30 dicembre 2024, n. 207, art. 1 comma 2 lettera a (urn:nir:stato:legge:2024-12-30;207), che sostituisce integralmente il comma 1 dell'art. 11. La legge di bilancio 2026 (legge 30 dicembre 2025, n. 199) non modifica scaglioni ne' aliquote.

La lezione operativa e' che la fonte del valore vigente e' la catena delle leggi modificatrici applicabili all'anno d'imposta, non il solo testo consolidato dell'articolo base.

## Implementazione

Il calcolo e' in `src/engine/irpef.ts` (`calcolaIrpefLorda`), funzione pura che riceve l'imponibile e gli scaglioni dai parametri dell'anno. I valori e le citazioni stanno in `params/2025.ts` e `params/2026.ts`, blocco `irpef.scaglioni`. I boundary 27.999 / 28.000 / 50.000 sono coperti dai test in `test/engine/irpef.test.ts`.

[^1]: *TUIR*, Testo Unico delle Imposte sui Redditi - il corpo normativo che raccoglie la disciplina dell'imposta sui redditi.
