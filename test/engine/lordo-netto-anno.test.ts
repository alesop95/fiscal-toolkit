import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { calcolaLordoNettoAnno } from '../../src/engine/params-motore.js';

describe('calcolaLordoNettoAnno con parametri reali', () => {
  it('2025: include l addizionale comunale di Civitanova (0,72%) e non la regionale', () => {
    const r = calcolaLordoNettoAnno(2025, euros(30_000));
    // Imponibile 27.243,00 > soglia esenzione 8.173,99 -> comunale = 27.243 * 0,72% = 196,15
    expect(toEuros(r.addizionaleComunale)).toBeCloseTo(196.15, 2);
    // La regionale non e' ancora nei parametri
    expect(r.addizionaleRegionale).toBe(0);
    // Le addizionali totali coincidono con la sola comunale
    expect(r.addizionali).toBe(r.addizionaleComunale);
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
