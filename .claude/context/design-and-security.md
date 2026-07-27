---
generated-from-commit: 1ad1282
generated-from-branch: main
generated-date: 2026-07-27
covers-paths:
  - src/**
  - test/fixtures/**
  - test/guard/**
  - .gitignore
last-verified-commit: 1ad1282
---

# Design e sicurezza applicativa

> Paradigmi in uso e vincoli sui dati sensibili, verificati contro il codice esistente.

## Paradigmi di software design

Nucleo funzionale puro: le funzioni di calcolo hanno forma `(input, params) => risultato`, senza
IO ne' lettura dell'orologio di sistema (l'anno d'imposta e' sempre passato come parametro), cosi'
i risultati sono deterministici e riproducibili. Importi monetari in centesimi interi con
arrotondamento fiscale centralizzato, per evitare la deriva del floating point. Confini validati
con lo stile parse-don't-validate (Zod) sui parametri e sul modello `FiscalDocument`. Dipendenze a
senso unico: `domain` senza dipendenze, `engine` su `domain` piu' `params`, `report` su `engine`,
le viste (CLI e UI) su `report`, e per la Fase 2 `ingestion` su `domain` piu' `engine` con
`fotografia` sopra tutti. Il modulo `normative`, che legge `legge.sqlite` con il modulo integrato
`node:sqlite` (vedi ADR-007), resta isolato e non entra mai nel bundle di runtime.

Le viste non derivano: ogni grandezza mostrata da CLI e UI e' calcolata nel livello `report` e
viaggia nel modello serializzato, comprese le percentuali di una barra e la forma leggibile di una
citazione. La regola nasce da un errore reale (vedi ADR-008) e vale anche per il JavaScript della
pagina, che formatta e disegna senza fare aritmetica fiscale.

## Superficie di rete

Il runtime e' offline per costruzione. L'unico componente che apre una porta e' la UI locale, che
usa il solo `node:http`, non ha dipendenze esterne, ascolta esclusivamente su `127.0.0.1` e non
effettua alcuna richiesta in uscita; la pagina servita e' autonoma, con CSS e JavaScript inline e
nessuna risorsa remota, e anche l'esportazione avviene in locale tramite `Blob`. Gli ingressi delle
API sono validati con un tetto superiore sulla RAL e un tetto sul numero di punti campionabili,
perche' un parametro malformato non deve poter far generare al server una quantita' arbitraria di
lavoro.

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
