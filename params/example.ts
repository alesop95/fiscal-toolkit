/**
 * File di parametri di ESEMPIO.
 *
 * I valori qui sotto sono placeholder illustrativi, NON diritto vigente verificato: servono solo
 * a dimostrare che lo schema convalida un'istanza ben formata (Definition of Done della Fase 0).
 * I parametri reali per anno d'imposta (params/2026.ts, 2025, 2024), con citazioni verificate
 * contro legal-consultant, nascono in Fase 1. Le citazioni sono segnate come non verificate.
 */

import type { ParamsAnno } from './schema.js';

export const esempio: ParamsAnno = {
  anno: 2026,
  irpef: {
    scaglioni: {
      valore: [
        { limiteSuperiore: 2_800_000, aliquota: 0.23 },
        { limiteSuperiore: 5_000_000, aliquota: 0.35 },
        { limiteSuperiore: null, aliquota: 0.43 },
      ],
      fonte: {
        urn: 'urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917',
        articolo: 'art. 11',
        nota: 'ESEMPIO non verificato, da confermare in Fase 1',
      },
    },
  },
  inps: {
    aliquotaLavoratoreDipendente: {
      valore: 0.0919,
      fonte: {
        urn: 'urn:nir:stato:legge:0000-00-00;0',
        articolo: 'da definire',
        nota: 'ESEMPIO non verificato',
      },
    },
  },
  detrazioni: {
    lavoroDipendente: {
      valore: [
        { redditoFino: 1_500_000, importo: 195_400, decrescente: false },
        { redditoFino: 2_800_000, importo: 190_000, decrescente: true },
        { redditoFino: 5_000_000, importo: 190_000, decrescente: true },
      ],
      fonte: {
        urn: 'urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917',
        articolo: 'art. 13',
        nota: 'ESEMPIO non verificato',
      },
    },
  },
  previdenzaComplementare: {
    tettoDeducibilita: {
      valore: 516_457,
      fonte: {
        urn: 'urn:nir:stato:decreto.legislativo:2005-12-05;252',
        articolo: 'art. 8',
        nota: 'ESEMPIO non verificato (tetto 5.164,57 EUR da confermare)',
      },
    },
  },
  cuneo: {
    descrizione: 'Placeholder del cuneo fiscale, struttura affinata in Fase 1',
    parametri: {
      valore: {},
      fonte: {
        urn: 'urn:nir:stato:legge:0000-00-00;0',
        articolo: 'da definire',
        nota: 'ESEMPIO non verificato',
      },
    },
  },
};
