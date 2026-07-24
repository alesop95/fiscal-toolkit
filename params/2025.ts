/**
 * Parametri normativi per l'anno d'imposta 2025.
 *
 * Valori verificati contro E:\legal-consultant (legge.sqlite). Importi in centesimi. Ogni blocco
 * cita l'atto che ne fissa il valore vigente per il 2025 (vedi ADR-006: la fonte del valore e' la
 * legge modificatrice, non il solo testo consolidato dell'articolo base).
 */

import type { ParamsAnno } from './schema.js';

export const params2025: ParamsAnno = {
  anno: 2025,
  irpef: {
    scaglioni: {
      valore: [
        { limiteSuperiore: 2_800_000, aliquota: 0.23 },
        { limiteSuperiore: 5_000_000, aliquota: 0.35 },
        { limiteSuperiore: null, aliquota: 0.43 },
      ],
      fonte: {
        urn: 'urn:nir:stato:legge:2024-12-30;207',
        articolo: 'art. 1 co. 2 lett. a',
        nota: 'Sostituisce il comma 1 dell art. 11 TUIR (DPR 917/1986) dal 2025: 23/35/43 su soglie 28k/50k',
      },
    },
  },
  detrazioni: {
    lavoroDipendente: {
      valore: {
        soglia1: 1_500_000,
        importoFascia1: 195_500,
        soglia2: 2_800_000,
        importoBaseFascia2: 191_000,
        incrementoFascia2: 119_000,
        denominatoreFascia2: 1_300_000,
        soglia3: 5_000_000,
        importoBaseFascia3: 191_000,
        denominatoreFascia3: 2_200_000,
        maggiorazione: { importo: 6_500, da: 2_500_000, a: 3_500_000 },
      },
      fonte: {
        urn: 'urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917',
        articolo: 'art. 13 co. 1 (a/b/c) e co. 1.1',
        nota: 'Fascia piena a 1.955 EUR per L. 207/2024 art. 1 co. 2 lett. b',
      },
    },
  },
  cuneo: {
    valore: {
      somma: {
        sogliaRedditoComplessivo: 2_000_000,
        fasce: [
          { limiteRedditoLavoro: 850_000, percentuale: 0.071 },
          { limiteRedditoLavoro: 1_500_000, percentuale: 0.053 },
          { limiteRedditoLavoro: null, percentuale: 0.048 },
        ],
      },
      detrazione: {
        importoPieno: 100_000,
        sogliaImportoPieno: 3_200_000,
        sogliaAzzeramento: 4_000_000,
        denominatore: 800_000,
      },
    },
    fonte: {
      urn: 'urn:nir:stato:legge:2024-12-30;207',
      articolo: 'art. 1 co. 4 (somma) e co. 6 (ulteriore detrazione)',
    },
  },
  inps: {
    valore: {
      aliquotaBase: 0.0919,
      aliquotaAggiuntiva: 0.01,
      primaFasciaAnnua: 5_500_800,
    },
    fonte: {
      urn: 'urn:nir:stato:legge:1992-11-14;438',
      articolo: 'art. 3-ter DL 384/1992 (aliquota aggiuntiva 1%)',
      nota: 'Aliquota base 9,19% e prima fascia annua sono valori amministrativi INPS: da verificare con la circolare annuale',
    },
  },
  previdenzaComplementare: {
    tettoDeducibilita: {
      valore: 516_457,
      fonte: {
        urn: 'urn:nir:stato:decreto.legislativo:2005-12-05;252',
        articolo: 'art. 8 co. 4',
        nota: 'Deduzione dal reddito complessivo fino a 5.164,57 EUR',
      },
    },
  },
};
