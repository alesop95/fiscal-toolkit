# Estratto della previdenza complementare

## A cosa serve

L'estratto del fondo pensione (o della forma pensionistica complementare) riepiloga la posizione individuale: i versamenti effettuati nell'anno e cumulati, la loro provenienza (contributo del lavoratore, del datore, conferimento del TFR), la deduzione fiscale gia' applicata, il rendimento maturato e il valore della posizione. E' la fonte per due scopi: verificare quanto e' stato versato entro il tetto di deducibilita' di 5.164,57 EUR, e alimentare la proiezione di ottimizzazione della Fase 3.

## Campi rilevanti per il calcolo

```
contributo del lavoratore           quota volontaria, deducibile
contributo del datore di lavoro     spesso legato al contratto
TFR conferito                       flusso dal trattamento di fine rapporto
totale versato nell'anno            da confrontare col tetto 5.164,57 EUR
rendimento maturato                 base della proiezione di lungo periodo
valore della posizione              montante accumulato
```

## Insidie di lettura

Il formato dell'estratto varia per fondo. La distinzione fra le fonti di versamento e' cruciale: solo alcune quote sono deducibili, e il conferimento del TFR ha un trattamento fiscale a se'. Il tetto di deducibilita' e' annuo e cumulativo su tutte le forme.

## Stato

Scheda di riferimento. L'ingestione dell'estratto e' prerequisito della Fase 3 (ottimizzazione previdenziale): la fotografia fiscale ne consuma i versamenti e il flusso TFR. I dati reali restano nella cartella locale `documenti/`, mai versionati.
