/**
 * Prospetto: il risultato del calcolo lordo-netto reso come modello esplicabile e agnostico dalla
 * presentazione. Ogni voce porta importo, categoria, spiegazione di come si compone e fonte
 * normativa; le voci con sotto-dettaglio (gli scaglioni IRPEF) lo espongono.
 *
 * Serve alla pretesa del tool di essere un calcolatore leggibile come una dichiarazione: la CLI e
 * una futura UI renderizzano lo stesso Prospetto, senza duplicare la logica di spiegazione. Il
 * modello e' puro e serializzabile: la conversione in stringhe e in layout resta al chiamante.
 */

import { parametriAnno } from '../../params/index.js';
import type { Fonte } from '../../params/schema.js';
import { type Money, add, toEuros } from '../domain/money.js';
import { aliquotaMarginale } from '../engine/irpef.js';
import type { RisultatoLordoNetto } from '../engine/lordo-netto.js';
import { calcolaLordoNettoAnno } from '../engine/params-motore.js';

/** Categoria di una voce, utile a una UI per raggruppare o colorare. */
export type CategoriaVoce =
  | 'lordo'
  | 'contributo'
  | 'imponibile'
  | 'imposta'
  | 'detrazione'
  | 'addizionale'
  | 'netto';

/** Un sotto-dettaglio di una voce, ad esempio un singolo scaglione IRPEF. */
export interface DettaglioVoce {
  etichetta: string;
  importo: Money;
  nota: string;
}

/** Una voce del prospetto: importo spiegato e citato. */
export interface VoceProspetto {
  chiave: string;
  etichetta: string;
  importo: Money;
  categoria: CategoriaVoce;
  spiegazione: string;
  fonte: Fonte | null;
  dettaglio: DettaglioVoce[];
  /** false quando la voce non e' calcolabile per mancanza di dati (es. addizionale non inserita). */
  disponibile: boolean;
}

/** Indicatori sintetici derivati dal calcolo. */
export interface IndicatoriProspetto {
  aliquotaMarginaleIrpef: number;
  aliquotaMediaImposte: number;
  pressioneFiscale: number;
}

/** Il prospetto completo: voci ordinate, indicatori e risultato grezzo del motore. */
export interface Prospetto {
  anno: number;
  ral: Money;
  voci: VoceProspetto[];
  indicatori: IndicatoriProspetto;
  risultato: RisultatoLordoNetto;
}

function voce(
  chiave: string,
  etichetta: string,
  importo: Money,
  categoria: CategoriaVoce,
  spiegazione: string,
  fonte: Fonte | null,
  dettaglio: DettaglioVoce[] = [],
  disponibile = true,
): VoceProspetto {
  return { chiave, etichetta, importo, categoria, spiegazione, fonte, dettaglio, disponibile };
}

/**
 * Compone il prospetto lordo-netto per un anno d'imposta e una RAL, arricchendo il risultato del
 * motore con spiegazioni e citazioni prese dai parametri dell'anno. Lancia se l'anno non ha
 * parametri modellati.
 */
export function componiProspetto(anno: number, ral: Money): Prospetto {
  const p = parametriAnno(anno);
  if (!p) {
    throw new Error(`Parametri non disponibili per l'anno ${anno}`);
  }
  const r = calcolaLordoNettoAnno(anno, ral);

  const voci: VoceProspetto[] = [];

  voci.push(
    voce('ral', 'Retribuzione annua lorda', r.ral, 'lordo', 'Punto di partenza del calcolo.', null),
  );

  const dettaglioInps: DettaglioVoce[] = [
    {
      etichetta: 'Quota base',
      importo: r.inps.base,
      nota: `${pct(p.inps.valore.aliquotaBase)} sulla RAL`,
    },
  ];
  if (r.inps.aggiuntiva > 0) {
    dettaglioInps.push({
      etichetta: 'Quota aggiuntiva',
      importo: r.inps.aggiuntiva,
      nota: '1% sull eccedenza della prima fascia di retribuzione pensionabile',
    });
  }
  voci.push(
    voce(
      'inps',
      'Contributi INPS',
      r.inps.totale,
      'contributo',
      'Contributi a carico del lavoratore, deducibili dall imponibile.',
      p.inps.fonte,
      dettaglioInps,
    ),
  );

  voci.push(
    voce(
      'imponibile',
      'Imponibile IRPEF',
      r.imponibileIrpef,
      'imponibile',
      'Reddito imponibile: RAL meno i contributi deducibili.',
      null,
    ),
  );

  const dettaglioIrpef: DettaglioVoce[] = r.dettaglioIrpef.map((s) => ({
    etichetta:
      s.a === null
        ? `oltre ${euro(s.da)} al ${pct(s.aliquota)}`
        : `da ${euro(s.da)} a ${euro(s.a)} al ${pct(s.aliquota)}`,
    importo: s.imposta,
    nota: `${euro(s.base)} imponibile in questo scaglione`,
  }));
  voci.push(
    voce(
      'irpefLorda',
      'IRPEF lorda',
      r.irpefLorda,
      'imposta',
      'Imposta per scaglioni con aliquote marginali.',
      p.irpef.scaglioni.fonte,
      dettaglioIrpef,
    ),
  );

  voci.push(
    voce(
      'detrazioneLavoro',
      'Detrazione lavoro dipendente',
      r.detrazioneLavoro,
      'detrazione',
      'Detrazione da lavoro dipendente, decrescente col reddito.',
      p.detrazioni.lavoroDipendente.fonte,
    ),
  );

  if (r.cuneoDetrazione > 0) {
    voci.push(
      voce(
        'cuneoDetrazione',
        'Cuneo (ulteriore detrazione)',
        r.cuneoDetrazione,
        'detrazione',
        'Ulteriore detrazione per redditi oltre 20.000 EUR.',
        p.cuneo.fonte,
      ),
    );
  }

  voci.push(
    voce(
      'irpefNetta',
      'IRPEF netta',
      r.irpefNetta,
      'imposta',
      'IRPEF lorda meno le detrazioni, fino a concorrenza dell imposta (TUIR art. 11 co. 3).',
      null,
    ),
  );

  if (r.cuneoSomma > 0) {
    voci.push(
      voce(
        'cuneoSomma',
        'Cuneo (somma non tassata)',
        r.cuneoSomma,
        'netto',
        'Somma che non concorre al reddito per redditi fino a 20.000 EUR: si aggiunge al netto.',
        p.cuneo.fonte,
      ),
    );
  }

  const regionale = p.addizionali?.regionale;
  voci.push(
    voce(
      'addizionaleRegionale',
      'Addizionale regionale',
      r.addizionaleRegionale,
      'addizionale',
      regionale
        ? 'Addizionale regionale IRPEF per scaglioni, sull imponibile.'
        : 'Aliquote regionali non ancora inserite.',
      regionale?.fonte ?? null,
      [],
      Boolean(regionale),
    ),
  );

  const comunale = p.addizionali?.comunale;
  voci.push(
    voce(
      'addizionaleComunale',
      'Addizionale comunale',
      r.addizionaleComunale,
      'addizionale',
      comunale
        ? (comunale.fonte.nota ?? 'Addizionale comunale IRPEF.')
        : 'Aliquota comunale non ancora inserita.',
      comunale?.fonte ?? null,
      [],
      Boolean(comunale),
    ),
  );

  voci.push(
    voce(
      'nettoAnnuo',
      'Netto annuo',
      r.nettoAnnuo,
      'netto',
      'RAL meno contributi, IRPEF netta e addizionali, piu la somma del cuneo.',
      null,
    ),
  );

  const imponibileEuro = toEuros(r.imponibileIrpef);
  const impostePersonali = add(r.irpefNetta, r.addizionali);
  const prelievo = add(r.inps.totale, impostePersonali);

  const indicatori: IndicatoriProspetto = {
    aliquotaMarginaleIrpef: aliquotaMarginale(r.imponibileIrpef, p.irpef.scaglioni.valore),
    aliquotaMediaImposte: imponibileEuro > 0 ? toEuros(impostePersonali) / imponibileEuro : 0,
    pressioneFiscale: toEuros(r.ral) > 0 ? toEuros(prelievo) / toEuros(r.ral) : 0,
  };

  return { anno, ral: r.ral, voci, indicatori, risultato: r };
}

/** Un dettaglio serializzato, importo in euro. */
export interface DettaglioSerializzato {
  etichetta: string;
  euro: number;
  nota: string;
}

/** Una voce serializzata, importo in euro, pronta per JSON e UI. */
export interface VoceSerializzata {
  chiave: string;
  etichetta: string;
  categoria: CategoriaVoce;
  euro: number;
  disponibile: boolean;
  spiegazione: string;
  fonte: Fonte | null;
  dettaglio: DettaglioSerializzato[];
}

/** Il prospetto serializzato, con importi in euro: contratto stabile per CLI --json e UI. */
export interface ProspettoSerializzato {
  anno: number;
  ral: number;
  voci: VoceSerializzata[];
  indicatori: IndicatoriProspetto;
}

/** Converte un Prospetto in una struttura JSON-friendly con importi in euro. */
export function serializzaProspetto(p: Prospetto): ProspettoSerializzato {
  return {
    anno: p.anno,
    ral: toEuros(p.ral),
    voci: p.voci.map((v) => ({
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
    indicatori: p.indicatori,
  };
}

function pct(frazione: number): string {
  return `${(frazione * 100).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function euro(m: Money): string {
  return `${toEuros(m).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })} EUR`;
}
