import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { calcolaLordoNettoAnno } from '../../src/engine/params-motore.js';

describe('calcolaLordoNettoAnno con parametri reali', () => {
  it('2025: include addizionale regionale Marche e comunale Civitanova', () => {
    const r = calcolaLordoNettoAnno(2025, euros(30_000));
    // Imponibile 27.243,00. Regionale: 15.000*1,23% + 12.243*1,53% = 184,50 + 187,32 = 371,82
    expect(toEuros(r.addizionaleRegionale)).toBeCloseTo(371.82, 2);
    // Comunale: 27.243 > soglia 8.173,99 -> 27.243 * 0,72% = 196,15
    expect(toEuros(r.addizionaleComunale)).toBeCloseTo(196.15, 2);
    // Totale addizionali = regionale + comunale
    expect(toEuros(r.addizionali)).toBeCloseTo(567.97, 2);
  });

  it('sotto la soglia di esenzione comunale l addizionale non e dovuta', () => {
    // RAL bassa: imponibile sotto 8.173,99 -> comunale zero
    const r = calcolaLordoNettoAnno(2025, euros(8_000));
    expect(r.addizionaleComunale).toBe(0);
  });

  it('anno non modellato lancia un errore', () => {
    expect(() => calcolaLordoNettoAnno(2024, euros(30_000))).toThrow();
  });
});
