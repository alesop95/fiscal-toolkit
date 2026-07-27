---
generated-from-commit: 1ad1282
generated-from-branch: main
generated-date: 2026-07-27
covers-paths:
  - vitest.config.ts
  - test/**
  - test/fixtures/**
last-verified-commit: 1ad1282
---

# Test di sviluppo

> La checklist operativa locale dei test manuali vive in `_notes/TEST-CHECKLIST.md`, ignorata da git.

## Test runner e comandi

Vitest, con TypeScript ed ESM nativi. Si lancia con `npm run test`, o `npm run test:watch` durante
lo sviluppo, o `npm run check` per il cancello completo (lint, type-check, test). Alla data di
questa scheda la suite conta 102 test verdi su 16 file.

## Organizzazione della suite

```
test/domain/     aritmetica monetaria e arrotondamento fiscale
test/params/     validazione dello schema Zod dei parametri
test/engine/     un file per motore, piu' l'orchestratore e la sua variante per anno
test/report/     prospetto, composizione della RAL, curva, resa delle citazioni
test/golden/     caso reale di conguaglio anonimizzato
test/guard/      guardia sui dati sensibili
test/ui/         handler HTTP, invocato senza aprire porte
```

## Stile delle asserzioni

Il motore e' puro e deterministico, quindi le asserzioni sono su numeri esatti in centesimi, non su
approssimazioni: i confronti passano per `toCents` e non per il valore in euro in virgola mobile. Le
tolleranze si usano solo dove il riferimento e' un calcolo manuale, cioe' nel caso golden, dove il
riferimento arrotondava il rapporto della detrazione a poche cifre mentre il motore arrotonda solo
al centesimo finale.

Le derivazioni di presentazione si verificano con invarianti invece che con valori attesi scritti a
mano: i segmenti della composizione devono sommare esattamente alla RAL, e il netto da RAL piu' la
somma del cuneo deve dare il netto annuo del motore. Gli invarianti si controllano nei tre regimi
del cuneo (somma non tassata, ulteriore detrazione, nessuna delle due), cosi' un errore come quello
corretto in ADR-008 non puo' ripresentarsi.

Dove il comportamento atteso non era noto a priori, come sugli scalini della curva, i valori sono
stati rilevati eseguendo il motore e poi fissati come asserzioni sul segno e sull'ordine di
grandezza dello scalino, non su decimali fragili. Nessun numero atteso e' stato inventato.

## Rotte e dati mockati

Nessun servizio esterno a runtime, quindi niente mock di rete. L'handler HTTP della UI e' esportato
puro e si testa con un finto `ServerResponse`, senza aprire una porta. Il caso di test reale
(calcolo IRPEF con conguaglio) e' esterno e privato; il suo percorso concreto vive in
`CLAUDE.local.md` (ignorato da git) ed e' gia' trascritto come fixture numerica anonimizzata in
`test/fixtures/golden-conguaglio-2025.ts`, senza nome, codice fiscale ne' datore.

## Hook e controlli di qualita'

Prima del commit si lancia `npm run check`, che copre lint (biome), type-check (tsc) e test
(vitest), incluso il test guardia sui dati sensibili: nessun file `_notes/` tracciato, nessuna
fixture con un codice fiscale ben formato.
