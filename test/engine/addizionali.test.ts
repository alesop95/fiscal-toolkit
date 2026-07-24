import { describe, expect, it } from 'vitest';
import type { Scaglione } from '../../params/schema.js';
import { euros, toEuros } from '../../src/domain/money.js';
import {
  calcolaAddizionaleComunale,
  calcolaAddizionaleRegionale,
} from '../../src/engine/addizionali.js';

/** Aliquote di esempio, non reali, solo per esercitare la struttura del calcolo. */
const scaglioniRegionali: Scaglione[] = [
  { limiteSuperiore: 1_500_000, aliquota: 0.0123 },
  { limiteSuperiore: null, aliquota: 0.0173 },
];

describe('calcolaAddizionaleRegionale', () => {
  it('applica le aliquote per scaglioni in modo marginale', () => {
    // 20.000: 15.000 * 1,23% + 5.000 * 1,73% = 184,50 + 86,50 = 271,00
    expect(toEuros(calcolaAddizionaleRegionale(euros(20_000), scaglioniRegionali))).toBeCloseTo(
      271,
      2,
    );
  });

  it('gestisce l aliquota unica come un solo scaglione illimitato', () => {
    const flat: Scaglione[] = [{ limiteSuperiore: null, aliquota: 0.008 }];
    expect(toEuros(calcolaAddizionaleRegionale(euros(10_000), flat))).toBe(80);
  });
});

describe('calcolaAddizionaleComunale', () => {
  it('applica l aliquota unica al reddito', () => {
    const r = calcolaAddizionaleComunale(euros(20_000), { aliquota: 0.008, sogliaEsenzione: null });
    expect(toEuros(r)).toBe(160);
  });

  it('esenta totalmente sotto la soglia di esenzione', () => {
    const p = { aliquota: 0.008, sogliaEsenzione: euros(10_000) };
    expect(calcolaAddizionaleComunale(euros(9_000), p)).toBe(0);
    expect(toEuros(calcolaAddizionaleComunale(euros(11_000), p))).toBe(88);
  });
});
