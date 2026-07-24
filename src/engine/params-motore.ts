/**
 * Ponte fra i parametri normativi validati (params/AAAA.ts, importi in centesimi grezzi con le
 * loro citazioni) e i parametri che i motori consumano (ParametriMotore, importi come Money).
 *
 * Separare i due mondi tiene lo schema on-disk indipendente dal tipo Money del dominio: i file di
 * parametri restano semplici oggetti ispezionabili, e la conversione in Money avviene qui, in un
 * solo punto. La funzione calcolaLordoNettoAnno compone il mapping con l'orchestratore per offrire
 * un calcolo lordo-netto a partire dal solo anno d'imposta e dalla RAL.
 */

import { parametriAnno } from '../../params/index.js';
import type { ParamsAnno } from '../../params/schema.js';
import { type Money, cents } from '../domain/money.js';
import {
  type ParametriMotore,
  type RisultatoLordoNetto,
  calcolaLordoNetto,
} from './lordo-netto.js';

function m(centesimi: number): Money {
  return cents(centesimi);
}

/** Estrae dai parametri validati di un anno le forme (con Money) che i motori usano. */
export function toParametriMotore(p: ParamsAnno): ParametriMotore {
  const d = p.detrazioni.lavoroDipendente.valore;
  const c = p.cuneo.valore;
  const i = p.inps.valore;
  const motore: ParametriMotore = {
    scaglioniIrpef: p.irpef.scaglioni.valore,
    detrazioneLavoroDipendente: {
      soglia1: m(d.soglia1),
      importoFascia1: m(d.importoFascia1),
      soglia2: m(d.soglia2),
      importoBaseFascia2: m(d.importoBaseFascia2),
      incrementoFascia2: m(d.incrementoFascia2),
      denominatoreFascia2: m(d.denominatoreFascia2),
      soglia3: m(d.soglia3),
      importoBaseFascia3: m(d.importoBaseFascia3),
      denominatoreFascia3: m(d.denominatoreFascia3),
      maggiorazione: {
        importo: m(d.maggiorazione.importo),
        da: m(d.maggiorazione.da),
        a: m(d.maggiorazione.a),
      },
    },
    cuneo: {
      somma: {
        sogliaRedditoComplessivo: m(c.somma.sogliaRedditoComplessivo),
        fasce: c.somma.fasce.map((f) => ({
          limiteRedditoLavoro: f.limiteRedditoLavoro === null ? null : m(f.limiteRedditoLavoro),
          percentuale: f.percentuale,
        })),
      },
      detrazione: {
        importoPieno: m(c.detrazione.importoPieno),
        sogliaImportoPieno: m(c.detrazione.sogliaImportoPieno),
        sogliaAzzeramento: m(c.detrazione.sogliaAzzeramento),
        denominatore: m(c.detrazione.denominatore),
      },
    },
    inps: {
      aliquotaBase: i.aliquotaBase,
      aliquotaAggiuntiva: i.aliquotaAggiuntiva,
      primaFasciaAnnua: m(i.primaFasciaAnnua),
    },
  };

  if (p.addizionali) {
    const addizionali: NonNullable<ParametriMotore['addizionali']> = {};
    if (p.addizionali.regionale) {
      addizionali.regionale = p.addizionali.regionale.valore.scaglioni;
    }
    if (p.addizionali.comunale) {
      const c = p.addizionali.comunale.valore;
      addizionali.comunale = {
        aliquota: c.aliquota,
        sogliaEsenzione: c.sogliaEsenzione === null ? null : m(c.sogliaEsenzione),
      };
    }
    motore.addizionali = addizionali;
  }

  return motore;
}

/**
 * Calcola il lordo-netto per un dato anno d'imposta e una RAL. Lancia se l'anno non ha parametri
 * modellati.
 */
export function calcolaLordoNettoAnno(anno: number, ral: Money): RisultatoLordoNetto {
  const p = parametriAnno(anno);
  if (!p) {
    throw new Error(`Parametri non disponibili per l'anno ${anno}`);
  }
  return calcolaLordoNetto(ral, toParametriMotore(p));
}
