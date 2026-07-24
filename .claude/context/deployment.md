---
generated-from-commit: 1368f95
generated-from-branch: main
generated-date: 2026-07-24
covers-paths:
  - package.json
  - tsup.config.ts
last-verified-commit: 1368f95
---

# Deployment

> Popolare leggendo la configurazione reale quando esistera'. Commit, push e deploy restano
> operazioni manuali dell'utente.

## Livelli

Strumento personale, non commerciale: non c'e' hosting ne' ambiente di produzione. Il tool gira in
locale come libreria e CLI. Un eventuale livello successivo sarebbe una UI locale, non un servizio
esposto.

## Comandi

Previsti (dalla Fase 0): sviluppo con `tsx`, test con `vitest`, build con `tsup`. I comandi esatti
si fissano quando `package.json` esiste. Nessun comando di rilascio remoto.

## Variabili d'ambiente e segreti

`FISCAL_LEGGE_DB`: path opzionale all'indice `legge.sqlite` di `legal-consultant` per la verifica
dei parametri; default `E:\legal-consultant\data\index\legge.sqlite`. Nessun segreto reale
richiesto; i valori non si committano mai.
