# Cartella di ingestione documenti (locale, non versionata)

Questa cartella e' il punto di ingresso per i documenti fiscali reali da ingestionare: Certificazione Unica, cedolini, estratti di previdenza complementare. Il suo contenuto e' escluso dal version control per intero: l'unico file tracciato e' questo README. Ogni PDF o file qui dentro resta sul disco locale e non finisce mai su git ne' su GitHub, perche' contiene dati personali (codice fiscale, retribuzioni, datore di lavoro).

## Come si usa

Si depositano qui i documenti da analizzare, organizzandoli come si preferisce, ad esempio per anno d'imposta e tipo:

```
documenti/
  2024/
    certificazione-unica.pdf
    cedolino-dicembre.pdf
  2025/
    ...
```

La pipeline di ingestione (Fase 2) legge da questa cartella e produce un modello normalizzato. Gli output derivati che contengono cifre personali non vanno versionati: vivono sotto `_notes/`, anch'essa ignorata da git. In `test/fixtures/` entrano soltanto fixture sintetiche o redatte, senza codice fiscale valido e con valori inventati.

## Regola di sicurezza

Nulla di identificabile esce da questa cartella verso il repository. Il percorso di ingestione e' sovrascrivibile in fase di sviluppo, ma il default e' questa cartella locale del progetto, ignorata da git per costruzione.
