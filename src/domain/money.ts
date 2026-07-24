/**
 * Importi monetari come interi in centesimi, con arrotondamento fiscale centralizzato.
 *
 * Rappresentare gli importi in centesimi interi evita la deriva del floating point che
 * affligge i calcoli fiscali in euro decimali (0.1 + 0.2 !== 0.3). Il tipo Money e' un branded
 * number: a runtime e' un numero, ma il compilatore impedisce di mescolare centesimi con euro
 * grezzi o con quantita' non monetarie senza passare per i costruttori di questo modulo.
 *
 * L'arrotondamento e' half-away-from-zero (il mezzo centesimo, o il mezzo euro, si allontana
 * sempre dallo zero), coerente con la prassi dell'arrotondamento fiscale italiano. La funzione
 * roundToWholeEuro implementa l'arrotondamento all'unita' di euro previsto per le imposte.
 */

declare const moneyBrand: unique symbol;

/** Importo monetario come intero in centesimi. Costruire solo tramite cents() o euros(). */
export type Money = number & { readonly [moneyBrand]: never };

/** Arrotondamento simmetrico rispetto allo zero: il .5 si allontana sempre dallo zero. */
function roundHalfAwayFromZero(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

/** Importo zero. */
export const zero: Money = 0 as Money;

/** Costruisce un Money da un numero di centesimi, che deve essere intero. */
export function cents(n: number): Money {
  if (!Number.isInteger(n)) {
    throw new RangeError(`Money richiede centesimi interi, ricevuto ${n}`);
  }
  return n as Money;
}

/** Costruisce un Money da un importo in euro (anche decimale), arrotondando al centesimo. */
export function euros(amount: number): Money {
  return cents(roundHalfAwayFromZero(amount * 100));
}

/** Restituisce l'importo in euro come numero decimale (per formattazione e confini esterni). */
export function toEuros(m: Money): number {
  return (m as number) / 100;
}

/** Restituisce l'importo in centesimi come numero intero. */
export function toCents(m: Money): number {
  return m as number;
}

export function add(a: Money, b: Money): Money {
  return (a + b) as Money;
}

export function subtract(a: Money, b: Money): Money {
  return (a - b) as Money;
}

export function negate(a: Money): Money {
  return -a as Money;
}

/** Somma una sequenza di importi, restituendo zero su lista vuota. */
export function sum(values: readonly Money[]): Money {
  return values.reduce<number>((acc, v) => acc + (v as number), 0) as Money;
}

/**
 * Applica un'aliquota (frazione, es. 0.23) a un importo e arrotonda al centesimo.
 * E' l'unico punto in cui un importo monetario viene moltiplicato per un tasso.
 */
export function applyRate(base: Money, rate: number): Money {
  return cents(roundHalfAwayFromZero((base as number) * rate));
}

/** Arrotondamento all'unita' di euro (arrotondamento fiscale delle imposte). */
export function roundToWholeEuro(m: Money): Money {
  return cents(roundHalfAwayFromZero((m as number) / 100) * 100);
}

export function isZero(m: Money): boolean {
  return (m as number) === 0;
}

export function isNegative(m: Money): boolean {
  return (m as number) < 0;
}

/** Ordinamento: negativo se a < b, zero se uguali, positivo se a > b. */
export function compare(a: Money, b: Money): number {
  return (a as number) - (b as number);
}

export function max(a: Money, b: Money): Money {
  return (a as number) >= (b as number) ? a : b;
}

export function min(a: Money, b: Money): Money {
  return (a as number) <= (b as number) ? a : b;
}

/** Formatta all'italiana: "1.234,56 €". Con withSymbol: false omette il simbolo di valuta. */
export function format(m: Money, options: { withSymbol?: boolean } = {}): string {
  const value = (m as number) / 100;
  const formatted = value.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
  return options.withSymbol === false ? formatted : `${formatted} €`;
}
