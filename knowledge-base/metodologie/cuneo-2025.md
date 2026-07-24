# Cuneo fiscale sul lavoro dipendente (dal 2025)

## Metodologia

Dal 2025 il beneficio sul cuneo fiscale per i lavoratori dipendenti si articola in due misure alternative, scelte in base al reddito complessivo. Per i redditi fino a 20.000 EUR spetta una somma che non concorre alla formazione del reddito, cioe' un importo netto che si aggiunge alla retribuzione senza essere tassato, calcolato come percentuale del reddito di lavoro dipendente. Per i redditi oltre 20.000 EUR spetta invece un'ulteriore detrazione dall'imposta lorda, piena entro una soglia e poi calante fino ad azzerarsi.

La distinzione e' sostanziale nel calcolo del netto: la somma e' denaro non tassato che si somma al netto, mentre la detrazione riduce l'imposta. Per questo il motore ne distingue il tipo.

## Valori vigenti

Somma che non concorre al reddito, per reddito complessivo fino a 20.000 EUR, in percentuale del reddito di lavoro dipendente:

```
reddito di lavoro <= 8.500 EUR           7,1 per cento
8.500 < reddito di lavoro <= 15.000 EUR  5,3 per cento
reddito di lavoro > 15.000 EUR           4,8 per cento
```

Ulteriore detrazione, per reddito complessivo oltre 20.000 EUR:

```
20.000 < R <= 32.000 EUR   1.000 EUR
32.000 < R <= 40.000 EUR   1.000 * (40.000 - R) / 8.000
R > 40.000 EUR             0
```

## Fonte

Legge 30 dicembre 2024, n. 207 (legge di bilancio 2025), art. 1 comma 4 per la somma e comma 6 per l'ulteriore detrazione (urn:nir:stato:legge:2024-12-30;207). Il comma 7 prevede che il sostituto d'imposta riconosca automaticamente entrambe le misure. La legge di bilancio 2026 (legge 199/2025) non modifica la struttura.

## Implementazione e semplificazioni

Il calcolo e' in `src/engine/cuneo.ts` (`calcolaCuneo`). Per il lavoratore dipendente puro il reddito complessivo e il reddito di lavoro sono approssimati con l'imponibile fiscale; l'orchestratore `src/engine/lordo-netto.ts` applica la somma al netto e la detrazione all'imposta. Valori e citazione in `params/2025.ts`, blocco `cuneo`. Test in `test/engine/cuneo.test.ts`.
