# fiscal-toolkit

> Istruzioni di progetto. Vedi `README.md` per lo scopo e lo stato dello strumento.

## Cos'e' questo progetto

`fiscal-toolkit` e' uno strumento personale, non commerciale, per stimare gli aspetti fiscali
della retribuzione in Italia durante la ricerca di lavoro (netto da RAL, confronto dipendente vs
partita IVA, cuneo fiscale, detrazioni IRPEF). Non e' consulenza fiscale: ogni calcolo va
verificato con un commercialista prima di un uso reale.

## Origine e materiale di riferimento

Nato il 2026-07-10 da una sessione di ricerca svolta nel repository `my-cv`, dove restano
tracciati i dettagli sensibili (cataloghi di file locali con materiale fiscale personale,
`J:\CV (WORK)\Aspetti fiscali`) in `E:\my-cv\_notes\consulting-and-fiscal-tracking-2026-07-10.md`
(non versionato, non pubblico). Quel file elenca il materiale di partenza gia' disponibile in
locale, incluso un calcolo IRPEF reale con conguaglio di fine anno usabile come caso di test.

## Progetti collegati

`E:\legal-consultant`: MCP server locale con l'intera legislazione italiana indicizzata
(corpus `italia-corpus`, ricerca full-text BM25/FTS5). Fonte candidata per verificare il testo
normativo aggiornato (aliquote, scaglioni, detrazioni) invece di duplicare la ricerca
legislativa in questo repository.

`E:\my-cv`: il CV personale linka questo repository come risorsa esterna.

## Vincoli di team

Le operazioni di `git add`, commit e push restano sempre manuali. L'identita' git e' quella
personale: `alesop95` / `alessio.sopranzi.95@gmail.com` / alias SSH `github-personal`.
