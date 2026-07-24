import { describe, expect, it } from 'vitest';
import { euros, toEuros } from '../../src/domain/money.js';
import { componiProspetto } from '../../src/report/prospetto.js';

describe('componiProspetto', () => {
  const p = componiProspetto(2025, euros(30_000));

  it('espone le voci principali in ordine con importi coerenti', () => {
    const chiavi = p.voci.map((v) => v.chiave);
    expect(chiavi).toContain('ral');
    expect(chiavi).toContain('irpefLorda');
    expect(chiavi).toContain('nettoAnnuo');
    const ral = p.voci.find((v) => v.chiave === 'ral');
    expect(ral && toEuros(ral.importo)).toBe(30_000);
  });

  it('ogni voce con una fonte cita un atto normativo', () => {
    const irpef = p.voci.find((v) => v.chiave === 'irpefLorda');
    expect(irpef?.fonte?.urn).toContain('2024-12-30;207');
    const detr = p.voci.find((v) => v.chiave === 'detrazioneLavoro');
    expect(detr?.fonte?.articolo).toContain('art. 13');
  });

  it('la voce IRPEF lorda porta il dettaglio per scaglione', () => {
    const irpef = p.voci.find((v) => v.chiave === 'irpefLorda');
    expect(irpef?.dettaglio.length).toBeGreaterThan(0);
  });

  it('addizionale regionale e comunale sono disponibili per il 2025 (Marche/Civitanova)', () => {
    const reg = p.voci.find((v) => v.chiave === 'addizionaleRegionale');
    const com = p.voci.find((v) => v.chiave === 'addizionaleComunale');
    expect(reg?.disponibile).toBe(true);
    expect(com?.disponibile).toBe(true);
  });

  it('calcola gli indicatori sintetici', () => {
    expect(p.indicatori.aliquotaMarginaleIrpef).toBe(0.23);
    expect(p.indicatori.pressioneFiscale).toBeGreaterThan(0);
  });
});
