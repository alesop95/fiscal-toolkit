# Estratto della previdenza complementare

## A cosa serve

L'estratto del fondo pensione (o della forma pensionistica complementare) riepiloga la posizione individuale: i versamenti effettuati nell'anno e cumulati, la loro provenienza (contributo del lavoratore, del datore, conferimento del TFR), la deduzione fiscale gia' applicata, il rendimento maturato e il valore della posizione. E' la fonte per due scopi: verificare quanto e' stato versato entro il tetto di deducibilita' (5.164,57 EUR fino al 2025, 5.300 EUR dal 2026), e alimentare la proiezione di ottimizzazione della Fase 3.

## Campi rilevanti per il calcolo

```
contributo del lavoratore           trattenuto in busta paga, concorre al tetto
versamenti volontari aggiuntivi     fatti dal lavoratore fuori dal cedolino, concorrono al tetto
contributo del datore di lavoro     extra RAL, ma concorre al tetto
TFR conferito                       flusso dal trattamento di fine rapporto, NON concorre al tetto
totale contributi dell'anno         somma delle tre voci sopra, da confrontare col tetto
rendimento maturato                 base della proiezione di lungo periodo
valore della posizione              montante accumulato
```

## Insidie di lettura

Il formato dell'estratto varia per fondo. La distinzione fra le fonti di versamento e' cruciale, ma non nel senso che si intende di solito: il tetto lo saturano insieme i contributi del lavoratore, quelli del datore e i versamenti volontari aggiuntivi, mentre il TFR conferito ne resta fuori e ha un trattamento fiscale a se'. Il contributo del datore e' l'insidia principale, perche' e' extra RAL e non produce una deduzione visibile al lavoratore, eppure erode lo spazio deducibile: un estratto letto guardando le sole trattenute del cedolino fa sovrastimare quanto resta da versare. Il tetto e' annuo, riferito al contribuente e cumulativo su tutte le forme, quindi un aderente con piu' posizioni le somma. La metodologia completa, con la fonte di legge, e' in `metodologie/previdenza-complementare.md`.

## Stato

Scheda di riferimento. L'ingestione dell'estratto e' prerequisito della Fase 3 (ottimizzazione previdenziale): la fotografia fiscale ne consuma i versamenti e il flusso TFR. I dati reali restano nella cartella locale `documenti/`, mai versionati.
