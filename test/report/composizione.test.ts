/**
 * La composizione della RAL e le mensilita' sono derivazioni che prima vivevano duplicate nella CLI
 * e nella pagina della UI, dove la barra ricostruiva il netto per differenza e perdeva la somma non
 * tassata del cuneo. Questi test blindano gli invarianti che rendono l'errore impossibile: i
 * segmenti sommano esattamente alla RAL, e la riconciliazione porta al netto annuo del motore.
 */

import { describe, expect, it } from 'vitest';
import { type Money, euros, toCents } from '../../src/domain/money.js';
import {
  RATE_MENSILITA,
  componiProspetto,
  serializzaProspetto,
} from '../../src/report/prospetto.js';

/** I tre regimi del cuneo: somma non tassata, ulteriore detrazione, nessuna delle due. */
const CASI: readonly { nome: string; ral: Money }[] = [
  { nome: 'somma non tassata (RAL 18.000)', ral: euros(18_000) },
  { nome: 'ulteriore detrazione (RAL 30.000)', ral: euros(30_000) },
  { nome: 'oltre il cuneo (RAL 60.000)', ral: euros(60_000) },
];

describe('composizione della RAL', () => {
  for (const caso of CASI) {
    describe(caso.nome, () => {
      const p = componiProspetto(2025, caso.ral);

      it('i segmenti sommano esattamente alla RAL, al centesimo', () => {
        const somma = p.composizione.segmenti.reduce((acc, s) => acc + toCents(s.importo), 0);
        expect(somma).toBe(toCents(caso.ral));
        expect(toCents(p.composizione.totale)).toBe(toCents(caso.ral));
      });

      it('netto da RAL piu somma del cuneo da il netto annuo del motore', () => {
        const c = p.composizione;
        expect(toCents(c.nettoDaRal) + toCents(c.cuneoSomma)).toBe(toCents(c.nettoAnnuo));
        expect(toCents(c.nettoAnnuo)).toBe(toCents(p.risultato.nettoAnnuo));
      });

      it('le quote sono frazioni della RAL e sommano a uno', () => {
        const somma = p.composizione.segmenti.reduce((acc, s) => acc + s.quota, 0);
        expect(somma).toBeCloseTo(1, 10);
      });

      it('espone una mensilita per ogni rata prevista', () => {
        expect(p.mensilita.map((m) => m.rate)).toEqual([...RATE_MENSILITA]);
      });
    });
  }

  it('a RAL 18.000 la somma del cuneo e il divario che la barra da sola non spiegherebbe', () => {
    const c = componiProspetto(2025, euros(18_000)).composizione;
    expect(toCents(c.cuneoSomma)).toBeGreaterThan(0);
    expect(toCents(c.nettoAnnuo)).toBeGreaterThan(toCents(c.nettoDaRal));
  });

  it('a RAL 60.000 il cuneo non eroga somma e i due netti coincidono', () => {
    const c = componiProspetto(2025, euros(60_000)).composizione;
    expect(toCents(c.cuneoSomma)).toBe(0);
    expect(toCents(c.nettoAnnuo)).toBe(toCents(c.nettoDaRal));
  });

  it('la serializzazione riporta composizione e mensilita in euro', () => {
    const s = serializzaProspetto(componiProspetto(2025, euros(18_000)));
    expect(s.composizione.totale).toBe(18_000);
    expect(s.composizione.nettoDaRal + s.composizione.cuneoSomma).toBeCloseTo(
      s.composizione.nettoAnnuo,
      2,
    );
    expect(s.mensilita).toHaveLength(RATE_MENSILITA.length);
  });

  it('la pressione fiscale misura il divario fra RAL e netto', () => {
    const p = componiProspetto(2025, euros(18_000));
    const atteso = (18_000 - toCents(p.risultato.nettoAnnuo) / 100) / 18_000;
    expect(p.indicatori.pressioneFiscale).toBeCloseTo(atteso, 10);
  });

  it('a RAL zero le quote non dividono per zero', () => {
    const p = componiProspetto(2025, euros(0));
    for (const s of p.composizione.segmenti) {
      expect(s.quota).toBe(0);
    }
    expect(p.indicatori.pressioneFiscale).toBe(0);
  });
});
