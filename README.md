# fiscal-toolkit

fiscal-toolkit e' uno strumento personale, non commerciale, pensato per gestire e capire la
fiscalita' di un lavoratore dipendente in Italia. L'obiettivo e' ingestionare i documenti fiscali
reali (Certificazione Unica, cedolini, estratti di previdenza complementare), ricavarne una
fotografia fiscale precisa e riconciliata con un motore di calcolo deterministico, ragionare a
partire dalla RAL, e in prospettiva stimare come conviene versare al fondo pensione per ottimizzare
il rendimento di lungo periodo. Copre anche lo scopo originale: stimare il netto a partire da una
RAL, confrontare il lavoro dipendente con la partita IVA (regime forfettario o ordinario), e capire
il peso del cuneo fiscale e delle detrazioni IRPEF. E' nato il 10 luglio 2026 da una sessione di
ricerca condotta nel repository del CV (`my-cv`), ed e' stato spostato qui come progetto a se
stante, seguendo lo stesso pattern gia' adottato per altri repository personali collegati
(`legal-consultant`, `skills`, `projects`). Non e' e non vuole essere consulenza fiscale: qualunque
calcolo prodotto andra' sempre verificato con un commercialista prima di essere usato per una
decisione reale.

## Stato attuale

Il progetto e' allineato allo standard portabile di contesto e version control
(`E:\template-claude-developing`) e la direzione e' registrata nelle schede di `.claude/context/`.
Non c'e' ancora codice applicativo: nessuno script di calcolo ne' formula codificata. La prossima
tappa e' la Fase 0 (scaffolding Node/TypeScript).

## Direzione e architettura

Lo stack e' Node.js con TypeScript, come libreria CLI-first (logica pura in `src/`, CLI sottile,
porta aperta a una UI futura). Lo sviluppo procede a fasi: Fase 0 scaffolding; Fase 1 motore di
calcolo deterministico piu' parametri normativi per anno; Fase 2 (MVP) ingestione dei documenti e
fotografia fiscale; Fase 3 modulo di ottimizzazione previdenziale. Il dettaglio vive in
`.claude/context/roadmap.md` e `.claude/memory/decisions.md`.

I parametri normativi (scaglioni IRPEF, contributi INPS, detrazioni, tetto di deducibilita' della
previdenza complementare, cuneo) stanno in file versionati per anno d'imposta, ciascuno con la
propria citazione di legge, e vengono aggiornati a mano a ogni Legge di Bilancio. Le metodologie
delle fonti esterne vengono ricodificate in una knowledge base offline e citate, non copiate.

## Punto di partenza individuato

Per il lato lavoro dipendente, la ricerca ha individuato in stipendio.top (licenza GPL-3.0) il
riferimento open source piu' aggiornato trovato finora, con le formule IRPEF e INPS 2025-2026 gia'
documentate nel suo codice. Per il lato partita IVA (regime forfettario e regime ordinario) non
esiste invece un equivalente open source ritenuto affidabile: le formule andranno derivate a mano
e verificate contro calcolatori proprietari (calcolopiva.it, fiscozen.it, tasseforfettario.it),
usati solo come riscontro esterno e mai come fonte da cui copiare codice. Va inoltre tenuto
presente che non esiste un'API pubblica pronta all'uso per aliquote, scaglioni IRPEF o contributi
INPS correnti: i parametri normativi andranno aggiornati a mano a ogni Legge di Bilancio.

## Relazione con altri progetti

`legal-consultant` indicizza l'intera legislazione italiana (corpus italia-corpus, ricerca
full-text BM25/FTS5) ed e' la fonte di verifica del testo normativo (per esempio scaglioni IRPEF
del TUIR e Legge di Bilancio annuale), invece di duplicare qui la ricerca legislativa. Non essendo
questo progetto in Python, l'integrazione non importa il pacchetto: uno script di manutenzione
verifica i parametri leggendo l'indice `legge.sqlite` in sola lettura, in alternativa via i tool
MCP del server. Il CV in `my-cv` linka questo repository come risorsa esterna, senza duplicarne il
contenuto.

## Avvertenza

Questo strumento, quando sara' implementato, produrra' stime a scopo personale e informativo. Non
sostituisce in alcun modo la consulenza di un commercialista o di un consulente del lavoro, e non
va usato come base esclusiva per decisioni fiscali o contrattuali.
