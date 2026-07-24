# Certificazione Unica (CU)

## A cosa serve

La Certificazione Unica e' il documento annuale con cui il sostituto d'imposta certifica i redditi corrisposti e le ritenute operate nell'anno. E' la fonte piu' autorevole e stabile per la fotografia fiscale annuale del lavoratore dipendente: riporta l'imponibile, l'IRPEF, le detrazioni, le addizionali e i dati previdenziali dell'intero anno, gia' conguagliati. E' emessa dall'Agenzia delle Entrate con un modello ufficiale uniforme.

## Campi rilevanti per il calcolo

```
reddito di lavoro dipendente        imponibile IRPEF annuo
ritenute IRPEF                      imposta operata
detrazioni riconosciute            lavoro dipendente, familiari, altre
addizionale regionale              trattenuta dell'anno
addizionale comunale               acconto e saldo
contributi previdenziali           quota a carico del lavoratore
trattamento integrativo / cuneo    somma erogata non tassata
```

## Insidie di lettura

Il modello CU e' uniforme ma la numerazione dei punti (i codici di campo) puo' cambiare da un anno all'altro. Per questo le regole dell'estrattore vanno versionate per anno d'imposta: un estrattore CU 2024 non e' automaticamente valido per la CU 2025. La mappa punto-per-anno andra' costruita e tenuta qui, verificando i codici sul modello ufficiale dell'anno.

## Stato

Scheda di riferimento. La tabella dei codici di campo per anno e' da compilare a partire dal modello ufficiale dell'Agenzia delle Entrate e da una CU reale anonimizzata. Il caso reale di conguaglio disponibile in locale sara' trascritto come fixture numerica anonimizzata in `test/fixtures/`, senza codice fiscale ne' datore.
