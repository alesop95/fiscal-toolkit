# Previdenza complementare: deducibilita' e ottimizzazione

## Deducibilita' dei contributi

I contributi versati alle forme pensionistiche complementari sono deducibili dal reddito complessivo fino a un tetto annuo di 5.164,57 EUR. La deduzione abbatte l'imponibile IRPEF, quindi il risparmio fiscale immediato di un versamento e' pari al contributo per l'aliquota marginale del contribuente: chi ha aliquota marginale al 35 per cento risparmia 35 centesimi di IRPEF per ogni euro versato entro il tetto.

## Fonte

Decreto legislativo 5 dicembre 2005, n. 252, art. 8 comma 4 (urn:nir:stato:decreto.legislativo:2005-12-05;252): la deduzione dal reddito complessivo opera ai sensi dell'art. 10 del TUIR per un importo non superiore a 5.164,57 EUR.

## Verso l'ottimizzazione (Fase 3)

L'obiettivo di lungo periodo del tool e' stimare quanto convenga versare al fondo pensione per il massimo rendimento netto. La valutazione confronta tre alternative su un orizzonte pluriennale: il versamento al fondo, che gode della deduzione immediata piu' un rendimento tassato in modo agevolato in uscita; il mantenimento del TFR[^1] in azienda; e un investimento equivalente, per esempio un ETF[^2] tramite piano di accumulo, al netto delle imposte. La metodologia quantitativa, ispirata ai contenuti divulgativi di Paolo Coletti e ricodificata clean-room, sara' sviluppata qui e implementata in `src/optimizer/` nella Fase 3, a valle della fotografia fiscale che ne e' il contratto di input.

Questa scheda oggi fissa solo il dato certo della deducibilita'; le proiezioni finanziarie sono lavoro successivo e non vanno anticipate come fatto.

[^1]: *TFR*, Trattamento di Fine Rapporto - la liquidazione maturata dal lavoratore dipendente, che puo' restare in azienda o essere conferita a un fondo pensione.

[^2]: *ETF*, Exchange Traded Fund - fondo a gestione passiva quotato in borsa, spesso usato come riferimento di investimento a basso costo.
