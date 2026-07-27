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
import { type Money, add, euros, subtract, sum, toEuros } from '../domain/money.js';
import { aliquotaMarginale } from '../engine/irpef.js';
import type { RisultatoLordoNetto } from '../engine/lordo-netto.js';
import { calcolaLordoNettoAnno } from '../engine/params-motore.js';
import { type FonteLeggibile, formattaFonte } from './fonte.js';

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
  /** Imposte personali (IRPEF netta piu' addizionali) rapportate all'imponibile. */
  aliquotaMediaImposte: number;
  /** Divario fra RAL e netto annuo rapportato alla RAL: quanto del lordo non arriva al lavoratore. */
  pressioneFiscale: number;
}

/** Una fetta della RAL nella barra di composizione. */
export interface SegmentoComposizione {
  chiave: 'nettoDaRal' | 'inps' | 'irpef' | 'addizionali';
  etichetta: string;
  importo: Money;
  /** Frazione della RAL, gia' calcolata: la vista non deve dividere per conto suo. */
  quota: number;
}

/**
 * Come si ripartisce la RAL fra quanto resta al lavoratore e quanto e' prelevato, piu' la
 * riconciliazione col netto annuo.
 *
 * I segmenti sommano esattamente al totale, che e' la RAL. La somma non tassata del cuneo
 * (L. 207/2024 art. 1 co. 4) non e' una fetta della RAL ma un importo che si aggiunge sopra:
 * tenerla fuori dai segmenti e' l'unico modo perche' la barra non menta ne' sul proprio totale ne'
 * sul netto. Per questo la riconciliazione e' esplicita: nettoDaRal piu' cuneoSomma da' nettoAnnuo.
 */
export interface ComposizioneRal {
  totale: Money;
  segmenti: SegmentoComposizione[];
  nettoDaRal: Money;
  cuneoSomma: Money;
  nettoAnnuo: Money;
}

/** Il netto ripartito su un numero di mensilita'. */
export interface Mensilita {
  rate: number;
  importo: Money;
}

/** Numeri di mensilita' su cui si ripartisce il netto annuo. Unica definizione per CLI e UI. */
export const RATE_MENSILITA: readonly number[] = [12, 13, 14];

/** Il prospetto completo: voci ordinate, indicatori e risultato grezzo del motore. */
export interface Prospetto {
  anno: number;
  ral: Money;
  voci: VoceProspetto[];
  indicatori: IndicatoriProspetto;
  composizione: ComposizioneRal;
  mensilita: Mensilita[];
  risultato: RisultatoLordoNetto;
}

/**
 * Ripartisce la RAL nei segmenti della barra. Il netto da RAL e' calcolato per differenza qui, una
 * volta sola, cosi' nessuna vista lo ricostruisce (ed e' l'errore che questa funzione elimina).
 */
function componiComposizione(r: RisultatoLordoNetto): ComposizioneRal {
  const nettoDaRal = subtract(
    subtract(subtract(r.ral, r.inps.totale), r.irpefNetta),
    r.addizionali,
  );
  const ralEuro = toEuros(r.ral);
  const quota = (m: Money): number => (ralEuro > 0 ? toEuros(m) / ralEuro : 0);

  const segmenti: SegmentoComposizione[] = [
    {
      chiave: 'nettoDaRal',
      etichetta: 'Netto da RAL',
      importo: nettoDaRal,
      quota: quota(nettoDaRal),
    },
    {
      chiave: 'inps',
      etichetta: 'Contributi INPS',
      importo: r.inps.totale,
      quota: quota(r.inps.totale),
    },
    {
      chiave: 'irpef',
      etichetta: 'IRPEF netta',
      importo: r.irpefNetta,
      quota: quota(r.irpefNetta),
    },
    {
      chiave: 'addizionali',
      etichetta: 'Addizionali',
      importo: r.addizionali,
      quota: quota(r.addizionali),
    },
  ];

  return {
    totale: sum(segmenti.map((s) => s.importo)),
    segmenti,
    nettoDaRal,
    cuneoSomma: r.cuneoSomma,
    nettoAnnuo: r.nettoAnnuo,
  };
}

/** Ripartisce il netto annuo sulle mensilita' d'uso. */
function componiMensilita(nettoAnnuo: Money): Mensilita[] {
  return RATE_MENSILITA.map((rate) => ({ rate, importo: euros(toEuros(nettoAnnuo) / rate) }));
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
        ? 'Addizionale comunale IRPEF ad aliquota unica, con soglia di esenzione.'
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
  const ralEuro = toEuros(r.ral);
  const impostePersonali = add(r.irpefNetta, r.addizionali);

  // La pressione si misura sul divario fra lordo e netto, non sulla somma dei prelievi. Le due
  // definizioni coincidono quasi sempre, ma divergono dove il cuneo eroga la somma non tassata del
  // co. 4: quella somma arriva al lavoratore pur non riducendo alcun prelievo, e misurare i soli
  // prelievi la renderebbe invisibile, facendo apparire piu' gravato chi la riceve. Con questa
  // definizione l'indicatore resta coerente col netto mostrato ovunque nelle viste.
  const indicatori: IndicatoriProspetto = {
    aliquotaMarginaleIrpef: aliquotaMarginale(r.imponibileIrpef, p.irpef.scaglioni.valore),
    aliquotaMediaImposte: imponibileEuro > 0 ? toEuros(impostePersonali) / imponibileEuro : 0,
    pressioneFiscale: ralEuro > 0 ? toEuros(subtract(r.ral, r.nettoAnnuo)) / ralEuro : 0,
  };

  return {
    anno,
    ral: r.ral,
    voci,
    indicatori,
    composizione: componiComposizione(r),
    mensilita: componiMensilita(r.nettoAnnuo),
    risultato: r,
  };
}

/** Un dettaglio serializzato, importo in euro. */
export interface DettaglioSerializzato {
  etichetta: string;
  euro: number;
  nota: string;
}

/**
 * Una voce serializzata, importo in euro, pronta per JSON e UI. La fonte esce gia' nella forma
 * leggibile prodotta da formattaFonte: la sigla dell'atto si compone in un punto solo, non in ogni
 * vista, e l'URN resta comunque nel payload per risalire alla fonte.
 */
export interface VoceSerializzata {
  chiave: string;
  etichetta: string;
  categoria: CategoriaVoce;
  euro: number;
  disponibile: boolean;
  spiegazione: string;
  fonte: FonteLeggibile | null;
  dettaglio: DettaglioSerializzato[];
}

/** Un segmento serializzato, importo in euro. */
export interface SegmentoSerializzato {
  chiave: SegmentoComposizione['chiave'];
  etichetta: string;
  euro: number;
  quota: number;
}

/** La composizione serializzata, importi in euro. */
export interface ComposizioneSerializzata {
  totale: number;
  segmenti: SegmentoSerializzato[];
  nettoDaRal: number;
  cuneoSomma: number;
  nettoAnnuo: number;
}

/** Il prospetto serializzato, con importi in euro: contratto stabile per CLI --json e UI. */
export interface ProspettoSerializzato {
  anno: number;
  ral: number;
  voci: VoceSerializzata[];
  indicatori: IndicatoriProspetto;
  composizione: ComposizioneSerializzata;
  mensilita: { rate: number; euro: number }[];
}

/** Converte un Prospetto in una struttura JSON-friendly con importi in euro. */
export function serializzaProspetto(p: Prospetto): ProspettoSerializzato {
  return {
    anno: p.anno,
    ral: toEuros(p.ral),
    composizione: {
      totale: toEuros(p.composizione.totale),
      segmenti: p.composizione.segmenti.map((s) => ({
        chiave: s.chiave,
        etichetta: s.etichetta,
        euro: toEuros(s.importo),
        quota: s.quota,
      })),
      nettoDaRal: toEuros(p.composizione.nettoDaRal),
      cuneoSomma: toEuros(p.composizione.cuneoSomma),
      nettoAnnuo: toEuros(p.composizione.nettoAnnuo),
    },
    mensilita: p.mensilita.map((m) => ({ rate: m.rate, euro: toEuros(m.importo) })),
    voci: p.voci.map((v) => ({
      chiave: v.chiave,
      etichetta: v.etichetta,
      categoria: v.categoria,
      euro: toEuros(v.importo),
      disponibile: v.disponibile,
      spiegazione: v.spiegazione,
      fonte: v.fonte ? formattaFonte(v.fonte) : null,
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
