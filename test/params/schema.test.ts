import { describe, expect, it } from 'vitest';
import { esempio } from '../../params/example.js';
import { parseParams } from '../../params/schema.js';

describe('params schema', () => {
  it('convalida il file di parametri di esempio', () => {
    const p = parseParams(esempio);
    expect(p.anno).toBe(2026);
    expect(p.irpef.scaglioni.valore.at(-1)?.limiteSuperiore).toBeNull();
    expect(p.irpef.scaglioni.fonte.articolo).toBe('art. 11');
    expect(p.previdenzaComplementare.tettoDeducibilita.valore).toBe(516_457);
  });

  it('rifiuta un aliquota fuori dall intervallo [0, 1]', () => {
    const bad = structuredClone(esempio);
    const primo = bad.irpef.scaglioni.valore[0];
    if (primo) {
      primo.aliquota = 1.5;
    }
    expect(() => parseParams(bad)).toThrow();
  });

  it('rifiuta un valore normativo privo di fonte', () => {
    const bad = structuredClone(esempio) as Record<string, unknown>;
    (
      bad.previdenzaComplementare as { tettoDeducibilita: { fonte?: unknown } }
    ).tettoDeducibilita.fonte = undefined;
    expect(() => parseParams(bad)).toThrow();
  });
});
