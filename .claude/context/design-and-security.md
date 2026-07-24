---
generated-from-commit: 1368f95
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - src/**
  - test/fixtures/**
  - .gitignore
last-verified-commit: 1368f95
---

# Design e sicurezza applicativa

> Al commit di riferimento non esiste ancora codice: questa scheda fissa i paradigmi decisi e i
> vincoli di sicurezza dei dati, da verificare contro il codice dalla Fase 0 in poi.

## Paradigmi di software design

Nucleo funzionale puro: le funzioni di calcolo hanno forma `(input, params) => risultato`, senza
IO ne' lettura dell'orologio di sistema (l'anno d'imposta e' sempre passato come parametro), cosi'
i risultati sono deterministici e riproducibili. Importi monetari in centesimi interi con
arrotondamento fiscale centralizzato, per evitare la deriva del floating point. Confini validati
con lo stile parse-don't-validate (Zod) sui parametri e sul modello `FiscalDocument`. Dipendenze a
senso unico: `domain` senza dipendenze, `engine` su `domain` piu' `params`, `ingestion` su `domain`
piu' `engine`, `fotografia` sopra tutti. Il modulo `normative`, che legge `legge.sqlite` con il
modulo integrato `node:sqlite` (vedi ADR-007), resta isolato e non entra mai nel bundle di runtime.

## Sicurezza applicativa

Il dato sensibile qui e' personale, non credenziale: CU, cedolini ed estratti di previdenza
contengono codice fiscale, retribuzioni e datore di lavoro. Regola: i documenti reali e ogni output
con cifre personali vivono solo sotto `_notes/`, ignorato da git, e non vengono mai versionati. In
git entrano soltanto codice, formule, parametri e fixture anonimizzate. Le fixture di test sono
sintetiche o redatte: nessun codice fiscale valido, valori inventati. Un test guardia verifica che
nessun file sotto `_notes/` sia tracciato e che nessuna fixture contenga un codice fiscale ben
formato. L'accesso all'indice `legge.sqlite` di `legal-consultant` e' sempre in sola lettura.
Nessun segreto va nei file tracciati; `.env` e chiavi sono ignorati.

## Diagrammi

| Diagramma | Sorgente | Componenti rappresentati |
|---|---|---|
| (da creare) | (da creare) | pipeline di ingestione e riconciliazione, quando il codice esiste |
