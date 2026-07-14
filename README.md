# fiscal-toolkit

fiscal-toolkit e' uno strumento personale, non commerciale, pensato per orientarsi tra gli aspetti
fiscali della retribuzione in Italia durante una ricerca di lavoro: stimare il netto a partire da
una RAL, confrontare il lavoro dipendente con la partita IVA (regime forfettario o ordinario), e
capire il peso del cuneo fiscale e delle detrazioni IRPEF su uno stipendio. E' nato il 10 luglio
2026 da una sessione di ricerca condotta nel repository del CV (`my-cv`), ed e' stato spostato qui
come progetto a se stante, seguendo lo stesso pattern gia' adottato per altri repository personali
collegati (`legal-consultant`, `skills`, `projects`). Non e' e non vuole essere consulenza
fiscale: qualunque calcolo prodotto andra' sempre verificato con un commercialista prima di essere
usato per una decisione reale.

## Stato attuale

A oggi il repository contiene solo lo scaffolding iniziale, cioe' README e istruzioni di
progetto: non c'e' ancora nessuna implementazione, ne' script di calcolo, ne' formule codificate.
E' un progetto in fase di pianificazione, non uno strumento funzionante.

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
full-text via server MCP) ed e' la fonte candidata per verificare il testo normativo aggiornato,
per esempio quello della Legge di Bilancio annuale, invece di duplicare qui la ricerca
legislativa. Il CV in `my-cv` linka questo repository come risorsa esterna, senza duplicarne il
contenuto.

## Avvertenza

Questo strumento, quando sara' implementato, produrra' stime a scopo personale e informativo. Non
sostituisce in alcun modo la consulenza di un commercialista o di un consulente del lavoro, e non
va usato come base esclusiva per decisioni fiscali o contrattuali.
