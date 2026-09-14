# Previdenza complementare: deducibilita' e ottimizzazione

## Deducibilita' dei contributi

I contributi versati alle forme pensionistiche complementari sono deducibili dal reddito complessivo entro un tetto annuo, che vale 5.164,57 EUR fino al periodo d'imposta 2025 e sale a 5.300 EUR a decorrere dal periodo d'imposta 2026. La deduzione abbatte l'imponibile IRPEF, quindi il risparmio fiscale immediato di un versamento e' pari al contributo per l'aliquota marginale del contribuente: chi ha aliquota marginale al 35 per cento risparmia 35 centesimi di IRPEF per ogni euro versato entro il tetto.

## Che cosa concorre a saturare il tetto

Il tetto e' unico, annuo e riferito al contribuente, non alla singola forma pensionistica: e' cumulativo su tutte le posizioni aperte. A saturarlo concorrono insieme i contributi a carico del lavoratore trattenuti in busta paga, il contributo aggiuntivo a carico del datore di lavoro, sia volontario sia dovuto in base a contratti o accordi collettivi anche aziendali, gli eventuali versamenti volontari aggiuntivi che il lavoratore fa direttamente al fondo fuori dal cedolino, e le quote che il datore accantona ai fondi di previdenza dell'art. 105 comma 1 del TUIR. Non concorre invece il TFR conferito, perche' l'art. 8 comma 1 distingue il finanziamento per versamento di contributi dal conferimento del TFR maturando, e il comma 4 riguarda i soli contributi versati.

Il punto che si sbaglia piu' facilmente riguarda il contributo del datore di lavoro. Quel contributo e' extra RAL, cioe' non entra nella retribuzione imponibile del lavoratore e non produce quindi alcuna deduzione percepita da lui, ma consuma comunque il tetto. Ne discende che lo spazio residuo effettivamente deducibile dal lavoratore e' il tetto meno il contributo datoriale, e che contare le sole trattenute in busta paga sovrastima lo spazio disponibile. Con un contributo datoriale di 612,17 EUR l'anno, lo spazio residuo per i versamenti del lavoratore e' 4.687,83 EUR nel 2026 (5.300,00 meno 612,17) e sarebbe stato 4.552,40 EUR con il tetto precedente di 5.164,57 EUR.

La parte di contributi versata oltre il tetto non e' deducibile, ma non e' nemmeno persa ai fini fiscali: va comunicata alla forma pensionistica entro il 31 dicembre dell'anno successivo al versamento, cosi' che in fase di erogazione della prestazione quella quota, gia' tassata in entrata, non venga tassata una seconda volta.

## Casi particolari

I contributi versati nell'interesse di familiari fiscalmente a carico danno diritto alla deduzione, per la parte non dedotta dalla persona a carico, al soggetto che la ha a carico, fermo restando lo stesso limite complessivo: un familiare a carico non aggiunge un secondo tetto (art. 8 comma 5).

I lavoratori di prima occupazione successiva all'entrata in vigore del decreto possono, nei venti anni successivi al quinto anno di partecipazione, dedurre contributi eccedenti il tetto annuo, entro l'ammontare complessivo dei contributi deducibili e non versati nei primi cinque anni e comunque non oltre la meta' del tetto annuo (art. 8 comma 6, nella formulazione sostituita dalla Legge di Bilancio 2026).

## Fonte

Decreto legislativo 5 dicembre 2005, n. 252, art. 8 comma 4 (urn:nir:stato:decreto.legislativo:2005-12-05;252): i contributi versati dal lavoratore e dal datore di lavoro o committente, sia volontari sia dovuti in base a contratti o accordi collettivi anche aziendali, sono deducibili ai sensi dell'art. 10 del TUIR dal reddito complessivo per un importo non superiore a 5.164,57 EUR, e ai fini del computo del limite si tiene conto anche delle quote accantonate dal datore ai fondi di previdenza dell'art. 105 comma 1 del TUIR.

Legge 30 dicembre 2025, n. 199, art. 1 comma 201 lettera a) numero 1 (urn:nir:stato:legge:2025-12-30;199): al comma 4 dell'art. 8 e' aggiunto il periodo per cui, a decorrere dal periodo d'imposta 2026, il limite e' innalzato a 5.300 EUR. La stessa lettera a), al numero 2, riscrive il comma 6 sulla deduzione differita dei lavoratori di prima occupazione ancorandola al limite del comma 4 invece che alle cifre fisse precedenti.

Entrambi i valori e i due periodi normativi sono stati riconciliati contro il corpus di `E:\legal-consultant` (`legge.sqlite`) il 2026-09-14, leggendo il testo vigente dell'art. 8 del D.Lgs. 252/2005 e il comma 201 della L. 199/2025. Lo script `npm run verify-params -- AAAA` ripete la verifica sui valori memorizzati in `params/AAAA.ts`.

## Verso l'ottimizzazione (Fase 3)

L'obiettivo di lungo periodo del tool e' stimare quanto convenga versare al fondo pensione per il massimo rendimento netto. La valutazione confronta tre alternative su un orizzonte pluriennale: il versamento al fondo, che gode della deduzione immediata piu' un rendimento tassato in modo agevolato in uscita; il mantenimento del TFR[^1] in azienda; e un investimento equivalente, per esempio un ETF[^2] tramite piano di accumulo, al netto delle imposte. La metodologia quantitativa, ispirata ai contenuti divulgativi di Paolo Coletti e ricodificata clean-room, sara' sviluppata qui e implementata in `src/optimizer/` nella Fase 3, a valle della fotografia fiscale che ne e' il contratto di input.

Il vincolo di saturazione descritto sopra e' il primo input di quella ottimizzazione: lo spazio deducibile da massimizzare non e' il tetto nominale ma il tetto al netto del contributo datoriale e delle altre quote che lo consumano, e la fotografia fiscale della Fase 2 deve quindi estrarre i versamenti dell'anno gia' separati per fonte.

Questa scheda oggi fissa i dati certi della deducibilita' e della composizione del tetto; le proiezioni finanziarie sono lavoro successivo e non vanno anticipate come fatto.

[^1]: *TFR*, Trattamento di Fine Rapporto - la liquidazione maturata dal lavoratore dipendente, che puo' restare in azienda o essere conferita a un fondo pensione.

[^2]: *ETF*, Exchange Traded Fund - fondo a gestione passiva quotato in borsa, spesso usato come riferimento di investimento a basso costo.
