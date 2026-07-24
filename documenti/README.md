# Cartella di ingestione documenti (locale, non versionata)

Questa cartella e' il punto di ingresso per i documenti fiscali reali da ingestionare: Certificazione Unica, cedolini, estratti di previdenza complementare. Il suo contenuto e' escluso dal version control per intero: l'unico file tracciato e' questo README. Ogni PDF o file qui dentro resta sul disco locale e non finisce mai su git ne' su GitHub, perche' contiene dati personali (codice fiscale, retribuzioni, datore di lavoro).

## Struttura canonica

I documenti si organizzano per anno d'imposta e per tipo. La struttura seguente e' predisposta in locale (le cartelle esistono gia' vuote) e la pipeline di ingestione della Fase 2 la leggera':

```
documenti/
  2024/
    cedolini/                buste paga mensili
    certificazione-unica/    CU dell'anno
    modello-730/             dichiarazione 730
    previdenza/              estratti del fondo pensione
  2025/  (stessa struttura)
  2026/  (stessa struttura)
  sorgenti-da-organizzare/   materiale ancora da smistare
```

Non e' obbligatorio riempire tutte le sottocartelle: si depositano i documenti man mano. La pipeline di ingestione produce un modello normalizzato; gli output derivati che contengono cifre personali non vanno versionati e vivono sotto `_notes/`, anch'essa ignorata da git. In `test/fixtures/` entrano soltanto fixture sintetiche o redatte, senza codice fiscale valido e con valori inventati.

Nota: essendo l'intera cartella ignorata da git (tranne questo README), le sottocartelle esistono solo in locale; su un clone nuovo si ricreano con lo stesso schema.

## Regola di sicurezza

Nulla di identificabile esce da questa cartella verso il repository. Il percorso di ingestione e' sovrascrivibile in fase di sviluppo, ma il default e' questa cartella locale del progetto, ignorata da git per costruzione.
