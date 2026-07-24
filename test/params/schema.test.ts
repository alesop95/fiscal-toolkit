import { describe, expect, it } from 'vitest';
import { params2025 } from '../../params/2025.js';
import { params2026 } from '../../params/2026.js';
import { anniDisponibili, parametriAnno } from '../../params/index.js';
import { parseParams } from '../../params/schema.js';

describe('params schema', () => {
  it('convalida i parametri 2025 e 2026', () => {
    const p2025 = parseParams(params2025);
    expect(p2025.anno).toBe(2025);
    expect(p2025.irpef.scaglioni.valore.at(-1)?.limiteSuperiore).toBeNull();
    expect(p2025.irpef.scaglioni.valore[1]?.aliquota).toBe(0.35);
    expect(p2025.previdenzaComplementare.tettoDeducibilita.valore).toBe(516_457);

    const p2026 = parseParams(params2026);
    expect(p2026.anno).toBe(2026);
    // Il 2026 riusa i valori strutturali del 2025 (Bilancio 2026 non li modifica)
    expect(p2026.irpef.scaglioni.valore).toEqual(p2025.irpef.scaglioni.valore);
  });

  it('ogni blocco normativo porta una fonte con urn e articolo', () => {
    const p = parseParams(params2025);
    expect(p.irpef.scaglioni.fonte.urn).toContain('urn:nir');
    expect(p.detrazioni.lavoroDipendente.fonte.articolo).toContain('art. 13');
    expect(p.cuneo.fonte.urn).toContain('2024-12-30;207');
  });

  it('il registro espone gli anni disponibili e ne recupera i parametri', () => {
    expect(anniDisponibili).toEqual([2025, 2026]);
    expect(parametriAnno(2026)?.anno).toBe(2026);
    expect(parametriAnno(2024)).toBeUndefined();
  });

  it('rifiuta un aliquota fuori dall intervallo [0, 1]', () => {
    const bad = structuredClone(params2025);
    const primo = bad.irpef.scaglioni.valore[0];
    if (primo) {
      primo.aliquota = 1.5;
    }
    expect(() => parseParams(bad)).toThrow();
  });

  it('rifiuta un blocco privo di fonte', () => {
    const bad = structuredClone(params2025) as { cuneo: { fonte?: unknown } };
    bad.cuneo.fonte = undefined;
    expect(() => parseParams(bad)).toThrow();
  });
});
