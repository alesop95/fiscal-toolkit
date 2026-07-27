/**
 * La resa leggibile delle citazioni: sigle d'uso per gli URN Normattiva, nessuna sigla inventata
 * per le fonti che su Normattiva non ci sono.
 */

import { describe, expect, it } from 'vitest';
import { formattaFonte } from '../../src/report/fonte.js';

describe('formattaFonte', () => {
  it('traduce una legge dello Stato nella sigla d uso', () => {
    const f = formattaFonte({
      urn: 'urn:nir:stato:legge:2024-12-30;207',
      articolo: 'art. 1 co. 2 lett. a',
    });
    expect(f.atto).toBe('L. 207/2024');
    expect(f.testo).toBe('L. 207/2024, art. 1 co. 2 lett. a');
  });

  it('riconosce decreto presidenziale e decreto legislativo', () => {
    expect(
      formattaFonte({
        urn: 'urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917',
        articolo: 'art. 13',
      }).atto,
    ).toBe('DPR 917/1986');
    expect(
      formattaFonte({
        urn: 'urn:nir:stato:decreto.legislativo:2005-12-05;252',
        articolo: 'art. 8 co. 4',
      }).atto,
    ).toBe('D.Lgs. 252/2005');
  });

  it('cita una legge regionale come L.R. col nome della regione', () => {
    expect(
      formattaFonte({ urn: 'urn:nir:regione.marche:legge:2022-03-23;5', articolo: 'art. 1 co. 1' })
        .atto,
    ).toBe('L.R. Marche 5/2022');
  });

  it('riporta la nota quando il blocco normativo la porta', () => {
    const f = formattaFonte({
      urn: 'urn:nir:stato:legge:1992-11-14;438',
      articolo: 'art. 3-ter',
      nota: 'Valore amministrativo da confermare con la circolare INPS',
    });
    expect(f.nota).toContain('circolare INPS');
  });

  it('su una fonte non Normattiva non inventa una sigla e cita l articolo', () => {
    const f = formattaFonte({
      urn: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/',
      articolo: 'Delibera C.C. Civitanova Marche n. 67 del 20-12-2024',
    });
    expect(f.atto).toBeNull();
    expect(f.testo).toBe('Delibera C.C. Civitanova Marche n. 67 del 20-12-2024');
    expect(f.urn).toContain('finanze.gov.it');
  });

  it('un URN malformato ricade sull articolo senza lanciare', () => {
    const f = formattaFonte({ urn: 'urn:nir:stato:legge:incompleto', articolo: 'art. 1' });
    expect(f.atto).toBeNull();
    expect(f.testo).toBe('art. 1');
  });
});
