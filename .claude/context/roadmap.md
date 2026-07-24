---
generated-from-commit: 1368f95
generated-from-branch: main
generated-date: 2026-07-24
covers-paths: []
last-verified-commit: 1368f95
---

# Roadmap

> Direzione e priorita' del progetto. Tracciata. Non e' il work-log: qui sta dove si va, non cosa
> e' gia' stato fatto. Lo stato reale delle fasi vive in `memory/index.md` e nel work-log.

## Direzione

Costruire in Node/TypeScript un tool che gestisca la fiscalita' di un lavoratore dipendente
italiano: ingestione dei documenti reali (Certificazione Unica, cedolini, previdenza
complementare), fotografia fiscale riconciliata con un motore di calcolo deterministico, e in
prospettiva stima quantitativa di come ottimizzare i versamenti al fondo pensione nel lungo
periodo. I parametri normativi restano locali e versionati per anno d'imposta, verificati contro
`legal-consultant`; le metodologie esterne (stipendio.top, calcolatori community, i contenuti di
Paolo Coletti) si ricodificano offline in `knowledge-base/`, con citazioni, senza copiare codice.

## Fasi

Le fasi sono sequenziali: ognuna dipende dalla precedente. Ogni fase e' un'unita' di lavoro a se',
committata a mano dall'utente prima di passare alla successiva.

### Fase 0 — Scaffolding

Obiettivo: fondamenta di build, test e tipi base, senza logica di funzionalita'.
Deliverable: `package.json` (ESM, `bin` CLI + `exports` libreria), `tsconfig.json` strict con
`tsconfig.build.json` per l'emit, `vitest.config.ts`, `tsup.config.ts`, lint (eslint o biome),
`params/schema.ts` (schema Zod dei parametri e wrapper `Cited<T>`), `src/domain/money.ts` (importi
in centesimi e arrotondamento fiscale).
Definition of done: `npm install` e type-check verdi, `vitest` esegue almeno un test di `money.ts`,
lo schema valida un file di parametri di esempio.
Dipendenze: nessuna. Blocca tutte le fasi successive.

### Fase 1 — Motore di calcolo piu' parametri normativi

Obiettivo: calcolo deterministico lordo/netto per un lavoratore dipendente, riproducibile e
citato.
Deliverable: `params/2026.ts` (piu' 2025 e 2024) con scaglioni IRPEF, aliquota INPS dipendente,
formula detrazioni lavoro dipendente, tetto deducibilita' previdenza complementare (5.164,57 EUR),
parametri cuneo, ognuno con citazione URN + articolo; `src/engine/` (irpef, detrazioni,
addizionali, inps, cuneo, orchestratore `lordo-netto`); `knowledge-base/` con le metodologie
citate; fixture golden `RAL -> netto` incluso il caso reale di conguaglio anonimizzato; CLI `netto`;
`src/normative/legge-it.ts` piu' script `verify-params` che confronta i valori memorizzati col
testo di legge in `legge.sqlite`.
Definition of done: gli scenari golden passano entro la tolleranza di arrotondamento, i boundary
degli scaglioni (27.999 / 28.000 / 50.000) sono corretti, `verify-params` stampa il testo del TUIR
art. 11 coerente con 23/33/43 e soglie 28k/50k.
Dipendenze: Fase 0. Precede tecnicamente l'ingestione perche' la validazione dei documenti riusa
il motore.

### Fase 2 — Ingestione documenti piu' fotografia fiscale (MVP)

Obiettivo: dai PDF reali a una fotografia fiscale precisa e riconciliata. E' l'obiettivo dichiarato
dell'MVP.
Deliverable: `src/ingestion/pdf/` (estrazione testo e token posizionati con pdfjs-dist, fallback
pdf-parse); extractor nell'ordine CU, poi cedolino con registry di strategie per-provider, poi
previdenza; `src/ingestion/validate.ts` (quadratura interna piu' ricalcolo col motore di Fase 1 e
confronto con banda di tolleranza); `src/fotografia/compose.ts` (fotografia con riconciliazione a
tre colonne daDocumento / ricalcolato / delta e stato OK o DA_VERIFICARE, piu' citazione della
regola applicata); CLI `ingest` e `fotografia`; fixture CU/cedolino anonimizzate.
Definition of done: su fixture anonimizzate l'extractor produce il `FiscalDocument` atteso, un
fixture con totale volutamente errato produce lo stato DA_VERIFICARE, la fotografia mostra la
riconciliazione; nessun dato personale versionato (test guardia).
Dipendenze: Fase 1. Serve sapere il provider del cedolino reale e la regione/comune per le
addizionali.

### Fase 3 — Ottimizzazione previdenziale (finanza quantitativa)

Obiettivo: stimare quanto conviene versare al fondo pensione per il massimo rendimento netto di
lungo periodo.
Deliverable: `src/optimizer/` che consuma la `FotografiaFiscale` (reddito complessivo, aliquota
marginale, contributi al fondo, flusso TFR) piu' i parametri (tetto deducibilita', scaglioni);
proiezione deterministica pluriennale che confronta versamento al fondo con beneficio di deduzione
immediata piu' rendimento e tassazione finale agevolata, contro TFR in azienda, contro un ETF/PAC
equivalente al netto delle imposte; `knowledge-base/previdenza-complementare.md` con la metodologia
citata, ispirata ai contenuti di Paolo Coletti.
Definition of done: date le stesse ipotesi, le proiezioni sono riproducibili e la raccomandazione
di versamento e' spiegata voce per voce; nessun accesso di rete a runtime.
Dipendenze: Fase 2 (la fotografia e' il contratto di input).

## Estensioni future (fuori dall'MVP, da confermare)

Confronto dipendente vs partita IVA (regime forfettario e ordinario): gia' nello scopo originale
del progetto; le formule vanno derivate a mano e verificate contro calcolatori proprietari usati
solo come riscontro, mai come fonte da cui copiare.

OCR per PDF scansionati: l'MVP assume PDF con text-layer; introdurre Tesseract solo se emergono
documenti immagine.

UI locale: il nucleo e' CLI-first e agnostico dalla UI, quindi una eventuale interfaccia (web o
TUI) importerebbe gli stessi moduli senza riscrivere il motore.

## Idee e ipotesi da verificare

Licenza del repo da fissare (non-GPL, con reimplementazione clean-room di stipendio.top).

Stabilita' dei codici di campo della CU tra anni diversi: la CU dell'Agenzia delle Entrate e'
stabile ma la numerazione puo' cambiare, quindi le regole dell'extractor vanno versionate per anno.
