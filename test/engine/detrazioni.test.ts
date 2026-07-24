import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import {
  type DetrazioneLavoroDipendenteParams,
  calcolaDetrazioneLavoroDipendente,
} from '../../src/engine/detrazioni.js';

/**
 * Parametri verificati per il 2025/2026. Fonte: TUIR art. 13 co. 1 (a/b/c) e co. 1.1; importo
 * della fascia piena a 1.955 EUR per L. 207/2024 art. 1 co. 2 lett. b.
 */
const p: DetrazioneLavoroDipendenteParams = {
  soglia1: euros(15_000),
  importoFascia1: euros(1_955),
  soglia2: euros(28_000),
  importoBaseFascia2: euros(1_910),
  incrementoFascia2: euros(1_190),
  denominatoreFascia2: euros(13_000),
  soglia3: euros(50_000),
  importoBaseFascia3: euros(1_910),
  denominatoreFascia3: euros(22_000),
  maggiorazione: { importo: euros(65), da: euros(25_000), a: euros(35_000) },
};

describe('calcolaDetrazioneLavoroDipendente', () => {
  it('reddito nullo o negativo: nessuna detrazione', () => {
    expect(calcolaDetrazioneLavoroDipendente(euros(0), p).totale).toBe(0);
  });

  it('fascia piena fino a 15.000: 1.955 EUR', () => {
    expect(toEuros(calcolaDetrazioneLavoroDipendente(euros(10_000), p).totale)).toBe(1955);
    expect(toEuros(calcolaDetrazioneLavoroDipendente(euros(15_000), p).totale)).toBe(1955);
  });

  it('fascia intermedia 15.000-28.000: 1.910 + 1.190*(28.000-R)/13.000', () => {
    // R=20.000 -> 1.910 + 1.190*8.000/13.000 = 2.642,31 (nessuna maggiorazione sotto 25.000)
    expect(toEuros(calcolaDetrazioneLavoroDipendente(euros(20_000), p).base)).toBeCloseTo(
      2642.31,
      2,
    );
    expect(calcolaDetrazioneLavoroDipendente(euros(20_000), p).maggiorazione).toBe(0);
  });

  it('al limite 28.000 la fascia intermedia vale l importo base 1.910, con maggiorazione 65', () => {
    const r = calcolaDetrazioneLavoroDipendente(euros(28_000), p);
    expect(toEuros(r.base)).toBe(1910);
    expect(toEuros(r.maggiorazione)).toBe(65); // 28.000 in [25.000, 35.000]
    expect(toEuros(r.totale)).toBe(1975);
  });

  it('fascia calante 28.000-50.000: 1.910*(50.000-R)/22.000', () => {
    // R=30.000 -> 1.910*20.000/22.000 = 1.736,36 + maggiorazione 65 = 1.801,36
    const r = calcolaDetrazioneLavoroDipendente(euros(30_000), p);
    expect(toEuros(r.base)).toBeCloseTo(1736.36, 2);
    expect(toEuros(r.maggiorazione)).toBe(65);
    expect(toEuros(r.totale)).toBeCloseTo(1801.36, 2);
  });

  it('la maggiorazione di 65 non spetta oltre 35.000', () => {
    expect(calcolaDetrazioneLavoroDipendente(euros(40_000), p).maggiorazione).toBe(0);
  });

  it('azzeramento a 50.000 e oltre', () => {
    expect(calcolaDetrazioneLavoroDipendente(euros(50_000), p).totale).toBe(0);
    expect(calcolaDetrazioneLavoroDipendente(euros(60_000), p).totale).toBe(0);
  });
});
