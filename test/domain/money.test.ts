import { describe, expect, it } from 'vitest';
import {
  add,
  applyRate,
  cents,
  compare,
  euros,
  format,
  max,
  min,
  roundToWholeEuro,
  subtract,
  sum,
  toEuros,
} from '../../src/domain/money.js';

describe('money', () => {
  it('costruisce da euro arrotondando al centesimo e neutralizza la deriva float', () => {
    expect(euros(12.34)).toBe(1234);
    // 0.1 + 0.2 === 0.30000000000000004: deve comunque dare 30 centesimi
    expect(euros(0.1 + 0.2)).toBe(30);
  });

  it('rifiuta un numero di centesimi non intero', () => {
    expect(() => cents(10.5)).toThrow(RangeError);
  });

  it('somma e sottrae in centesimi', () => {
    expect(add(euros(10), euros(0.05))).toBe(1005);
    expect(subtract(euros(10), euros(3.33))).toBe(667);
    expect(sum([euros(1), euros(2), euros(3)])).toBe(600);
    expect(sum([])).toBe(0);
  });

  it('applica un aliquota arrotondando al centesimo (half away from zero)', () => {
    expect(applyRate(euros(100), 0.23)).toBe(2300);
    // 333 centesimi * 0.5 = 166.5 -> 167
    expect(applyRate(cents(333), 0.5)).toBe(167);
  });

  it('arrotonda all unita di euro (arrotondamento fiscale)', () => {
    expect(roundToWholeEuro(euros(123.49))).toBe(12300);
    expect(roundToWholeEuro(euros(123.5))).toBe(12400);
    expect(roundToWholeEuro(euros(-123.5))).toBe(-12400);
  });

  it('confronta e ordina importi', () => {
    expect(compare(euros(10), euros(20))).toBeLessThan(0);
    expect(max(euros(10), euros(20))).toBe(2000);
    expect(min(euros(10), euros(20))).toBe(1000);
  });

  it('converte in euro e formatta all italiana', () => {
    expect(toEuros(cents(1234))).toBe(12.34);
    expect(format(euros(1234.5))).toBe('1.234,50 €');
    expect(format(euros(1234.5), { withSymbol: false })).toBe('1.234,50');
  });
});
