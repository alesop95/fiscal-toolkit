import { describe, expect, it } from 'vitest';
import type { Scaglione } from '../../params/schema.js';
import { cents, euros, toEuros } from '../../src/domain/money.js';
import { aliquotaMarginale, calcolaIrpefLorda } from '../../src/engine/irpef.js';

/**
 * Scaglioni verificati per gli anni d'imposta 2024/2025/2026: 23% fino a 28.000 EUR,
 * 35% da 28.000 a 50.000 EUR, 43% oltre. Fonte: D.Lgs. 216/2023 art. 1 (2024) e L. 207/2024
 * art. 1 co. 2 lett. a (dal 2025, sostituzione dell'art. 11 co. 1 TUIR). Valori in centesimi.
 */
const scaglioni: Scaglione[] = [
  { limiteSuperiore: 2_800_000, aliquota: 0.23 },
  { limiteSuperiore: 5_000_000, aliquota: 0.35 },
  { limiteSuperiore: null, aliquota: 0.43 },
];

describe('calcolaIrpefLorda', () => {
  it('imponibile nullo o negativo non produce imposta', () => {
    expect(calcolaIrpefLorda(euros(0), scaglioni).lorda).toBe(0);
    expect(calcolaIrpefLorda(cents(-100), scaglioni).lorda).toBe(0);
  });

  it('tassa dentro il primo scaglione con la sola aliquota al 23%', () => {
    const r = calcolaIrpefLorda(euros(20_000), scaglioni);
    expect(toEuros(r.lorda)).toBe(4600); // 20.000 * 23%
    expect(r.dettaglio).toHaveLength(1);
  });

  it('boundary 27.999: interamente nel primo scaglione', () => {
    const r = calcolaIrpefLorda(euros(27_999), scaglioni);
    expect(toEuros(r.lorda)).toBeCloseTo(6439.77, 2); // 27.999 * 23%
    expect(r.dettaglio).toHaveLength(1);
  });

  it('boundary 28.000: ancora solo 23%, il secondo scaglione non si attiva', () => {
    const r = calcolaIrpefLorda(euros(28_000), scaglioni);
    expect(toEuros(r.lorda)).toBe(6440); // 28.000 * 23%
    expect(r.dettaglio).toHaveLength(1);
    expect(aliquotaMarginale(euros(28_000), scaglioni)).toBe(0.23);
  });

  it('boundary 28.000,01: un centesimo entra nel secondo scaglione', () => {
    const r = calcolaIrpefLorda(cents(2_800_001), scaglioni);
    expect(r.dettaglio).toHaveLength(2);
    expect(aliquotaMarginale(cents(2_800_001), scaglioni)).toBe(0.35);
  });

  it('boundary 50.000: primo e secondo scaglione, il terzo non si attiva', () => {
    const r = calcolaIrpefLorda(euros(50_000), scaglioni);
    // 28.000*23% + 22.000*35% = 6.440 + 7.700 = 14.140
    expect(toEuros(r.lorda)).toBe(14_140);
    expect(r.dettaglio).toHaveLength(2);
    expect(aliquotaMarginale(euros(50_000), scaglioni)).toBe(0.35);
  });

  it('boundary 50.000,01: un centesimo entra nel terzo scaglione al 43%', () => {
    const r = calcolaIrpefLorda(cents(5_000_001), scaglioni);
    expect(r.dettaglio).toHaveLength(3);
    expect(aliquotaMarginale(cents(5_000_001), scaglioni)).toBe(0.43);
  });

  it('reddito alto: somma corretta sui tre scaglioni', () => {
    const r = calcolaIrpefLorda(euros(60_000), scaglioni);
    // 6.440 + 7.700 + 10.000*43% (4.300) = 18.440
    expect(toEuros(r.lorda)).toBe(18_440);
    expect(r.dettaglio).toHaveLength(3);
  });
});
