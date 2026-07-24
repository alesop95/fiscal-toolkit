/**
 * Addizionali IRPEF regionale e comunale.
 *
 * Funzioni pure (imponibile, params) => importo. L'addizionale regionale e' applicata per
 * scaglioni con la stessa logica marginale dell'IRPEF (le regioni che adottano scaglioni li
 * applicano progressivamente, ai sensi del d.lgs. 68/2011), quindi riusa il calcolo per scaglioni
 * del motore IRPEF. L'addizionale comunale e' tipicamente un'aliquota unica sul reddito, con una
 * eventuale soglia di esenzione sotto la quale non e' dovuta.
 *
 * Le aliquote e le soglie sono specifiche di regione e comune, fissate da legge regionale e da
 * delibera comunale, e non stanno nel corpus normativo statale: vivono nei parametri dell'anno,
 * marcate con la loro fonte, e vanno acquisite dalla fonte ufficiale (Regione, MEF, comune). Qui
 * vive solo la struttura del calcolo.
 */

import type { Scaglione } from '../../params/schema.js';
import { type Money, applyRate, toCents, zero } from '../domain/money.js';
import { calcolaIrpefLorda } from './irpef.js';

/** Costanti dell'addizionale comunale. */
export interface AddizionaleComunaleParams {
  /** Aliquota unica applicata al reddito, come frazione. */
  aliquota: number;
  /** Soglia di esenzione: se il reddito non la supera, l'addizionale non e' dovuta. null = nessuna. */
  sogliaEsenzione: Money | null;
}

/**
 * Addizionale regionale per scaglioni (aliquota marginale, come l'IRPEF). Riusa il calcolo per
 * scaglioni; un'aliquota unica si esprime come un solo scaglione con limite superiore null.
 */
export function calcolaAddizionaleRegionale(
  imponibile: Money,
  scaglioni: readonly Scaglione[],
): Money {
  return calcolaIrpefLorda(imponibile, scaglioni).lorda;
}

/**
 * Addizionale comunale ad aliquota unica, con eventuale soglia di esenzione totale sotto la quale
 * non e' dovuta. Imponibile nullo o negativo produce importo zero.
 */
export function calcolaAddizionaleComunale(imponibile: Money, p: AddizionaleComunaleParams): Money {
  const imp = toCents(imponibile);
  if (imp <= 0) {
    return zero;
  }
  if (p.sogliaEsenzione !== null && imp <= toCents(p.sogliaEsenzione)) {
    return zero;
  }
  return applyRate(imponibile, p.aliquota);
}
