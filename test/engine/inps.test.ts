import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { type InpsParams, calcolaInpsDipendente } from '../../src/engine/inps.js';

/** Parametri di prova: aliquota base 9,19%, aggiuntiva 1% oltre la prima fascia. */
const p: InpsParams = {
  aliquotaBase: 0.0919,
  aliquotaAggiuntiva: 0.01,
  primaFasciaAnnua: euros(55_448),
};

describe('calcolaInpsDipendente', () => {
  it('imponibile nullo: nessun contributo', () => {
    expect(calcolaInpsDipendente(euros(0), p).totale).toBe(0);
  });

  it('sotto la prima fascia: solo aliquota base', () => {
    const r = calcolaInpsDipendente(euros(30_000), p);
    expect(toEuros(r.base)).toBe(2757); // 30.000 * 9,19%
    expect(r.aggiuntiva).toBe(0);
    expect(toEuros(r.totale)).toBe(2757);
  });

  it('oltre la prima fascia: base piu aggiuntiva 1% sull eccedenza', () => {
    const r = calcolaInpsDipendente(euros(60_000), p);
    expect(toEuros(r.base)).toBe(5514); // 60.000 * 9,19%
    expect(toEuros(r.aggiuntiva)).toBeCloseTo(45.52, 2); // (60.000-55.448) * 1%
    expect(toEuros(r.totale)).toBeCloseTo(5559.52, 2);
  });
});
