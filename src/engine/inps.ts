/**
 * Contributi INPS a carico del lavoratore dipendente.
 *
 * Funzione pura (imponibile, params) => risultato. Sull'imponibile previdenziale si applica
 * l'aliquota base a carico del lavoratore; sulla parte di imponibile che eccede la prima fascia
 * di retribuzione pensionabile si applica in piu' l'aliquota aggiuntiva. Aliquote e soglia sono
 * parametri: l'aliquota base e la prima fascia sono valori amministrativi INPS aggiornati ogni
 * anno, l'aliquota aggiuntiva dell'1 per cento sull'eccedenza ha base nell'art. 3-ter del
 * decreto-legge 19 settembre 1992, n. 384, convertito dalla legge 14 novembre 1992, n. 438.
 * La citazione puntuale di ciascun valore vive in params/AAAA.ts.
 */

import { type Money, add, applyRate, subtract, toCents, zero } from '../domain/money.js';

/** Costanti contributive a carico del lavoratore dipendente. */
export interface InpsParams {
  /** Aliquota base a carico del lavoratore (es. 0.0919), come frazione. */
  aliquotaBase: number;
  /** Aliquota aggiuntiva sull'eccedenza della prima fascia (es. 0.01), come frazione. */
  aliquotaAggiuntiva: number;
  /** Prima fascia di retribuzione pensionabile su base annua, oltre cui scatta l'aggiuntiva. */
  primaFasciaAnnua: Money;
}

/** Esito del calcolo dei contributi: imponibile, quota base, quota aggiuntiva e totale. */
export interface RisultatoInps {
  imponibile: Money;
  base: Money;
  aggiuntiva: Money;
  totale: Money;
}

/**
 * Calcola i contributi INPS del lavoratore dipendente sull'imponibile previdenziale dato.
 * Imponibile nullo o negativo produce contributi zero.
 */
export function calcolaInpsDipendente(imponibile: Money, p: InpsParams): RisultatoInps {
  if (toCents(imponibile) <= 0) {
    return { imponibile, base: zero, aggiuntiva: zero, totale: zero };
  }
  const base = applyRate(imponibile, p.aliquotaBase);
  const eccedenza = subtract(imponibile, p.primaFasciaAnnua);
  const aggiuntiva = toCents(eccedenza) > 0 ? applyRate(eccedenza, p.aliquotaAggiuntiva) : zero;
  return { imponibile, base, aggiuntiva, totale: add(base, aggiuntiva) };
}
