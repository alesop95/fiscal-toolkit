# Registro delle decisioni architetturali

> Convenzione ADR-lite, append-only. Ogni decisione architetturale non ovvia entra come voce
> numerata con data, stato, contesto, decisione, motivazione e conseguenze. Una decisione non si
> cancella e non si riscrive: quando viene superata, si aggiunge una nuova voce che dichiara di
> superare la precedente e ne cita il numero.

## ADR-001 — Adozione del sistema di progetto portabile

Data: 2026-07-24
Stato: accettata
Contesto: il progetto necessita di uno stato interamente recuperabile da un clone e di
documentazione che resti allineata al codice senza rilettura integrale a ogni sessione.
Decisione: adottare il sistema descritto in `.claude/PROJECT-SYSTEM.md`, con motore di
riconciliazione ancorato ai commit e doppio livello documentale tracciato/ignorato.
Motivazione: persistenza strutturale su disco indipendente dalla sessione di chat, e controllo
umano sul versionamento.
Conseguenze: ogni passo significativo aggiorna schede, `last-verified-commit`, snapshot e
work-log; commit e push restano manuali.

## ADR-002 — Stack Node.js + TypeScript

Data: 2026-07-24
Stato: accettata
Contesto: il tool deve ingestionare PDF fiscali, calcolare in modo deterministico e lasciare
aperta la porta a una UI futura. Alternativa valutata: Python, coerente con `legal-consultant`.
Decisione: costruire in Node.js + TypeScript, come libreria CLI-first (moduli puri in `src/`, CLI
sottile), con `tsx`/`vitest`/`tsup` e validazione dei confini con Zod.
Motivazione: scelta esplicita dell'utente; ecosistema TypeScript adatto a un core tipizzato con
eventuale UI web successiva. La verifica normativa contro `legal-consultant` (Python) resta
possibile leggendo direttamente l'indice SQLite, senza dover importare il pacchetto Python.
Conseguenze: nessun import diretto del pacchetto Python di `legal-consultant`; l'integrazione
avviene via lettura in sola lettura di `legge.sqlite` o, in alternativa, via tool MCP.

## ADR-003 — Parametri normativi locali, verificati contro legal-consultant

Data: 2026-07-24
Stato: accettata
Contesto: non esiste un'API pubblica per aliquote, scaglioni IRPEF e contributi INPS correnti; i
valori cambiano a ogni Legge di Bilancio.
Decisione: tenere i valori numerici in file di parametri versionati per anno d'imposta
(`params/AAAA.ts`), ognuno con la propria citazione di legge (URN + articolo). `legal-consultant`
serve a verificare e citare il testo normativo, non come fonte a runtime dei numeri; i calcoli
restano deterministici e riproducibili offline.
Motivazione: riproducibilita' e controllo umano sui numeri; disaccoppiamento del runtime dalla
disponibilita' del corpus legislativo.
Conseguenze: aggiornamento manuale dei parametri a ogni Legge di Bilancio, con uno script di
manutenzione `verify-params` che confronta i valori memorizzati col testo di legge corrente.

## ADR-004 — MVP: ingestione documenti con motore di calcolo sotto

Data: 2026-07-24
Stato: accettata
Contesto: l'obiettivo primario e' una fotografia fiscale precisa a partire dai documenti reali
dell'utente (CU, cedolini, previdenza complementare).
Decisione: il primo modulo funzionante e' l'ingestione dei PDF fiscali verso un modello
`FiscalDocument` normalizzato, riconciliato con un motore di calcolo deterministico che ricalcola
e confronta i valori dichiarati. Il modulo di ottimizzazione previdenziale (finanza quantitativa)
e' una fase successiva.
Motivazione: scelta esplicita dell'utente; l'ingestione da' valore immediato e il motore di
calcolo e' comunque prerequisito della validazione.
Conseguenze: il motore (Fase 1) precede tecnicamente l'ingestione (Fase 2) nell'ordine di
implementazione, pur essendo l'ingestione l'obiettivo dichiarato dell'MVP.

## ADR-005 — Reimplementazione clean-room delle metodologie esterne

Data: 2026-07-24
Stato: accettata
Contesto: il riferimento open source piu' aggiornato per il lato dipendente e' stipendio.top
(GPL-3.0); esistono inoltre calcolatori proprietari e i contenuti divulgativi di Paolo Coletti sui
fondi pensione.
Decisione: studiare le metodologie e ricodificarle da zero in una knowledge base offline
documentata e citata (`knowledge-base/`), senza copiare codice GPL o proprietario nel repo.
Motivazione: mantenere il repo libero da vincoli di licenza incompatibili e le formule
verificabili e riproducibili.
Conseguenze: ogni formula del motore cita il documento di knowledge base e l'URN del parametro; le
fonti restano attribuite.
