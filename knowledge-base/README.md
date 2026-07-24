# Knowledge base

Questa cartella raccoglie, in forma versionata e citata, la conoscenza di dominio su cui poggia il tool: le metodologie di calcolo fiscale e contributivo e la descrizione dei formati dei documenti da ingestionare. E' materiale tracciato e pubblico, ricodificato clean-room secondo ADR-005: le fonti esterne (stipendio.top, calcolatori community, i contenuti divulgativi di Paolo Coletti) si studiano e si riscrivono da zero con citazioni, senza copiare codice ne' testo protetto. I numeri normativi si verificano contro `E:\legal-consultant` (indice `legge.sqlite`) e ogni valore porta la sua fonte come URN Normattiva piu' articolo.

La knowledge base non contiene dati personali: quelli vivono solo nella cartella locale `documenti/`, ignorata da git, e negli output sotto `_notes/`.

## Struttura

```
knowledge-base/
  metodologie/         come si calcola: IRPEF, detrazioni, cuneo, contributi, previdenza
  formati-documenti/   come sono fatti i documenti da leggere: cedolino, CU, 730, previdenza
```

## Metodologie

Ogni scheda descrive la formula, la sua fonte di legge, e il modulo del motore che la implementa, cosi' che il codice e la sua giustificazione normativa restino collegati.

```
metodologie/irpef.md                        scaglioni e imposta lorda (TUIR art. 11)
metodologie/detrazioni-lavoro-dipendente.md detrazione art. 13 co. 1 e 1.1
metodologie/cuneo-2025.md                   somma e ulteriore detrazione (L. 207/2024)
metodologie/contributi-inps.md              aliquota lavoratore dipendente
metodologie/previdenza-complementare.md     deducibilita' e ottimizzazione (Fase 3)
```

## Formati dei documenti

Ogni scheda descrive la struttura del documento, i campi rilevanti per il calcolo e le insidie di lettura, come riferimento per gli extractor della Fase 2. I codici di campo (in particolare della Certificazione Unica) sono versionati per anno perche' la numerazione puo' cambiare.

```
formati-documenti/cedolino.md                       busta paga mensile
formati-documenti/certificazione-unica.md           CU annuale (Agenzia delle Entrate)
formati-documenti/modello-730.md                    dichiarazione dei redditi 730
formati-documenti/estratto-previdenza-complementare.md   estratto del fondo pensione
```

## Regola di onesta'

Cio' che non e' verificato contro una fonte primaria e' marcato come da verificare. Le inferenze non confermate non si presentano come fatto: si etichettano e si promuovono a fatto solo quando una fonte le conferma.
