# Snapshot di sincronizzazione

> Da leggere per primo a inizio sessione. Fotografa lo stato del progetto al commit di
> riferimento e mappa ogni scheda al suo stato di verifica. E' la fonte di verita' su cosa e'
> fatto, non le spunte del diario.

## Stato

```
Branch attivo:         main
Commit di riferimento: 1ad1282 (Fase 1 chiusa; consolidamento UI/Prospetto da committare)
Data snapshot:         2026-07-27
```

## Stato di verifica delle schede

| Scheda | last-verified | Stato |
|---|---|---|
| STACK.md | 1ad1282 | aggiornata (livello report, UI, curva) |
| design-and-security.md | 1ad1282 | aggiornata (codice reale, test guardia attivo) |
| deployment.md | 1ad1282 | aggiornata (comandi reali, UI locale) |
| dev-testing.md | 1ad1282 | aggiornata (102 test, invarianti) |
| current-work.md | 1ad1282 | aggiornata (Fase 1 chiusa, consolidamento fatto) |
| roadmap.md | 1ad1282 | aggiornata (Fase 1 chiusa, UI non piu' ipotetica) |

Nota: la Fase 1 e' chiusa e superata. Sono committati fino a 1ad1282 i motori (IRPEF, detrazioni,
cuneo, INPS, addizionali), i parametri 2025 e 2026 citati, l'addizionale regionale Marche e
comunale Civitanova, il fixture golden reale anonimizzato, il test guardia sui dati sensibili, la
CLI, il modello `Prospetto` e la prima UI locale. Il lavoro non ancora committato e' il
consolidamento del 2026-07-27: composizione della RAL e mensilita' nel modello, resa leggibile
delle citazioni, curva del prelievo, scarico e stampa nella UI, validazione degli ingressi del
server. Dopo il commit riallineare i `last-verified-commit` con `sync-context`.

## Punto di ripresa

Due strade aperte, indipendenti fra loro.

La prima chiude cio' che resta della modellazione nazionale: `params/2024.ts`, l'unico anno non
modellato, il cui cuneo ha struttura diversa (esonero contributivo IVS invece della coppia
somma/detrazione della L. 207/2024) e va modellato a parte. Sbloccherebbe il confronto fra anni
della UI, che oggi mostra due righe quasi identiche perche' il 2026 eredita il 2025.

La seconda e' la Fase 2, l'ingestione documenti, che e' l'obiettivo dichiarato dell'MVP ma resta
bloccata di fatto: `documenti/` e' vuota, e senza un cedolino e una CU reali gli extractor si
scriverebbero alla cieca su fixture inventate. Va sbloccata depositando documenti reali nella
cartella locale ignorata da git, oppure accettando esplicitamente di partire da fixture sintetiche.

Aperta anche una verifica normativa emersa dalla curva: al passaggio di 15.000 EUR di reddito la
detrazione dell'art. 13 TUIR, come modellata in `params/`, salta dai 1.955 EUR fissi della lett. a)
ai circa 3.100 EUR con cui riparte la lett. b), e in quel punto mille euro lordi in piu' fanno
crescere il netto di piu' di mille euro. Il salto e' fedele ai parametri memorizzati; resta da
confermare contro il testo di legge con `npm run verify-params -- AAAA` e `E:\legal-consultant`.
Anche la prima fascia annua INPS resta da confermare con la circolare INPS dell'anno.
