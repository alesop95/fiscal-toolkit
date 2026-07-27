---
generated-from-commit: 1ad1282
generated-from-branch: main
generated-date: 2026-07-27
covers-paths:
  - package.json
  - tsup.config.ts
  - src/ui/**
last-verified-commit: 1ad1282
---

# Deployment

> Commit, push e deploy restano operazioni manuali dell'utente.

## Livelli

Strumento personale, non commerciale: non c'e' hosting ne' ambiente di produzione. Il tool gira in
locale come libreria, come CLI e come UI locale. La UI non e' un servizio esposto: il server usa il
solo modulo `node:http`, non ha dipendenze esterne, non fa alcun accesso di rete in uscita e ascolta
esclusivamente sul loopback `127.0.0.1`.

## Comandi

```
npm run dev            esegue la CLI in sviluppo (tsx src/cli.ts)
npm run ui             avvia la UI locale su 127.0.0.1:4173
npm run build          bundling con tsup verso dist/ (libreria piu' binario fiscal)
npm run typecheck      tsc --noEmit
npm run test           vitest run
npm run lint           biome check .
npm run lint:fix       biome check --write .
npm run check          lint, typecheck e test in sequenza: il cancello prima del commit
npm run verify-params  riconcilia i parametri di un anno con la legge (es. -- 2025)
```

Comandi della CLI, tutti con `--json` per l'uso programmatico.

```
fiscal netto <RAL> [--anno AAAA] [--json]
fiscal confronta <RAL> [--json]
fiscal curva [--anno AAAA] [--da N] [--a N] [--passo N] [--json]
```

Nessun comando di rilascio remoto.

## Variabili d'ambiente e segreti

`FISCAL_LEGGE_DB`: path opzionale all'indice `legge.sqlite` di `legal-consultant` per la verifica
dei parametri; default `E:\legal-consultant\data\index\legge.sqlite`.

`FISCAL_UI_PORT`: porta della UI locale; default 4173.

Nessun segreto reale richiesto; i valori non si committano mai.
