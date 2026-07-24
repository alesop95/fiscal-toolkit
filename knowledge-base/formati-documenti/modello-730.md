# Modello 730 (dichiarazione dei redditi)

## A cosa serve

Il modello 730 e' la dichiarazione dei redditi semplificata per i lavoratori dipendenti e i pensionati. Rispetto alla Certificazione Unica, che fotografa cio' che il sostituto ha gia' trattenuto, il 730 e' il luogo dove si compone il quadro completo: si sommano piu' redditi, si portano in deduzione gli oneri deducibili (fra cui i contributi alla previdenza complementare entro il tetto) e in detrazione gli oneri detraibili (spese sanitarie, interessi, ristrutturazioni), e si determina il conguaglio a credito o a debito. E' la fonte per capire l'effetto reale di deduzioni e detrazioni oltre quelle da lavoro dipendente.

## Quadri rilevanti per il calcolo

```
quadro C    redditi di lavoro dipendente e assimilati
quadro E    oneri deducibili e detraibili (inclusa previdenza complementare)
quadro F    acconti, ritenute, eccedenze
prospetto di liquidazione   imposta, addizionali, conguaglio finale
```

## Insidie di lettura

Il 730 e' piu' articolato di CU e cedolino, con numerosi righi e codici onere. Per il tool interessa soprattutto la deduzione della previdenza complementare (collegata alla metodologia di ottimizzazione della Fase 3) e il conguaglio finale, utile a riconciliare il calcolo del motore con l'esito dichiarativo. La struttura dei righi puo' variare per anno.

## Stato

Scheda di riferimento per estensioni oltre l'MVP. L'MVP della Fase 2 si concentra su CU e cedolino; il 730 entra quando serve modellare deduzioni e detrazioni oltre quelle da lavoro dipendente, in particolare per alimentare l'ottimizzazione previdenziale. I dati reali restano nella cartella locale `documenti/`, mai versionati.
