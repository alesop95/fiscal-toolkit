/**
 * Cuneo fiscale sul lavoro dipendente, misura strutturale dal 2025.
 *
 * La L. 207/2024 art. 1 introduce due misure alternative a seconda del reddito complessivo:
 * per i redditi fino a 20.000 EUR (co. 4) una somma che non concorre alla formazione del reddito,
 * pari a una percentuale del reddito di lavoro dipendente decrescente per fasce; per i redditi
 * oltre 20.000 EUR (co. 6) un'ulteriore detrazione dall'imposta lorda, piena fino a 32.000 EUR e
 * poi calante linearmente fino ad azzerarsi a 40.000 EUR. Le due misure si escludono a vicenda.
 *
 * La distinzione e' sostanziale nel calcolo del netto: la somma del co. 4 e' un importo che si
 * aggiunge al netto (non e' tassato), mentre la detrazione del co. 6 riduce l'imposta lorda. Per
 * questo il risultato ne dichiara il tipo, cosi' l'orchestratore lordo-netto la applica al posto
 * giusto. Funzione pura (redditi, params) => risultato; i numeri vivono in params, citati contro
 * L. 207/2024 art. 1 co. 4-6.
 */

import { type Money, applyRate, cents, toCents, zero } from '../domain/money.js';

/** Una fascia della somma del co. 4: percentuale applicata fino a un limite di reddito di lavoro. */
export interface FasciaSomma {
  /** Limite superiore del reddito di lavoro per questa fascia (null = illimitato). */
  limiteRedditoLavoro: Money | null;
  /** Percentuale applicata al reddito di lavoro, come frazione. */
  percentuale: number;
}

/** Costanti normative del cuneo 2025, in centesimi. */
export interface CuneoParams {
  /** Somma del co. 4: spetta se il reddito complessivo non supera questa soglia (20.000 EUR). */
  somma: {
    sogliaRedditoComplessivo: Money;
    fasce: readonly FasciaSomma[];
  };
  /** Ulteriore detrazione del co. 6, per reddito complessivo oltre la soglia della somma. */
  detrazione: {
    /** Importo pieno (1.000 EUR). */
    importoPieno: Money;
    /** Soglia entro cui spetta l'importo pieno (32.000 EUR). */
    sogliaImportoPieno: Money;
    /** Soglia di azzeramento (40.000 EUR). */
    sogliaAzzeramento: Money;
    /** Denominatore del tratto calante (8.000 EUR). */
    denominatore: Money;
  };
}

/** Tipo di misura del cuneo applicata al contribuente. */
export type TipoCuneo = 'somma' | 'detrazione' | 'nessuno';

/** Esito del calcolo del cuneo: tipo di misura e importo. */
export interface RisultatoCuneo {
  tipo: TipoCuneo;
  importo: Money;
}

/** Arrotondamento al centesimo, half away from zero. */
function arrotondaCent(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

/**
 * Calcola il cuneo per un lavoratore dipendente dato il reddito complessivo e il reddito di
 * lavoro dipendente. Se il reddito complessivo non supera la soglia della somma, restituisce la
 * somma del co. 4; altrimenti l'ulteriore detrazione del co. 6, fino all'azzeramento.
 */
export function calcolaCuneo(
  redditoComplessivo: Money,
  redditoLavoroDipendente: Money,
  p: CuneoParams,
): RisultatoCuneo {
  const rc = toCents(redditoComplessivo);
  if (rc <= 0) {
    return { tipo: 'nessuno', importo: zero };
  }

  if (rc <= toCents(p.somma.sogliaRedditoComplessivo)) {
    const rl = toCents(redditoLavoroDipendente);
    for (const fascia of p.somma.fasce) {
      const limite = fascia.limiteRedditoLavoro;
      if (limite === null || rl <= toCents(limite)) {
        return { tipo: 'somma', importo: applyRate(redditoLavoroDipendente, fascia.percentuale) };
      }
    }
    return { tipo: 'somma', importo: zero };
  }

  if (rc <= toCents(p.detrazione.sogliaImportoPieno)) {
    return { tipo: 'detrazione', importo: p.detrazione.importoPieno };
  }
  if (rc <= toCents(p.detrazione.sogliaAzzeramento)) {
    const ratio =
      (toCents(p.detrazione.sogliaAzzeramento) - rc) / toCents(p.detrazione.denominatore);
    return {
      tipo: 'detrazione',
      importo: cents(arrotondaCent(toCents(p.detrazione.importoPieno) * ratio)),
    };
  }
  return { tipo: 'nessuno', importo: zero };
}
