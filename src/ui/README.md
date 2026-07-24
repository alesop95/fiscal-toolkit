# UI locale

Scheletro di interfaccia locale per il calcolo netto, pensato per crescere verso la dichiarazione commentata voce per voce. E' deliberatamente minimale: un piccolo server basato sul solo modulo `node:http`, senza dipendenze esterne e senza alcun accesso di rete in uscita, che ascolta solo sul loopback `127.0.0.1`. La pagina e' HTML autonomo con CSS e JavaScript inline, senza risorse remote, coerente con il vincolo di runtime offline del progetto.

## Come si avvia

```
npm run ui
```

Il server stampa l'indirizzo (di default `http://127.0.0.1:4173`, sovrascrivibile con la variabile d'ambiente `FISCAL_UI_PORT`). Aprendo quell'indirizzo nel browser si inserisce la RAL e l'anno d'imposta e si ottiene il netto spiegato.

## Architettura

Il punto centrale e' che la UI non duplica la logica: importa `componiProspetto` e ne serializza il risultato con `serializzaProspetto`, lo stesso modello `Prospetto` che la CLI stampa in testo. Il server e' solo trasporto.

```
src/ui/page.ts     pagina HTML autonoma (CSS e JS inline), consuma le API locali
src/ui/server.ts   handler HTTP (gestisciRichiesta) e avvio (avvia); nessun side effect all'import
src/ui/main.ts     entry di avvio, lanciato da npm run ui
```

Le API di sola lettura esposte sono `GET /api/anni`, che elenca gli anni disponibili, e `GET /api/netto?ral=...&anno=...`, che restituisce il Prospetto serializzato con importi in euro, spiegazioni e fonti. Una UI piu' ricca in futuro puo' partire da qui senza toccare il motore.
