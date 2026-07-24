# Tool locali

Questa cartella raccoglie strumenti di sviluppo e manutenzione a supporto del progetto, distinti dal codice di libreria in `src/`. Sono tool che si lanciano a mano durante lo sviluppo, non parte del runtime del tool ne' del bundle distribuito.

## Distinzione dalle altre cartelle

Vale la pena tenere chiara la mappa delle cartelle, perche' i nomi si somigliano ma i ruoli sono diversi.

```
tools/               strumenti di sviluppo locali (questa cartella), tracciati
scripts/             script di progetto lanciabili via npm (es. verify-params), tracciati
src/                 codice di libreria e CLI, tracciato
knowledge-base/      metodologie e formati documento, tracciati
documenti/           documenti fiscali reali da ingestionare, IGNORATI da git
_notes/              note e output personali, IGNORATI da git
```

## Verifica normativa

Il controllo dei parametri contro la legge non e' un tool ad hoc ma uno script di progetto: `scripts/verify-params.ts`, lanciabile con `npm run verify-params -- 2026`. Riconcilia i valori memorizzati in `params/AAAA.ts` con il testo di legge in `E:\legal-consultant` (`legge.sqlite`), letto in sola lettura tramite il modulo `src/normative/legge-it.ts`. Il percorso dell'indice e' sovrascrivibile con la variabile d'ambiente `FISCAL_LEGGE_DB`.

## Interrogazione libera del corpus

Per ispezionare il corpus normativo durante lo sviluppo si usa il modulo `src/normative/legge-it.ts` (`apriDb`, `leggiArticolo`, `cerca`), che espone la ricerca full-text BM25 e la lettura per articolo. Un eventuale tool interattivo di query vive qui, quando servira'.
