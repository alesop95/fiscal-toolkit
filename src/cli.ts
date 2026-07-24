#!/usr/bin/env node
/**
 * CLI di fiscal-toolkit. Adattatore sottile sopra i moduli puri di src/: non contiene logica di
 * calcolo, si limita a leggere gli argomenti, invocare il motore e stampare il risultato.
 *
 * Comando disponibile in Fase 1:
 *   fiscal netto <RAL> [--anno AAAA]   calcola il netto annuo da una retribuzione annua lorda
 *
 * I comandi ingest e fotografia arrivano in Fase 2.
 */

import { anniDisponibili } from '../params/index.js';
import { euros, format, toEuros } from './domain/money.js';
import type { Money } from './domain/money.js';
import { calcolaLordoNettoAnno } from './engine/params-motore.js';

const VERSIONE = 'fiscal-toolkit 0.0.0 (Fase 1)';

function stampaUso(): void {
  console.log('Uso:');
  console.log('  fiscal netto <RAL> [--anno AAAA]   netto annuo da una RAL (RAL in euro)');
  console.log('  fiscal --version');
  console.log('');
  console.log(`Anni disponibili: ${anniDisponibili.join(', ')}`);
}

/** Legge un importo in euro dalla stringa, accettando sia la virgola sia il punto decimale. */
function leggiEuro(input: string | undefined): number | null {
  if (input === undefined) {
    return null;
  }
  const normalizzato = input.replace(/\./g, '').replace(',', '.');
  const valore = Number(normalizzato);
  return Number.isFinite(valore) && valore >= 0 ? valore : null;
}

function leggiAnno(args: readonly string[]): number {
  const i = args.indexOf('--anno');
  if (i >= 0 && args[i + 1] !== undefined) {
    const anno = Number(args[i + 1]);
    if (Number.isInteger(anno)) {
      return anno;
    }
  }
  // Default: l'anno piu' recente disponibile.
  return anniDisponibili[anniDisponibili.length - 1] ?? 0;
}

function riga(etichetta: string, valore: Money): string {
  return `  ${etichetta.padEnd(28)} ${format(valore).padStart(14)}`;
}

function comandoNetto(args: readonly string[]): number {
  const ral = leggiEuro(args[0]);
  if (ral === null) {
    console.error('Errore: indicare la RAL in euro, es. "fiscal netto 30000".');
    return 1;
  }
  const anno = leggiAnno(args);
  if (!anniDisponibili.includes(anno)) {
    console.error(`Errore: anno ${anno} non disponibile. Anni: ${anniDisponibili.join(', ')}.`);
    return 1;
  }

  const r = calcolaLordoNettoAnno(anno, euros(ral));

  console.log(`Calcolo netto - anno d'imposta ${anno}`);
  console.log(riga('Retribuzione annua lorda', r.ral));
  console.log(riga('Contributi INPS', r.inps.totale));
  console.log(riga('Imponibile IRPEF', r.imponibileIrpef));
  console.log(riga('IRPEF lorda', r.irpefLorda));
  console.log(riga('Detrazione lavoro dip.', r.detrazioneLavoro));
  console.log(riga('Cuneo (detrazione)', r.cuneoDetrazione));
  console.log(riga('IRPEF netta', r.irpefNetta));
  if (toEuros(r.cuneoSomma) > 0) {
    console.log(riga('Cuneo (somma non tassata)', r.cuneoSomma));
  }
  console.log(riga('Addizionali reg./com.', r.addizionali));
  console.log(riga('NETTO ANNUO', r.nettoAnnuo));
  console.log(riga('Netto mensile (su 13)', euros(toEuros(r.nettoAnnuo) / 13)));
  console.log('');
  console.log('Nota: addizionali regionale e comunale non ancora incluse; calcolo su base annua.');
  console.log('Non e consulenza fiscale: verificare con un commercialista.');
  return 0;
}

function main(): number {
  const args = process.argv.slice(2);
  const comando = args[0];

  if (comando === '--version' || comando === '-v') {
    console.log(VERSIONE);
    return 0;
  }
  if (comando === 'netto') {
    return comandoNetto(args.slice(1));
  }
  if (comando === undefined || comando === '--help' || comando === '-h') {
    stampaUso();
    return comando === undefined ? 1 : 0;
  }
  console.error(`Comando sconosciuto: ${comando}`);
  stampaUso();
  return 1;
}

process.exit(main());
