#!/usr/bin/env node
/**
 * CLI di fiscal-toolkit. Adattatore sottile sopra i moduli puri di src/: non contiene logica di
 * calcolo, legge gli argomenti, invoca il motore e stampa il risultato spiegato voce per voce.
 *
 * L'ambizione del comando netto e' essere leggibile come una dichiarazione: ogni riga porta
 * l'importo e, sotto, una spiegazione concisa di come si compone e da quale norma deriva.
 *
 * Comandi (Fase 1):
 *   fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato da una RAL
 *   fiscal confronta <RAL>                       netto a confronto fra gli anni disponibili
 *   fiscal --version
 *
 * I comandi ingest e fotografia arrivano in Fase 2.
 */

import { anniDisponibili, parametriAnno } from '../params/index.js';
import { type Money, euros, format, toEuros } from './domain/money.js';
import { aliquotaMarginale } from './engine/irpef.js';
import type { RisultatoLordoNetto } from './engine/lordo-netto.js';
import { calcolaLordoNettoAnno } from './engine/params-motore.js';

const VERSIONE = 'fiscal-toolkit 0.0.0 (Fase 1)';

function stampaUso(): void {
  console.log('Uso:');
  console.log('  fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato da una RAL');
  console.log('  fiscal confronta <RAL>                       netto a confronto fra gli anni');
  console.log('  fiscal --version');
  console.log('');
  console.log(`Anni disponibili: ${anniDisponibili.join(', ')}. RAL in euro.`);
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
  return anniDisponibili[anniDisponibili.length - 1] ?? 0;
}

function percentuale(frazione: number): string {
  return `${(frazione * 100).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

/** Stampa una voce: etichetta e importo allineati, con una spiegazione indentata sotto. */
function voce(etichetta: string, valore: Money, spiegazione: string): void {
  console.log(`  ${etichetta.padEnd(26)} ${format(valore).padStart(14)}`);
  if (spiegazione) {
    console.log(`      ${spiegazione}`);
  }
}

function stampaJson(anno: number, r: RisultatoLordoNetto): void {
  const out = {
    anno,
    ral: toEuros(r.ral),
    contributiInps: toEuros(r.inps.totale),
    imponibileIrpef: toEuros(r.imponibileIrpef),
    irpefLorda: toEuros(r.irpefLorda),
    detrazioneLavoro: toEuros(r.detrazioneLavoro),
    cuneoDetrazione: toEuros(r.cuneoDetrazione),
    cuneoSomma: toEuros(r.cuneoSomma),
    irpefNetta: toEuros(r.irpefNetta),
    addizionaleRegionale: toEuros(r.addizionaleRegionale),
    addizionaleComunale: toEuros(r.addizionaleComunale),
    nettoAnnuo: toEuros(r.nettoAnnuo),
  };
  console.log(JSON.stringify(out, null, 2));
}

function comandoNetto(args: readonly string[]): number {
  const ral = leggiEuro(args[0]);
  if (ral === null) {
    console.error('Errore: indicare la RAL in euro, es. "fiscal netto 30000".');
    return 1;
  }
  const anno = leggiAnno(args);
  const p = parametriAnno(anno);
  if (!p) {
    console.error(`Errore: anno ${anno} non disponibile. Anni: ${anniDisponibili.join(', ')}.`);
    return 1;
  }

  const r = calcolaLordoNettoAnno(anno, euros(ral));

  if (args.includes('--json')) {
    stampaJson(anno, r);
    return 0;
  }

  const inps = p.inps.valore;
  const marginale = aliquotaMarginale(r.imponibileIrpef, p.irpef.scaglioni.valore);
  const prelievo = toEuros(r.inps.totale) + toEuros(r.irpefNetta) + toEuros(r.addizionali);
  const pressione = ral > 0 ? prelievo / ral : 0;

  console.log(`Calcolo netto - anno d'imposta ${anno}`);
  console.log('');

  voce('Retribuzione annua lorda', r.ral, 'RAL: punto di partenza, la retribuzione lorda annuale.');
  const dettaglioInps =
    r.inps.aggiuntiva > 0
      ? `${percentuale(inps.aliquotaBase)} sulla RAL piu' 1% sull'eccedenza della prima fascia`
      : `${percentuale(inps.aliquotaBase)} sulla RAL (aliquota a carico del lavoratore)`;
  voce('Contributi INPS', r.inps.totale, `${dettaglioInps}; sono deducibili dall'imponibile.`);
  voce(
    'Imponibile IRPEF',
    r.imponibileIrpef,
    'Reddito imponibile: RAL meno i contributi deducibili.',
  );

  console.log('');
  console.log('  IRPEF lorda per scaglioni (fonte: L. 207/2024 art. 1, TUIR art. 11):');
  for (const s of r.dettaglioIrpef) {
    const soglia =
      s.a === null ? 'oltre la soglia' : `fino a ${format(s.a, { withSymbol: false })}`;
    console.log(
      `      ${format(s.base).padStart(14)} al ${percentuale(s.aliquota)} = ${format(s.imposta)}  (${soglia})`,
    );
  }
  voce('IRPEF lorda', r.irpefLorda, "Somma dell'imposta dei singoli scaglioni.");

  voce(
    'Detrazione lavoro dip.',
    r.detrazioneLavoro,
    'Detrazione da lavoro dipendente (TUIR art. 13), decrescente col reddito.',
  );
  if (toEuros(r.cuneoDetrazione) > 0) {
    voce(
      'Cuneo (detrazione)',
      r.cuneoDetrazione,
      'Ulteriore detrazione L. 207/2024 art. 1 co. 6 (reddito oltre 20.000).',
    );
  }
  voce(
    'IRPEF netta',
    r.irpefNetta,
    "IRPEF lorda meno detrazioni, fino a concorrenza dell'imposta.",
  );

  if (toEuros(r.cuneoSomma) > 0) {
    voce(
      'Cuneo (somma)',
      r.cuneoSomma,
      'Somma non tassata L. 207/2024 art. 1 co. 4 (reddito fino a 20.000): si aggiunge al netto.',
    );
  }

  if (p.addizionali?.regionale) {
    voce(
      'Addizionale regionale',
      r.addizionaleRegionale,
      'Addizionale regionale IRPEF per scaglioni.',
    );
  } else {
    console.log(`  ${'Addizionale regionale'.padEnd(26)} ${'n.d.'.padStart(14)}`);
    console.log('      Aliquote regionali non ancora inserite: da fonte ufficiale.');
  }
  if (p.addizionali?.comunale) {
    const c = p.addizionali.comunale;
    voce(
      'Addizionale comunale',
      r.addizionaleComunale,
      `${c.fonte.nota ?? 'Addizionale comunale IRPEF.'}`,
    );
  } else {
    console.log(`  ${'Addizionale comunale'.padEnd(26)} ${'n.d.'.padStart(14)}`);
    console.log('      Aliquota comunale non ancora inserita: da fonte ufficiale.');
  }

  console.log('');
  voce(
    'NETTO ANNUO',
    r.nettoAnnuo,
    "RAL meno INPS, IRPEF netta e addizionali, piu' il cuneo somma.",
  );
  console.log(
    `  ${'Netto mensile (su 13)'.padEnd(26)} ${format(euros(toEuros(r.nettoAnnuo) / 13)).padStart(14)}`,
  );
  console.log(
    `  ${'Netto mensile (su 12)'.padEnd(26)} ${format(euros(toEuros(r.nettoAnnuo) / 12)).padStart(14)}`,
  );

  console.log('');
  console.log(`  Aliquota marginale IRPEF: ${percentuale(marginale)}`);
  console.log(
    `  Pressione fiscale effettiva (INPS + IRPEF netta + addizionali sulla RAL): ${percentuale(pressione)}`,
  );

  console.log('');
  if (!p.addizionali?.regionale) {
    console.log('Nota: addizionale regionale non inclusa (aliquote da inserire).');
  }
  console.log('Non e consulenza fiscale: verificare con un commercialista.');
  return 0;
}

function comandoConfronta(args: readonly string[]): number {
  const ral = leggiEuro(args[0]);
  if (ral === null) {
    console.error('Errore: indicare la RAL in euro, es. "fiscal confronta 30000".');
    return 1;
  }
  console.log(`Confronto netto per RAL ${format(euros(ral))}`);
  console.log('');
  console.log(
    `  ${'Anno'.padEnd(6)} ${'Netto annuo'.padStart(14)} ${'Mensile (13)'.padStart(14)} ${'Pressione'.padStart(12)}`,
  );
  for (const anno of anniDisponibili) {
    const r = calcolaLordoNettoAnno(anno, euros(ral));
    const prelievo = toEuros(r.inps.totale) + toEuros(r.irpefNetta) + toEuros(r.addizionali);
    const pressione = ral > 0 ? prelievo / ral : 0;
    const mensile = euros(toEuros(r.nettoAnnuo) / 13);
    console.log(
      `  ${String(anno).padEnd(6)} ${format(r.nettoAnnuo).padStart(14)} ${format(mensile).padStart(14)} ${percentuale(pressione).padStart(12)}`,
    );
  }
  console.log('');
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
  if (comando === 'confronta') {
    return comandoConfronta(args.slice(1));
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
