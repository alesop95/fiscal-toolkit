/**
 * La curva del prelievo al variare della RAL. I valori attesi non sono inventati: sono stati
 * rilevati eseguendo il motore e qui si fissano come comportamento, con asserzioni sul segno e
 * sull'ordine di grandezza degli scalini invece che su decimali fragili.
 */

import { describe, expect, it } from 'vitest';
import { euros, toCents, toEuros } from '../../src/domain/money.js';
import { CURVA_DEFAULT, MAX_PUNTI, componiCurva, serializzaCurva } from '../../src/report/curva.js';

describe('componiCurva', () => {
  const curva = componiCurva(2025, { da: euros(15_000), a: euros(60_000), passo: euros(1_000) });

  it('campiona gli estremi inclusi con il passo indicato', () => {
    expect(curva.punti).toHaveLength(46);
    expect(toEuros(curva.punti[0]?.ral ?? euros(0))).toBe(15_000);
    expect(toEuros(curva.punti[45]?.ral ?? euros(0))).toBe(60_000);
  });

  it('il netto cresce lungo tutta la curva', () => {
    for (let i = 1; i < curva.punti.length; i += 1) {
      const precedente = curva.punti[i - 1];
      const corrente = curva.punti[i];
      if (!precedente || !corrente) {
        throw new Error('punto mancante');
      }
      expect(toCents(corrente.nettoAnnuo)).toBeGreaterThan(toCents(precedente.nettoAnnuo));
    }
  });

  /** Punti oltre la discontinuita' della detrazione, dove la curva e' regolare. */
  const oltreLoScalone = curva.punti.filter((p) => toEuros(p.ral) >= 17_000);

  it('oltre lo scalone della detrazione la pressione fiscale cresce senza inversioni', () => {
    // Con la pressione definita come divario fra lordo e netto non ci sono inversioni alla soglia
    // del cuneo: e' l'invariante che l'indicatore precedente, misurato sui soli prelievi, rompeva.
    for (let i = 1; i < oltreLoScalone.length; i += 1) {
      const precedente = oltreLoScalone[i - 1];
      const corrente = oltreLoScalone[i];
      if (!precedente || !corrente) {
        throw new Error('punto mancante');
      }
      expect(corrente.pressioneFiscale).toBeGreaterThan(precedente.pressioneFiscale);
    }
  });

  it('oltre lo scalone la marginale effettiva supera sempre la marginale IRPEF di legge', () => {
    // I contributi e la decrescita delle detrazioni si sommano all'IRPEF: l'euro lordo in piu'
    // rende sempre meno di quanto lascerebbe intendere lo scaglione.
    for (const p of oltreLoScalone) {
      expect(p.aliquotaMarginaleEffettiva).toBeGreaterThan(p.aliquotaMarginaleIrpef);
    }
  });

  it('espone la discontinuita della detrazione al passaggio di 15.000 EUR di imponibile', () => {
    // TUIR art. 13 co. 1: fino a 15.000 EUR di reddito la detrazione e' 1.955 EUR fissi, appena
    // sopra riparte da 1.910 + 1.190, cioe' circa 3.100. Il salto e' nella struttura della norma
    // come modellata in params, e la curva lo rende visibile: sulla scala della RAL cade fra
    // 16.000 e 17.000, perche' i contributi precedono l'imponibile. Nello stesso punto la somma
    // del cuneo cambia fascia percentuale. Il segno negativo dice che li' mille euro lordi in piu'
    // fanno crescere il netto di piu' di mille euro.
    const stretta = componiCurva(2025, {
      da: euros(16_000),
      a: euros(17_000),
      passo: euros(1_000),
    });
    const salto = stretta.punti[0]?.aliquotaMarginaleEffettiva ?? 0;
    expect(salto).toBeLessThan(0);
  });

  it('mostra lo scalino dove si spegne la somma del cuneo', () => {
    // La soglia di legge e' sui 20.000 EUR di reddito complessivo, cioe' sull'imponibile: sulla
    // scala della RAL cade poco oltre i 22.000, perche' i contributi la precedono.
    const stretta = componiCurva(2025, {
      da: euros(21_000),
      a: euros(24_000),
      passo: euros(1_000),
    });
    const prima = stretta.punti[0]?.aliquotaMarginaleEffettiva ?? 0;
    const dopo = stretta.punti[3]?.aliquotaMarginaleEffettiva ?? 0;
    expect(prima).toBeGreaterThan(0.3);
    expect(dopo).toBeGreaterThan(prima + 0.03);
  });

  it('nella fascia in cui decresce l ulteriore detrazione la marginale effettiva sfonda il 50%', () => {
    const fascia = curva.punti.filter((p) => {
      const ral = toEuros(p.ral);
      return ral >= 32_000 && ral <= 40_000;
    });
    const massima = Math.max(...fascia.map((p) => p.aliquotaMarginaleEffettiva));
    expect(massima).toBeGreaterThan(0.5);
    expect(massima).toBeGreaterThan(0.35 + 0.2);
  });

  it('usa gli estremi di default quando non sono indicati', () => {
    const d = componiCurva(2025);
    expect(d.da).toBe(CURVA_DEFAULT.da);
    expect(d.a).toBe(CURVA_DEFAULT.a);
    expect(d.passo).toBe(CURVA_DEFAULT.passo);
  });

  it('rifiuta intervallo, passo e campionamenti non sensati', () => {
    expect(() => componiCurva(2025, { da: euros(30_000), a: euros(10_000) })).toThrow(RangeError);
    expect(() => componiCurva(2025, { passo: euros(0) })).toThrow(RangeError);
    expect(() => componiCurva(2025, { da: euros(0), a: euros(60_000), passo: euros(100) })).toThrow(
      new RegExp(String(MAX_PUNTI)),
    );
  });

  it('lancia su un anno senza parametri modellati', () => {
    expect(() => componiCurva(2024, { da: euros(20_000), a: euros(21_000) })).toThrow();
  });

  it('serializza la curva con importi in euro', () => {
    const s = serializzaCurva(
      componiCurva(2025, { da: euros(20_000), a: euros(22_000), passo: euros(1_000) }),
    );
    expect(s.anno).toBe(2025);
    expect(s.passo).toBe(1_000);
    expect(s.punti.map((p) => p.ral)).toEqual([20_000, 21_000, 22_000]);
  });
});
