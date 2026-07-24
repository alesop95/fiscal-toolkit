# Contributi INPS a carico del lavoratore dipendente

## Metodologia

Sulla retribuzione imponibile ai fini previdenziali si applica l'aliquota contributiva a carico del lavoratore. Questa quota e' deducibile ai fini IRPEF: l'imponibile fiscale e' la retribuzione lorda al netto dei contributi a carico del lavoratore. Sulla parte di retribuzione che eccede la prima fascia di retribuzione pensionabile si applica in piu' un'aliquota aggiuntiva dell'1 per cento.

## Valori

```
aliquota base lavoratore dipendente   9,19 per cento (Fondo Pensioni Lavoratori Dipendenti)
aliquota aggiuntiva sull'eccedenza    1 per cento
prima fascia di retribuzione          rivalutata ogni anno (valore amministrativo INPS)
```

## Fonte e cautela

L'aliquota aggiuntiva dell'1 per cento sull'eccedenza della prima fascia ha base nell'art. 3-ter del decreto-legge 19 settembre 1992, n. 384, convertito dalla legge 14 novembre 1992, n. 438 (urn:nir:stato:legge:1992-11-14;438). L'aliquota base del 9,19 per cento e il valore annuo della prima fascia sono invece valori amministrativi, fissati e rivalutati dall'INPS con circolare annuale, e non compaiono come cifra in un singolo articolo del corpus normativo statale. Per questo nel codice e nei parametri sono marcati come amministrativi e da verificare contro la circolare INPS dell'anno: e' un caso in cui la fonte non e' `legge.sqlite` ma la prassi dell'ente.

## Implementazione

Il calcolo e' in `src/engine/inps.ts` (`calcolaInpsDipendente`). Valori e citazione in `params/2025.ts`, blocco `inps`. Test in `test/engine/inps.test.ts`. La prima fascia annua andra' confermata anno per anno: e' il principale valore ancora da fissare con precisione.
