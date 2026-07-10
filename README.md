# fiscal-toolkit

Strumento personale per l'analisi degli aspetti fiscali della retribuzione in Italia, nel
contesto della ricerca di lavoro: stima del netto da una RAL, confronto lavoro dipendente vs
partita IVA (forfettario/ordinario), lettura del cuneo fiscale e delle detrazioni IRPEF.

Non e' un progetto commerciale e non costituisce consulenza fiscale: i calcoli vanno sempre
verificati con un commercialista prima di qualunque decisione reale.

## Stato

Scaffolding iniziale, nessuna implementazione ancora. Nato da una sessione di ricerca il
2026-07-10 nel repository `my-cv`, spostato qui come progetto a se stante seguendo lo stesso
pattern di `legal-consultant`, `skills` e `projects`.

## Punto di partenza

Per il lato lavoro dipendente: [stipendio.top](https://github.com/BernardoGiordano/stipendio.top)
(GPL-3.0) e' il riferimento open-source piu' aggiornato trovato nella ricerca, con le formule
IRPEF/INPS 2025-2026 documentate. Per il lato partita IVA (forfettario/ordinario) non esiste un
equivalente open-source affidabile: le formule vanno derivate a mano e verificate contro
calcolatori proprietari (calcolopiva.it, fiscozen.it, tasseforfettario.it) usati solo come
riscontro, non come fonte di codice.

Non esiste un'API pubblica pronta all'uso per aliquote/scaglioni IRPEF o contributi INPS
correnti: i parametri normativi vanno aggiornati manualmente ad ogni Legge di Bilancio.

## Relazione con altri progetti

`E:\legal-consultant` indicizza l'intera legislazione italiana (corpus `italia-corpus`, ricerca
full-text via MCP server) ed e' la fonte candidata per verificare il testo normativo aggiornato
(es. Legge di Bilancio annuale) invece di duplicare la ricerca legislativa qui.

Il CV in `E:\my-cv` linka questo repository come risorsa esterna, senza duplicarne il contenuto.
