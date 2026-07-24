import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Test guardia: nessun dato personale nelle fixture versionate. In particolare nessun codice
 * fiscale ben formato. Le fixture devono essere sintetiche o redatte, coerenti con la scheda
 * design-and-security.md.
 */

const CODICE_FISCALE = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/;

function fileRicorsivi(dir: string): string[] {
  const risultato: string[] = [];
  for (const nome of readdirSync(dir)) {
    const percorso = join(dir, nome);
    if (statSync(percorso).isDirectory()) {
      risultato.push(...fileRicorsivi(percorso));
    } else {
      risultato.push(percorso);
    }
  }
  return risultato;
}

describe('guardia dati sensibili nelle fixture', () => {
  it('nessuna fixture contiene un codice fiscale ben formato', () => {
    for (const file of fileRicorsivi('test/fixtures')) {
      const testo = readFileSync(file, 'utf8');
      expect(CODICE_FISCALE.test(testo), `codice fiscale trovato in ${file}`).toBe(false);
    }
  });
});
