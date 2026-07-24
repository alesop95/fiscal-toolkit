/**
 * Detrazione per redditi di lavoro dipendente, TUIR art. 13 co. 1 e co. 1.1.
 *
 * Funzione pura (reddito, params) => risultato. La detrazione e' decrescente per fasce di reddito
 * complessivo: piena fino a 15.000 EUR, poi due tratti lineari calanti fino ad azzerarsi a
 * 50.000 EUR, con una maggiorazione fissa per la fascia 25.000-35.000 EUR. Tutti gli importi e le
 * soglie sono parametri (in centesimi), citati in params/AAAA.ts contro TUIR art. 13; qui vive
 * solo la struttura della formula.
 *
 * Fonte della struttura: DPR 917/1986 (TUIR) art. 13 co. 1 lett. a/b/c e co. 1.1. Il valore
 * della fascia piena e' passato a 1.955 EUR dalla L. 207/2024 art. 1 co. 2 lett. b (dal 2025).
 *
 * Nota: la legge prevede che la detrazione sia rapportata al periodo di lavoro nell'anno e fissa
 * importi minimi (690 EUR, 1.380 EUR a tempo determinato) rilevanti per i periodi brevi. Questa
 * implementazione calcola la detrazione su base annua piena; il ragguaglio a giorni e i minimi
 * per periodo breve sono un affinamento successivo, tracciato come da verificare.
 */

import { type Money, cents, toCents, zero } from '../domain/money.js';

/** Costanti normative della detrazione da lavoro dipendente, in centesimi. */
export interface DetrazioneLavoroDipendenteParams {
  /** Soglia della fascia a importo pieno (15.000 EUR). */
  soglia1: Money;
  /** Importo pieno fino a soglia1 (1.955 EUR dal 2025). */
  importoFascia1: Money;
  /** Soglia superiore della fascia lineare intermedia (28.000 EUR). */
  soglia2: Money;
  /** Importo base della fascia intermedia (1.910 EUR). */
  importoBaseFascia2: Money;
  /** Incremento massimo della fascia intermedia (1.190 EUR). */
  incrementoFascia2: Money;
  /** Denominatore della fascia intermedia (13.000 EUR). */
  denominatoreFascia2: Money;
  /** Soglia di azzeramento (50.000 EUR). */
  soglia3: Money;
  /** Importo base della fascia calante finale (1.910 EUR). */
  importoBaseFascia3: Money;
  /** Denominatore della fascia calante finale (22.000 EUR). */
  denominatoreFascia3: Money;
  /** Maggiorazione co. 1.1: importo fisso per la fascia [da, a] di reddito complessivo. */
  maggiorazione: { importo: Money; da: Money; a: Money };
}

/** Esito del calcolo della detrazione: parte base, maggiorazione e totale. */
export interface RisultatoDetrazione {
  base: Money;
  maggiorazione: Money;
  totale: Money;
}

/** Arrotondamento al centesimo, half away from zero, per i prodotti frazionari. */
function arrotondaCent(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

/**
 * Calcola la detrazione da lavoro dipendente su base annua piena per un dato reddito complessivo.
 * Reddito nullo o negativo, oppure oltre la soglia di azzeramento, produce detrazione zero.
 */
export function calcolaDetrazioneLavoroDipendente(
  redditoComplessivo: Money,
  p: DetrazioneLavoroDipendenteParams,
): RisultatoDetrazione {
  const r = toCents(redditoComplessivo);

  let base = 0;
  if (r <= 0) {
    base = 0;
  } else if (r <= toCents(p.soglia1)) {
    base = toCents(p.importoFascia1);
  } else if (r <= toCents(p.soglia2)) {
    const ratio = (toCents(p.soglia2) - r) / toCents(p.denominatoreFascia2);
    base = toCents(p.importoBaseFascia2) + arrotondaCent(toCents(p.incrementoFascia2) * ratio);
  } else if (r <= toCents(p.soglia3)) {
    const ratio = (toCents(p.soglia3) - r) / toCents(p.denominatoreFascia3);
    base = arrotondaCent(toCents(p.importoBaseFascia3) * ratio);
  } else {
    base = 0;
  }

  let maggiorazione = 0;
  if (r > toCents(p.maggiorazione.da) && r <= toCents(p.maggiorazione.a)) {
    maggiorazione = toCents(p.maggiorazione.importo);
  }

  if (base === 0 && maggiorazione === 0) {
    return { base: zero, maggiorazione: zero, totale: zero };
  }
  return {
    base: cents(base),
    maggiorazione: cents(maggiorazione),
    totale: cents(base + maggiorazione),
  };
}
