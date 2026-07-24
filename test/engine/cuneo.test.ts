import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { type CuneoParams, calcolaCuneo } from '../../src/engine/cuneo.js';

/**
 * Parametri verificati per il 2025. Fonte: L. 207/2024 art. 1 co. 4 (somma) e co. 6 (detrazione).
 */
const p: CuneoParams = {
  somma: {
    sogliaRedditoComplessivo: euros(20_000),
    fasce: [
      { limiteRedditoLavoro: euros(8_500), percentuale: 0.071 },
      { limiteRedditoLavoro: euros(15_000), percentuale: 0.053 },
      { limiteRedditoLavoro: null, percentuale: 0.048 },
    ],
  },
  detrazione: {
    importoPieno: euros(1_000),
    sogliaImportoPieno: euros(32_000),
    sogliaAzzeramento: euros(40_000),
    denominatore: euros(8_000),
  },
};

describe('calcolaCuneo', () => {
  it('reddito nullo: nessuna misura', () => {
    const r = calcolaCuneo(euros(0), euros(0), p);
    expect(r.tipo).toBe('nessuno');
    expect(r.importo).toBe(0);
  });

  it('somma co.4: 7,1% fino a 8.500 di reddito da lavoro', () => {
    const r = calcolaCuneo(euros(8_500), euros(8_500), p);
    expect(r.tipo).toBe('somma');
    expect(toEuros(r.importo)).toBeCloseTo(603.5, 2); // 8.500 * 7,1%
  });

  it('somma co.4: 5,3% nella fascia 8.500-15.000', () => {
    const r = calcolaCuneo(euros(12_000), euros(12_000), p);
    expect(r.tipo).toBe('somma');
    expect(toEuros(r.importo)).toBeCloseTo(636, 2); // 12.000 * 5,3%
  });

  it('somma co.4: 4,8% oltre 15.000 di reddito da lavoro, entro 20.000 complessivo', () => {
    const r = calcolaCuneo(euros(19_000), euros(19_000), p);
    expect(r.tipo).toBe('somma');
    expect(toEuros(r.importo)).toBeCloseTo(912, 2); // 19.000 * 4,8%
  });

  it('detrazione co.6: 1.000 EUR pieni tra 20.000 e 32.000', () => {
    const r = calcolaCuneo(euros(28_000), euros(28_000), p);
    expect(r.tipo).toBe('detrazione');
    expect(toEuros(r.importo)).toBe(1000);
  });

  it('detrazione co.6: calante tra 32.000 e 40.000', () => {
    // R=36.000 -> 1.000*(40.000-36.000)/8.000 = 500
    const r = calcolaCuneo(euros(36_000), euros(36_000), p);
    expect(r.tipo).toBe('detrazione');
    expect(toEuros(r.importo)).toBe(500);
  });

  it('nessuna misura oltre 40.000', () => {
    const r = calcolaCuneo(euros(45_000), euros(45_000), p);
    expect(r.tipo).toBe('nessuno');
    expect(r.importo).toBe(0);
  });
});
