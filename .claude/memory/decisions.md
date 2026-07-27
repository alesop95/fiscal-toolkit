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

## ADR-006 — Il testo consolidato di un articolo non e' la fonte finale del valore vigente

Data: 2026-07-24
Stato: accettata
Contesto: durante la Fase 1 la verifica dell'aliquota IRPEF del secondo scaglione ha mostrato che
il chunk dell'art. 11 TUIR indicizzato in `legge.sqlite` riporta ancora 33 per cento, mentre la
L. 207/2024 art. 1 co. 2 lett. a) ha sostituito quel comma portandola a 35 per cento (35 per cento
gia' effettivo nel 2024 tramite D.Lgs. 216/2023 art. 1). Il valore consolidato nel corpus era
quindi disallineato rispetto alla legge modificatrice.
Decisione: la fonte del valore normativo memorizzato in `params/AAAA.ts` e' la catena delle leggi
modificatrici vigenti per l'anno d'imposta, non il solo testo consolidato dell'articolo base. Lo
script `verify-params` confronta i valori con la legge modificatrice piu' recente applicabile e
non si limita a leggere il chunk dell'articolo base; la citazione nel parametro punta all'atto che
fissa il valore vigente.
Motivazione: correttezza del calcolo e coerenza con ADR-003; un testo consolidato puo' non
riflettere una novella recente e indurre un valore errato.
Conseguenze: la Definition of Done della Fase 1 e' corretta da 23/33/43 a 23/35/43; ogni parametro
soggetto a novella annuale (aliquote, detrazioni, cuneo) cita l'atto modificatore e non solo
l'articolo del TUIR.

## ADR-007 — Accesso a legge.sqlite con node:sqlite, non better-sqlite3

Data: 2026-07-24
Stato: accettata (supera la scelta di better-sqlite3 indicata in STACK.md e CLAUDE.md)
Contesto: il modulo normativo deve leggere l'indice `legge.sqlite` (FTS5) in sola lettura. La
scelta iniziale era il binding nativo `better-sqlite3`, ma su questa macchina non esiste una
toolchain C++ (nessuna installazione di Visual Studio) e non e' disponibile un prebuilt per Node
22.23: l'installazione fallisce alla compilazione con node-gyp.
Decisione: usare il modulo SQLite integrato in Node, `node:sqlite` (DatabaseSync), che include
FTS5 e non richiede compilazione nativa ne' dipendenze aggiuntive. Il modulo resta isolato in
`src/normative/legge-it.ts`, di sola manutenzione, e non entra nel bundle di runtime.
Motivazione: elimina la dipendenza nativa e i suoi problemi di build, mantiene il runtime offline
e senza dipendenze extra, e copre l'esigenza (lettura sola lettura piu' ricerca full-text BM25).
Conseguenze: `node:sqlite` e' un modulo sperimentale e stampa un ExperimentalWarning; e' accettato
per uno strumento di manutenzione. STACK.md e CLAUDE.md sono aggiornati per citare node:sqlite. Se
in futuro servisse il modulo a runtime, si rivaluterebbe la scelta.

## ADR-008 — Nessuna aritmetica nelle viste: le derivazioni vivono nel Prospetto

Data: 2026-07-27
Stato: accettata
Contesto: la CLI e la pagina della UI ricavavano per conto proprio grandezze che il `Prospetto` non
esponeva. La barra di composizione in `src/ui/page.ts` ricostruiva il netto come
`ral - inps - irpefNetta - addizionali` e cosi' facendo ignorava la somma non tassata del cuneo
(L. 207/2024 art. 1 co. 4): a RAL 18.000 la barra dichiarava 15.240,30 mentre la voce sottostante,
nella stessa schermata, dichiarava 16.024,90. Le mensilita' su 12, 13 e 14 erano scritte a mano in
entrambe le viste.
Decisione: ogni grandezza mostrata da una vista e' calcolata nel livello `src/report/` e viaggia nel
`Prospetto` serializzato. Le viste formattano e disegnano, non derivano. Rientrano nel modello la
composizione della RAL con le sue quote, le mensilita' (`RATE_MENSILITA`) e la forma leggibile delle
citazioni (`formattaFonte`), che la serializzazione applica prima di uscire.
Motivazione: una derivazione duplicata in due viste diverge silenziosamente, ed era gia' divergente.
Spostarla nel modello la rende testabile con invarianti (i segmenti sommano esattamente alla RAL,
netto da RAL piu' somma del cuneo da' il netto annuo) invece che verificabile a occhio.
Conseguenze: `ProspettoSerializzato` acquisisce `composizione` e `mensilita`, e il campo `fonte`
delle voci serializzate cambia forma da `Fonte` grezza a `FonteLeggibile`. La somma del cuneo resta
fuori dai segmenti della barra, perche' non e' una fetta della RAL ma un importo che si aggiunge
sopra, e viene riconciliata esplicitamente sotto la barra.

## ADR-009 — La pressione fiscale si misura sul divario lordo-netto, non sui prelievi

Data: 2026-07-27
Stato: accettata (corregge la definizione introdotta con il Prospetto)
Contesto: l'indicatore `pressioneFiscale` era definito come somma dei prelievi (contributi, IRPEF
netta, addizionali) rapportata alla RAL. La curva del prelievo al variare della RAL ha reso visibile
l'artefatto: fra 22.000 e 23.000 euro di RAL l'indicatore scendeva da 19,90 a 16,44 per cento, cioe'
la pressione calava al crescere del reddito. Il motivo e' che sotto la soglia il cuneo eroga la
somma non tassata del co. 4, che arriva al lavoratore senza ridurre alcun prelievo e quindi resta
invisibile a una misura costruita sui soli prelievi; sopra la soglia subentra l'ulteriore detrazione
del co. 6, che invece riduce l'imposta e si vede.
Decisione: `pressioneFiscale` e' il divario fra RAL e netto annuo rapportato alla RAL. Le due
definizioni coincidono ovunque il cuneo non eroghi la somma.
Motivazione: coerenza con il netto mostrato in ogni vista ed eliminazione di una non monotonia che
non descrive la realta' del lavoratore ma solo la contabilizzazione della misura.
Conseguenze: il numero cambia per le RAL fino a circa 22.000 euro. Le etichette di CLI e UI passano
da "prelievo su RAL" a "divario RAL-netto". Un test sulla curva blinda la monotonia dell'indicatore
oltre la discontinuita' della detrazione.
