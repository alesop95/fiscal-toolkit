# UI locale

Scheletro di interfaccia locale per il calcolo netto, pensato per crescere verso la dichiarazione commentata voce per voce. E' deliberatamente minimale: un piccolo server basato sul solo modulo `node:http`, senza dipendenze esterne e senza alcun accesso di rete in uscita, che ascolta solo sul loopback `127.0.0.1`. La pagina e' HTML autonomo con CSS e JavaScript inline, senza risorse remote, coerente con il vincolo di runtime offline del progetto.

## Come si avvia

```
npm run ui
```

Il server stampa l'indirizzo (di default `http://127.0.0.1:4173`, sovrascrivibile con la variabile d'ambiente `FISCAL_UI_PORT`). Aprendo quell'indirizzo nel browser si inserisce la RAL e l'anno d'imposta e si ottiene il netto spiegato.

## Architettura

Il punto centrale e' che la UI non duplica la logica: importa `componiProspetto` e ne serializza il risultato con `serializzaProspetto`, lo stesso modello `Prospetto` che la CLI stampa in testo. Il server e' solo trasporto. Il vincolo vale fino in fondo e comprende il client: la pagina non fa aritmetica fiscale nemmeno per derivare una percentuale. Segmenti della barra, quote, mensilita' e riconciliazione della somma del cuneo arrivano gia' calcolati dal Prospetto, e le citazioni arrivano gia' nella forma leggibile prodotta da `formattaFonte`. E' la correzione di un errore concreto: quando la barra ricostruiva il netto per differenza perdeva la somma non tassata del cuneo e contraddiceva la voce che le stava sotto.

```
src/ui/page.ts     pagina HTML autonoma (CSS e JS inline), consuma le API locali
src/ui/server.ts   handler HTTP (gestisciRichiesta) e avvio (avvia); nessun side effect all'import
src/ui/main.ts     entry di avvio, lanciato da npm run ui
```

Le API sono tutte di sola lettura. `GET /api/anni` elenca gli anni disponibili. `GET /api/netto?ral=...&anno=...` restituisce il Prospetto serializzato con importi in euro, composizione, mensilita', spiegazioni e fonti. `GET /api/confronta?ral=...` restituisce un prospetto per ciascun anno modellato. `GET /api/curva?anno=...&da=...&a=...&passo=...` restituisce la curva del prelievo al variare della RAL, con l'aliquota marginale effettiva accanto a quella di legge. Gli ingressi sono validati: una RAL assente, non numerica, negativa o oltre `RAL_MASSIMA` produce 400, e un campionamento piu' fitto di `MAX_PUNTI` viene rifiutato invece di essere calcolato.

## Viste

La pagina ha tre schede. Dettaglio mostra la composizione della RAL come barra impilata, la riconciliazione col netto annuo quando il cuneo eroga la somma non tassata, la dichiarazione voce per voce con le fonti e gli indicatori sintetici. Confronto anni affianca gli anni modellati a parita' di RAL. Curva RAL disegna in SVG inline l'aliquota marginale effettiva contro quella IRPEF di legge, con la tabella dei punti sotto.

Due azioni completano la pagina, entrambe locali: il pulsante di scarico serializza in JSON la vista corrente tramite un `Blob`, senza alcuna richiesta verso l'esterno, e il pulsante di stampa apre la finestra di stampa del browser, da cui si salva in PDF grazie a un foglio `@media print` che nasconde form, schede e pulsanti.
