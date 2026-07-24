/**
 * Caso golden reale, anonimizzato: conguaglio IRPEF di fine anno 2025 su un cedolino reale di
 * dicembre. Contiene solo importi, nessun dato personale (niente nome, codice fiscale, datore).
 * Serve a blindare il motore contro un calcolo reale verificato a mano.
 *
 * Tutti gli importi sono in centesimi. Il calcolo manuale di riferimento arrotondava il rapporto
 * della detrazione a poche cifre, mentre il motore arrotonda solo al centesimo finale: la piccola
 * differenza (pochi centesimi sulla detrazione) rientra nella tolleranza di arrotondamento della
 * Definition of Done.
 */

export const goldenConguaglio2025 = {
  descrizione: 'Conguaglio IRPEF 2025 su imponibile reale (anonimizzato)',
  anno: 2025,

  /** Reddito imponibile IRPEF: 30.891,60 EUR. */
  imponibileIrpef: 3_089_160,

  /** Valori attesi dal motore (deterministici, arrotondamento al centesimo finale). */
  atteso: {
    irpefLorda: 745_206, //  7.452,06 = 28.000 @ 23% (6.440,00) + 2.891,60 @ 35% (1.012,06)
    detrazioneLavoro: 172_396, // 1.723,96 = 1.910 * (50.000-30.891,60)/22.000 + 65
    cuneoDetrazione: 100_000, // 1.000,00 (L. 207/2024 co. 6, reddito 20.001-32.000)
    impostaNettaAnnua: 472_810, // 4.728,10 = 7.452,06 - 1.723,96 - 1.000,00
  },

  /** Valori del calcolo manuale reale, per confronto entro tolleranza. */
  riferimentoManuale: {
    detrazioneLavoro: 172_383, // 1.723,83 (rapporto arrotondato a mano)
    impostaNettaAnnua: 472_823, // 4.728,23
    conguaglioDicembre: 30_488, // 304,88 (dipende dalle ritenute mensili, non dal solo calcolo annuale)
  },
} as const;
