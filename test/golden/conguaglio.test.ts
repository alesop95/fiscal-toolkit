import { describe, expect, it } from 'vitest';
import { params2025 } from '../../params/2025.js';
import { cents, subtract, toEuros } from '../../src/domain/money.js';
import { calcolaCuneo } from '../../src/engine/cuneo.js';
import { calcolaDetrazioneLavoroDipendente } from '../../src/engine/detrazioni.js';
import { calcolaIrpefLorda } from '../../src/engine/irpef.js';
import { toParametriMotore } from '../../src/engine/params-motore.js';
import { goldenConguaglio2025 as g } from '../fixtures/golden-conguaglio-2025.js';

const p = toParametriMotore(params2025);
const imponibile = cents(g.imponibileIrpef);

describe('golden: conguaglio IRPEF 2025 (caso reale anonimizzato)', () => {
  it('IRPEF lorda coincide col calcolo reale', () => {
    expect(calcolaIrpefLorda(imponibile, p.scaglioniIrpef).lorda).toBe(g.atteso.irpefLorda);
  });

  it('detrazione da lavoro dipendente entro la tolleranza del calcolo manuale', () => {
    const d = calcolaDetrazioneLavoroDipendente(imponibile, p.detrazioneLavoroDipendente).totale;
    expect(d).toBe(g.atteso.detrazioneLavoro);
    const scartoEuro = Math.abs(toEuros(d) - toEuros(cents(g.riferimentoManuale.detrazioneLavoro)));
    expect(scartoEuro).toBeLessThan(0.2);
  });

  it('cuneo: ulteriore detrazione di 1.000 (reddito 20.001-32.000)', () => {
    const c = calcolaCuneo(imponibile, imponibile, p.cuneo);
    expect(c.tipo).toBe('detrazione');
    expect(c.importo).toBe(g.atteso.cuneoDetrazione);
  });

  it('imposta netta annua entro la tolleranza del calcolo manuale', () => {
    const lorda = calcolaIrpefLorda(imponibile, p.scaglioniIrpef).lorda;
    const detr = calcolaDetrazioneLavoroDipendente(imponibile, p.detrazioneLavoroDipendente).totale;
    const cuneo = calcolaCuneo(imponibile, imponibile, p.cuneo).importo;
    const netta = subtract(subtract(lorda, detr), cuneo);
    expect(netta).toBe(g.atteso.impostaNettaAnnua);
    const scartoEuro = Math.abs(
      toEuros(netta) - toEuros(cents(g.riferimentoManuale.impostaNettaAnnua)),
    );
    expect(scartoEuro).toBeLessThan(0.3);
  });
});
