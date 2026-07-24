#!/usr/bin/env node
/**
 * CLI di fiscal-toolkit. Adattatore sottile: legge gli argomenti, compone il Prospetto (modello
 * esplicabile del calcolo) e lo rende leggibile. La logica di spiegazione vive nel Prospetto
 * (src/report/prospetto.ts), non qui: la CLI e una futura UI renderizzano lo stesso modello.
 *
 * Comandi (Fase 1):
 *   fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato voce per voce
 *   fiscal confronta <RAL>                       netto a confronto fra gli anni disponibili
 *   fiscal --version
 *
 * I comandi ingest e fotografia arrivano in Fase 2.
 */

import { anniDisponibili, parametriAnno } from '../params/index.js';
import { euros, format, toEuros } from './domain/money.js';
import { type Prospetto, componiProspetto } from './report/prospetto.js';

const VERSIONE = 'fiscal-toolkit 0.0.0 (Fase 1)';
const MENSILITA = [12, 13, 14];

function stampaUso(): void {
  console.log('Uso:');
  console.log('  fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato voce per voce');
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

function stampaJson(prospetto: Prospetto): void {
  const out = {
    anno: prospetto.anno,
    ral: toEuros(prospetto.ral),
    voci: prospetto.voci.map((v) => ({
      chiave: v.chiave,
      etichetta: v.etichetta,
      categoria: v.categoria,
      euro: toEuros(v.importo),
      disponibile: v.disponibile,
      spiegazione: v.spiegazione,
      fonte: v.fonte,
      dettaglio: v.dettaglio.map((d) => ({
        etichetta: d.etichetta,
        euro: toEuros(d.importo),
        nota: d.nota,
      })),
    })),
    indicatori: prospetto.indicatori,
  };
  console.log(JSON.stringify(out, null, 2));
}

function stampaProspetto(prospetto: Prospetto): void {
  console.log(`Calcolo netto - anno d'imposta ${prospetto.anno}`);
  console.log('');

  for (const v of prospetto.voci) {
    const importo = v.disponibile ? format(v.importo) : 'n.d.';
    console.log(`  ${v.etichetta.padEnd(28)} ${importo.padStart(14)}`);
    if (v.spiegazione) {
      console.log(`      ${v.spiegazione}`);
    }
    for (const d of v.dettaglio) {
      console.log(`        - ${d.etichetta} = ${format(d.importo)}  (${d.nota})`);
    }
  }

  const netto = toEuros(prospetto.risultato.nettoAnnuo);
  console.log('');
  for (const mensilita of MENSILITA) {
    const etichetta = `Netto mensile (su ${mensilita})`;
    console.log(`  ${etichetta.padEnd(28)} ${format(euros(netto / mensilita)).padStart(14)}`);
  }

  console.log('');
  console.log(
    `  Aliquota marginale IRPEF: ${percentuale(prospetto.indicatori.aliquotaMarginaleIrpef)}`,
  );
  console.log(
    `  Aliquota media imposte (su imponibile): ${percentuale(prospetto.indicatori.aliquotaMediaImposte)}`,
  );
  console.log(
    `  Pressione fiscale (prelievo su RAL): ${percentuale(prospetto.indicatori.pressioneFiscale)}`,
  );

  console.log('');
  const regionale = prospetto.voci.find((v) => v.chiave === 'addizionaleRegionale');
  if (regionale && !regionale.disponibile) {
    console.log('Nota: addizionale regionale non inclusa (aliquote da inserire).');
  }
  console.log('Non e consulenza fiscale: verificare con un commercialista.');
}

function comandoNetto(args: readonly string[]): number {
  const ral = leggiEuro(args[0]);
  if (ral === null) {
    console.error('Errore: indicare la RAL in euro, es. "fiscal netto 30000".');
    return 1;
  }
  const anno = leggiAnno(args);
  if (!parametriAnno(anno)) {
    console.error(`Errore: anno ${anno} non disponibile. Anni: ${anniDisponibili.join(', ')}.`);
    return 1;
  }

  const prospetto = componiProspetto(anno, euros(ral));
  if (args.includes('--json')) {
    stampaJson(prospetto);
  } else {
    stampaProspetto(prospetto);
  }
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
    `  ${'Anno'.padEnd(6)} ${'Netto annuo'.padStart(14)} ${'Mensile (14)'.padStart(14)} ${'Pressione'.padStart(12)}`,
  );
  for (const anno of anniDisponibili) {
    const prospetto = componiProspetto(anno, euros(ral));
    const mensile = euros(toEuros(prospetto.risultato.nettoAnnuo) / 14);
    console.log(
      `  ${String(anno).padEnd(6)} ${format(prospetto.risultato.nettoAnnuo).padStart(14)} ${format(mensile).padStart(14)} ${percentuale(prospetto.indicatori.pressioneFiscale).padStart(12)}`,
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
