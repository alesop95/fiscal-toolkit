#!/usr/bin/env node
/**
 * CLI di fiscal-toolkit. Adattatore sottile: legge gli argomenti, compone il Prospetto (modello
 * esplicabile del calcolo) e lo rende leggibile. La logica di spiegazione vive nel Prospetto
 * (src/report/prospetto.ts), non qui: la CLI e una futura UI renderizzano lo stesso modello.
 *
 * Comandi (Fase 1):
 *   fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato voce per voce
 *   fiscal confronta <RAL> [--json]              netto a confronto fra gli anni disponibili
 *   fiscal curva [--anno AAAA] [--da N] [--a N] [--passo N] [--json]
 *   fiscal --version
 *
 * I comandi ingest e fotografia arrivano in Fase 2.
 */

import { anniDisponibili, parametriAnno } from '../params/index.js';
import { type Money, euros, format, toEuros } from './domain/money.js';
import { CURVA_DEFAULT, componiCurva, serializzaCurva } from './report/curva.js';
import { formattaFonte } from './report/fonte.js';
import { type Prospetto, componiProspetto, serializzaProspetto } from './report/prospetto.js';

const VERSIONE = 'fiscal-toolkit 0.0.0 (Fase 1)';

function stampaUso(): void {
  console.log('Uso:');
  console.log('  fiscal netto <RAL> [--anno AAAA] [--json]   netto annuo spiegato voce per voce');
  console.log('  fiscal confronta <RAL> [--json]              netto a confronto fra gli anni');
  console.log('  fiscal curva [--anno AAAA] [--da N] [--a N] [--passo N] [--json]');
  console.log('                                               prelievo al variare della RAL');
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
  console.log(JSON.stringify(serializzaProspetto(prospetto), null, 2));
}

/**
 * Stampa la ripartizione della RAL e, quando il cuneo eroga una somma non tassata, la
 * riconciliazione che porta dal netto ricavato dalla RAL al netto annuo effettivo. Senza questa
 * riga i due numeri sembrerebbero contraddirsi.
 */
function stampaComposizione(prospetto: Prospetto): void {
  const c = prospetto.composizione;
  console.log('');
  console.log(`  Composizione della RAL (${format(c.totale)})`);
  for (const s of c.segmenti) {
    const quota = `${(s.quota * 100).toLocaleString('it-IT', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;
    console.log(
      `    ${s.etichetta.padEnd(24)} ${format(s.importo).padStart(14)} ${quota.padStart(7)}`,
    );
  }
  if (c.cuneoSomma > 0) {
    console.log(`    ${'+ Cuneo (somma)'.padEnd(24)} ${format(c.cuneoSomma).padStart(14)}`);
    console.log(`    ${'= Netto annuo'.padEnd(24)} ${format(c.nettoAnnuo).padStart(14)}`);
  }
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
    if (v.fonte) {
      const f = formattaFonte(v.fonte);
      console.log(`      Fonte: ${f.testo}`);
      if (f.nota) {
        console.log(`             ${f.nota}`);
      }
    }
  }

  stampaComposizione(prospetto);

  console.log('');
  for (const m of prospetto.mensilita) {
    const etichetta = `Netto mensile (su ${m.rate})`;
    console.log(`  ${etichetta.padEnd(28)} ${format(m.importo).padStart(14)}`);
  }

  console.log('');
  console.log(
    `  Aliquota marginale IRPEF: ${percentuale(prospetto.indicatori.aliquotaMarginaleIrpef)}`,
  );
  console.log(
    `  Aliquota media imposte (su imponibile): ${percentuale(prospetto.indicatori.aliquotaMediaImposte)}`,
  );
  console.log(
    `  Pressione fiscale (divario RAL-netto): ${percentuale(prospetto.indicatori.pressioneFiscale)}`,
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

  if (args.includes('--json')) {
    const prospetti = anniDisponibili.map((a) =>
      serializzaProspetto(componiProspetto(a, euros(ral))),
    );
    console.log(JSON.stringify({ ral, prospetti }, null, 2));
    return 0;
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

/** Legge un'opzione numerica in euro, es. "--da 15000", ricadendo sul default se assente. */
function leggiOpzioneEuro(args: readonly string[], nome: string, predefinito: Money): Money {
  const i = args.indexOf(nome);
  if (i < 0) {
    return predefinito;
  }
  const valore = leggiEuro(args[i + 1]);
  return valore === null ? predefinito : euros(valore);
}

function comandoCurva(args: readonly string[]): number {
  const anno = leggiAnno(args);
  if (!parametriAnno(anno)) {
    console.error(`Errore: anno ${anno} non disponibile. Anni: ${anniDisponibili.join(', ')}.`);
    return 1;
  }

  const opzioni = {
    da: leggiOpzioneEuro(args, '--da', CURVA_DEFAULT.da),
    a: leggiOpzioneEuro(args, '--a', CURVA_DEFAULT.a),
    passo: leggiOpzioneEuro(args, '--passo', CURVA_DEFAULT.passo),
  };

  let curva: ReturnType<typeof componiCurva>;
  try {
    curva = componiCurva(anno, opzioni);
  } catch (errore) {
    console.error(`Errore: ${errore instanceof Error ? errore.message : String(errore)}`);
    return 1;
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(serializzaCurva(curva), null, 2));
    return 0;
  }

  console.log(`Prelievo al variare della RAL - anno d'imposta ${anno}`);
  console.log('');
  console.log(
    `  ${'RAL'.padStart(12)} ${'Netto annuo'.padStart(14)} ${'Mensile (14)'.padStart(14)} ${'Pressione'.padStart(11)} ${'Marg. IRPEF'.padStart(12)} ${'Marg. eff.'.padStart(11)}`,
  );
  for (const p of curva.punti) {
    const mensile = euros(toEuros(p.nettoAnnuo) / 14);
    console.log(
      `  ${format(p.ral, { withSymbol: false }).padStart(12)} ${format(p.nettoAnnuo, { withSymbol: false }).padStart(14)} ${format(mensile, { withSymbol: false }).padStart(14)} ${percentuale(p.pressioneFiscale).padStart(11)} ${percentuale(p.aliquotaMarginaleIrpef).padStart(12)} ${percentuale(p.aliquotaMarginaleEffettiva).padStart(11)}`,
    );
  }
  console.log('');
  console.log(
    `Marginale effettiva: quota trattenuta di ${format(curva.passo)} lordi in piu', contati contributi,`,
  );
  console.log(
    "IRPEF, detrazioni, cuneo e addizionali. Non coincide con l'aliquota IRPEF di legge.",
  );
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
  if (comando === 'curva') {
    return comandoCurva(args.slice(1));
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
