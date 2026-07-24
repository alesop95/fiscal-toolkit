# fiscal-toolkit

> Istruzioni di team, versionate. Questo file e' l'indice del progetto: indicizza i soli file
> satellite tracciati e descrive la procedura di ripresa. Le preferenze personali vivono in
> `CLAUDE.local.md`, ignorato da git, non qui. Vedi `README.md` per lo scopo e lo stato pubblico.

## Cos'e' questo progetto

`fiscal-toolkit` e' uno strumento personale, non commerciale, per gestire e capire la fiscalita' di
un lavoratore dipendente in Italia. L'obiettivo e' ingestionare i documenti fiscali reali
(Certificazione Unica, cedolini, estratti di previdenza complementare), produrne una fotografia
fiscale precisa e riconciliata, ragionare a partire dalla RAL, e in prospettiva stimare come
ottimizzare i versamenti al fondo pensione per il massimo rendimento di lungo periodo. Copre anche
lo scopo originale: netto da RAL, confronto dipendente vs partita IVA, cuneo fiscale, detrazioni
IRPEF. Non e' consulenza fiscale: ogni calcolo va verificato con un commercialista prima di un uso
reale.

## Procedura di ripresa in una sessione nuova

Lo stato del progetto e' interamente recuperabile su disco. Si legge per primo
`.claude/memory/index.md`, che da' branch, commit di riferimento, stato di verifica di ogni scheda
e punto di ripresa. Si legge poi `.claude/context/current-work.md` per la feature attiva. Si invoca
la skill `sync-context` per verificare il drift tra schede e codice, e si leggono solo le schede
pertinenti al task. Il work-log `.claude/memory/progress.md` e il registro
`.claude/memory/decisions.md` forniscono storia e decisioni quando servono. Per una ripresa rapida
c'e' `_notes/RESUME-PROMPT.md`, privato e ignorato.

## Indice dei file satellite tracciati

Memoria e meta-stato, sotto `.claude/memory/`, letti sempre a inizio sessione.

```
.claude/memory/index.md       snapshot e tabella di sincronizzazione, da leggere per primo
.claude/memory/progress.md    work-log append-only di passi e riconciliazioni
.claude/memory/decisions.md   registro ADR-lite delle decisioni architetturali
```

Schede tecniche, sotto `.claude/context/`, con frontmatter di riconciliazione.

```
.claude/context/STACK.md                stack, flussi di codice, ruolo architetturale dei file
.claude/context/design-and-security.md  paradigmi di design e vincolo dati sensibili
.claude/context/deployment.md           esecuzione locale e comandi
.claude/context/dev-testing.md          test, runner, fixture anonimizzate
.claude/context/current-work.md         feature attiva, definition of done, domande aperte
.claude/context/roadmap.md              direzione e priorita' (le tre fasi)
```

Regole modulari sotto `.claude/rules/` e skill richiamabili sotto `.claude/skills/`. Lo standard di
sistema completo e' in `.claude/PROJECT-SYSTEM.md`.

## Origine e materiale di riferimento

Nato il 2026-07-10 da una sessione di ricerca svolta in un repository separato del CV personale,
dove restano tracciati i dettagli sensibili (cataloghi di file locali con materiale fiscale
personale) in una nota locale non versionata e non pubblica. Quella nota elenca il materiale di
partenza gia' disponibile in locale, incluso un calcolo IRPEF reale con conguaglio di fine anno
usabile come caso di test, da trascrivere come fixture numerica anonimizzata. I percorsi concreti
di quel materiale, essendo personali, vivono in `CLAUDE.local.md` (ignorato da git), non qui.

## Progetti collegati

`E:\legal-consultant`: MCP server locale con l'intera legislazione italiana indicizzata (corpus
`italia-corpus`, ricerca full-text BM25/FTS5). E' la fonte di verifica normativa del progetto. Il
corpus contiene gia' il TUIR (DPR 917/1986, scaglioni IRPEF nell'art. 11) e le Leggi di Bilancio
aggiornate. Poiche' `fiscal-toolkit` e' in Node e `legal-consultant` in Python, l'integrazione non
importa il pacchetto Python: i numeri normativi restano in file di parametri locali versionati
(`params/AAAA.ts`, ognuno con la propria citazione URN + articolo), e `legal-consultant` serve a
verificarli e citarli in fase di manutenzione. Approccio adottato (vedi ADR-007): aprire l'indice
`E:\legal-consultant\data\index\legge.sqlite` in sola lettura da Node con il modulo integrato
`node:sqlite`, che include FTS5 e non richiede compilazione nativa (il binding `better-sqlite3`
non compila su questa macchina senza toolchain C++), con path sovrascrivibile via
`FISCAL_LEGGE_DB`; in alternativa restano usabili i tool MCP `cerca_normativa` e `leggi_atto`. Il
runtime resta comunque offline e deterministico, e il modulo normativo e' solo di manutenzione.

`E:\my-cv`: il CV personale linka questo repository come risorsa esterna.

`E:\template-claude-developing`: lo standard portabile a cui questo progetto e' allineato.

## Apprendimenti recenti

```
- [2026-07-24] Le fonti esterne (stipendio.top GPL-3.0, calcolatori community, Paolo Coletti) si
  ricodificano clean-room in knowledge-base/ con citazioni, senza copiare codice.
```

## Vincoli di team

Le operazioni di `git add`, commit e push restano sempre manuali dell'utente: l'agente prepara i
file, non committa. L'identita' git e' quella personale dell'autore, agganciata all'alias SSH
`github-personal`; i valori concreti di `user.name` e `user.email` vivono nella configurazione
locale del repository e in `CLAUDE.local.md` (ignorato da git), non in questo file pubblico. La
procedura di selezione dell'identita' e degli alias e' in `.claude/rules/git-identity-and-repo.md`.
Lo stile di documentazione e di interazione e' quello di `.claude/rules/interaction-style.md`.
Claude non scrive autonomamente nei file di memoria e di contesto: li aggiorna solo su richiesta
esplicita.
