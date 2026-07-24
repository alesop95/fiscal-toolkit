import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { type ParametriMotore, calcolaLordoNetto } from '../../src/engine/lordo-netto.js';

/**
 * Parametri verificati 2025/2026 (aliquote e formule contro E:\legal-consultant; INPS
 * amministrativo). Servono a esercitare l'intera catena lordo-netto in modo deterministico.
 */
const params: ParametriMotore = {
  scaglioniIrpef: [
    { limiteSuperiore: 2_800_000, aliquota: 0.23 },
    { limiteSuperiore: 5_000_000, aliquota: 0.35 },
    { limiteSuperiore: null, aliquota: 0.43 },
  ],
  detrazioneLavoroDipendente: {
    soglia1: euros(15_000),
    importoFascia1: euros(1_955),
    soglia2: euros(28_000),
    importoBaseFascia2: euros(1_910),
    incrementoFascia2: euros(1_190),
    denominatoreFascia2: euros(13_000),
    soglia3: euros(50_000),
    importoBaseFascia3: euros(1_910),
    denominatoreFascia3: euros(22_000),
    maggiorazione: { importo: euros(65), da: euros(25_000), a: euros(35_000) },
  },
  cuneo: {
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
  },
  inps: {
    aliquotaBase: 0.0919,
    aliquotaAggiuntiva: 0.01,
    primaFasciaAnnua: euros(55_448),
  },
};

describe('calcolaLordoNetto', () => {
  it('RAL 30.000: composizione voce per voce verificata a mano', () => {
    const r = calcolaLordoNetto(euros(30_000), params);
    // INPS: 30.000 * 9,19% = 2.757,00 (sotto la prima fascia)
    expect(toEuros(r.inps.totale)).toBe(2757);
    // Imponibile IRPEF: 30.000 - 2.757 = 27.243,00
    expect(toEuros(r.imponibileIrpef)).toBe(27_243);
    // IRPEF lorda: 27.243 * 23% (primo scaglione) = 6.265,89
    expect(toEuros(r.irpefLorda)).toBeCloseTo(6265.89, 2);
    // Detrazione lavoro: 1.910 + 1.190*(28.000-27.243)/13.000 + 65 = 2.044,29
    expect(toEuros(r.detrazioneLavoro)).toBeCloseTo(2044.29, 2);
    // Cuneo: reddito > 20.000 -> ulteriore detrazione piena 1.000
    expect(toEuros(r.cuneoDetrazione)).toBe(1000);
    expect(r.cuneoSomma).toBe(0);
    // IRPEF netta: 6.265,89 - 2.044,29 - 1.000 = 3.221,60
    expect(toEuros(r.irpefNetta)).toBeCloseTo(3221.6, 2);
    // Netto annuo: 30.000 - 2.757 - 3.221,60 = 24.021,40
    expect(toEuros(r.nettoAnnuo)).toBeCloseTo(24_021.4, 2);
    // Addizionali non ancora calcolate
    expect(r.addizionali).toBe(0);
  });

  it('RAL bassa 18.000: scatta il cuneo come somma non tassata', () => {
    const r = calcolaLordoNetto(euros(18_000), params);
    // Imponibile 18.000 - 9,19% = 16.345,80 -> <= 20.000, quindi somma (co.4), fascia > 15.000 -> 4,8%
    expect(r.cuneoSomma).not.toBe(0);
    expect(toEuros(r.cuneoDetrazione)).toBe(0);
    // Il netto include la somma non tassata
    expect(toEuros(r.nettoAnnuo)).toBeGreaterThan(
      toEuros(r.imponibileIrpef) - toEuros(r.irpefNetta),
    );
  });

  it('la detrazione non rende negativa l imposta', () => {
    const r = calcolaLordoNetto(euros(12_000), params);
    expect(toEuros(r.irpefNetta)).toBeGreaterThanOrEqual(0);
  });
});
