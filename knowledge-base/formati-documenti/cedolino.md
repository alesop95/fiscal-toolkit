# Cedolino (busta paga)

## A cosa serve

Il cedolino e' la busta paga mensile. E' la fonte piu' ricca per ricostruire la fiscalita' reale mese per mese: riporta la retribuzione lorda, i contributi a carico del lavoratore, l'imponibile fiscale, l'IRPEF trattenuta con le detrazioni applicate, le addizionali e il netto in busta. La sua ingestione permette di riconciliare il calcolo teorico del motore con quanto effettivamente trattenuto.

## Campi rilevanti per il calcolo

```
retribuzione lorda del mese          base di partenza
contributi INPS lavoratore           quota a carico, deducibile
imponibile fiscale                   lordo meno contributi
IRPEF lorda del mese                 imposta prima delle detrazioni
detrazioni applicate                 lavoro dipendente, eventuali per familiari
IRPEF netta trattenuta               imposta effettivamente trattenuta
addizionale regionale e comunale     ratei mensili
trattamento integrativo / cuneo      somma non tassata, se spettante
netto in busta                       importo pagato
```

## Insidie di lettura

Il cedolino non ha un formato standard: ogni elaboratore di paghe (il provider) usa un layout proprio, con etichette e posizioni diverse. Per questo la Fase 2 prevede un registro di strategie per-provider: prima si riconosce il provider, poi si applica l'estrattore giusto. I ratei mensili vanno annualizzati con cautela, i conguagli di fine anno alterano i valori di dicembre, e alcune voci (premi, arretrati) hanno trattamenti fiscali particolari.

## Stato

Scheda di riferimento per gli extractor. Il provider del cedolino reale dell'utente e le etichette esatte del suo layout sono ancora da rilevare: vanno documentati qui quando si costruira' il primo estrattore, a partire da un cedolino reale anonimizzato. I dati reali restano nella cartella locale `documenti/`, mai versionati.
