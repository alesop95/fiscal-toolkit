---
generated-from-commit: 1ad1282
generated-from-branch: main
generated-date: 2026-07-27
covers-paths:
  - params/**
  - src/**
  - scripts/**
  - knowledge-base/**
  - tools/**
  - test/**
last-verified-commit: 1ad1282
stato: fase 1 chiusa, consolidamento da committare
---

# Lavoro in corso

> La fonte di verita' su cosa e' fatto resta `memory/index.md` e il work-log, non le spunte di
> questo file.

## Fase 1 — motore di calcolo piu' parametri normativi: chiusa

La Definition of Done e' soddisfatta. Gli scenari golden passano, incluso il caso reale di
conguaglio anonimizzato; i boundary degli scaglioni sono corretti; `verify-params` riconcilia
23/35/43 con soglie 28k/50k contro la legge modificatrice.

```
src/domain/money.ts         tipo Money e arrotondamento fiscale
src/engine/irpef.ts         scaglioni marginali; boundary 28k/50k verificati
src/engine/detrazioni.ts    detrazione lavoro dipendente, TUIR art. 13
src/engine/cuneo.ts         cuneo 2025, L. 207/2024 art. 1 co. 4 e co. 6
src/engine/inps.ts          contributi lavoratore dipendente
src/engine/addizionali.ts   regionale Marche e comunale Civitanova, indipendenti fra loro
src/engine/lordo-netto.ts   orchestratore RAL -> netto, voce per voce
src/engine/params-motore.ts ponte parametri validati -> motore
params/schema.ts + 2025/2026 + index   parametri citati e validati
src/normative/legge-it.ts   lettura sola lettura di legge.sqlite con node:sqlite (ADR-007)
scripts/verify-params.ts    riconciliazione parametri vs legge
knowledge-base/             metodologie citate e formati documento
test/fixtures/, test/golden/, test/guard/   fixture reale anonimizzata e guardia dati sensibili
```

Unico residuo dichiarato: `params/2024.ts`. L'anno non e' modellato perche' il cuneo 2024 e' un
esonero contributivo sulla quota IVS, di struttura diversa dalla coppia somma/detrazione introdotta
dalla L. 207/2024, e va modellato a parte invece di essere forzato nello schema attuale.

## Consolidamento di UI e Prospetto (2026-07-27, da committare)

Cosa fa: porta nel livello `src/report/` tutte le grandezze che le viste mostravano, cosi' CLI e UI
formattano soltanto. Vedi ADR-008 e ADR-009.

```
src/report/prospetto.ts   composizione della RAL, mensilita', RATE_MENSILITA, serializzazione estesa
src/report/fonte.ts       formattaFonte: URN Normattiva -> sigla d'uso; nessuna sigla inventata
src/report/curva.ts       componiCurva: prelievo e aliquota marginale effettiva al variare della RAL
src/cli.ts                fonti stampate, --json su confronta, comando curva
src/ui/server.ts          /api/curva e validazione degli ingressi (RAL_MASSIMA, tetto sui punti)
src/ui/page.ts            barra dal modello, riconciliazione del cuneo, scheda curva, scarico, stampa
```

Definition of done: soddisfatta.

- [x] i segmenti della composizione sommano esattamente alla RAL, al centesimo
- [x] netto da RAL piu' somma del cuneo da' il netto annuo del motore, nei tre regimi del cuneo
- [x] nessuna aritmetica fiscale nel client: barra, quote, mensilita' e citazioni arrivano dal modello
- [x] la curva espone gli scalini del cuneo e rifiuta campionamenti oltre MAX_PUNTI
- [x] 102 test verdi, lint e type-check puliti, riscontro visivo delle tre schede su screenshot

## Domande aperte

Discontinuita' della detrazione al passaggio di 15.000 EUR di reddito: la curva mostra che li' mille
euro lordi in piu' fanno crescere il netto di piu' di mille euro, perche' la detrazione dell'art. 13
TUIR salta dai 1.955 EUR fissi della lett. a) ai circa 3.100 EUR con cui riparte la lett. b). Il
salto e' fedele ai parametri memorizzati e al testo della norma come modellato; va confermato contro
la fonte prima di considerarlo definitivo, perche' un gradino di quella entita' merita una verifica
esplicita e non una assunzione.

Prima fascia annua INPS: valore amministrativo, da confermare con la circolare INPS dell'anno.

Addizionale comunale 2026 di Civitanova Marche: eredita provvisoriamente l'aliquota 2025 (0,72 per
cento) perche' la delibera 2026 non risulta pubblicata sulla fonte MEF.

## Riconciliazione

Ultima verifica: 2026-07-27. Fase 1 chiusa e consolidamento di UI e Prospetto completato e testato
(102 test verdi); lavoro nuovo in attesa di commit manuale.
