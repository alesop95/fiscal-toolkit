/**
 * Orchestratore lordo-netto per un lavoratore dipendente.
 *
 * Compone i motori puri della Fase 1 nella catena di calcolo che porta dalla retribuzione annua
 * lorda al netto: contributi INPS a carico del lavoratore, imponibile fiscale come lordo al netto
 * dei contributi deducibili, IRPEF lorda per scaglioni, detrazione da lavoro dipendente e cuneo,
 * fino all'IRPEF netta e al netto annuo. Anche questo e' codice puro e deterministico: nessun IO,
 * nessuna lettura dell'orologio, tutti i numeri normativi passati nei parametri.
 *
 * Modello e semplificazioni dichiarate. Il reddito complessivo del lavoratore dipendente e'
 * approssimato con l'imponibile fiscale (lordo meno contributi), ipotesi corretta per il caso di
 * soli redditi di lavoro dipendente senza altri oneri deducibili. Le addizionali regionale e
 * comunale non sono ancora calcolate perche' le relative aliquote non sono nel corpus nazionale e
 * vanno acquisite da fonte ufficiale: il risultato le espone a zero, esplicitamente, finche' il
 * modulo dedicato non le fornira'. Il calcolo e' su base annua piena.
 */

import type { Scaglione } from '../../params/schema.js';
import { type Money, add, max, subtract, zero } from '../domain/money.js';
import {
  type AddizionaleComunaleParams,
  calcolaAddizionaleComunale,
  calcolaAddizionaleRegionale,
} from './addizionali.js';
import { type CuneoParams, calcolaCuneo } from './cuneo.js';
import {
  type DetrazioneLavoroDipendenteParams,
  calcolaDetrazioneLavoroDipendente,
} from './detrazioni.js';
import { type InpsParams, type RisultatoInps, calcolaInpsDipendente } from './inps.js';
import { type ScaglioneApplicato, calcolaIrpefLorda } from './irpef.js';

/** Parametri normativi che l'orchestratore consuma, gia' estratti dai valori citati per anno. */
export interface ParametriMotore {
  scaglioniIrpef: readonly Scaglione[];
  detrazioneLavoroDipendente: DetrazioneLavoroDipendenteParams;
  cuneo: CuneoParams;
  inps: InpsParams;
  /**
   * Addizionali locali, opzionali e indipendenti: la regionale e la comunale hanno fonti diverse
   * e possono essere disponibili una senza l'altra.
   */
  addizionali?: {
    regionale?: readonly Scaglione[];
    comunale?: AddizionaleComunaleParams;
  };
}

/** Esito completo del calcolo lordo-netto, voce per voce per la trasparenza della fotografia. */
export interface RisultatoLordoNetto {
  ral: Money;
  inps: RisultatoInps;
  /** Imponibile IRPEF: RAL al netto dei contributi deducibili. */
  imponibileIrpef: Money;
  irpefLorda: Money;
  detrazioneLavoro: Money;
  /** Parte del cuneo (co. 6) che riduce l'imposta lorda. */
  cuneoDetrazione: Money;
  irpefNetta: Money;
  /** Parte del cuneo (co. 4) che non concorre al reddito e si aggiunge al netto. */
  cuneoSomma: Money;
  /** Addizionale regionale IRPEF. Zero se non disponibile per l'anno. */
  addizionaleRegionale: Money;
  /** Addizionale comunale IRPEF. Zero se non disponibile per l'anno. */
  addizionaleComunale: Money;
  /** Totale addizionali (regionale piu' comunale). */
  addizionali: Money;
  nettoAnnuo: Money;
  dettaglioIrpef: ScaglioneApplicato[];
}

/**
 * Calcola il netto annuo a partire dalla retribuzione annua lorda e dai parametri dell'anno
 * d'imposta. Restituisce anche tutte le voci intermedie per spiegare il risultato.
 */
export function calcolaLordoNetto(ral: Money, params: ParametriMotore): RisultatoLordoNetto {
  const inps = calcolaInpsDipendente(ral, params.inps);
  const imponibileIrpef = subtract(ral, inps.totale);

  const irpef = calcolaIrpefLorda(imponibileIrpef, params.scaglioniIrpef);
  const detrazione = calcolaDetrazioneLavoroDipendente(
    imponibileIrpef,
    params.detrazioneLavoroDipendente,
  );

  // Per il lavoratore dipendente puro reddito complessivo e reddito di lavoro coincidono con
  // l'imponibile fiscale.
  const cuneo = calcolaCuneo(imponibileIrpef, imponibileIrpef, params.cuneo);
  const cuneoDetrazione = cuneo.tipo === 'detrazione' ? cuneo.importo : zero;
  const cuneoSomma = cuneo.tipo === 'somma' ? cuneo.importo : zero;

  // Le detrazioni operano fino a concorrenza dell'imposta lorda (TUIR art. 11 co. 3).
  const irpefNetta = max(zero, subtract(subtract(irpef.lorda, detrazione.totale), cuneoDetrazione));

  // Le addizionali si calcolano sull'imponibile IRPEF, ciascuna se disponibile per l'anno.
  const addizionaleRegionale = params.addizionali?.regionale
    ? calcolaAddizionaleRegionale(imponibileIrpef, params.addizionali.regionale)
    : zero;
  const addizionaleComunale = params.addizionali?.comunale
    ? calcolaAddizionaleComunale(imponibileIrpef, params.addizionali.comunale)
    : zero;
  const addizionali = add(addizionaleRegionale, addizionaleComunale);

  const nettoAnnuo = add(
    subtract(subtract(subtract(ral, inps.totale), irpefNetta), addizionali),
    cuneoSomma,
  );

  return {
    ral,
    inps,
    imponibileIrpef,
    irpefLorda: irpef.lorda,
    detrazioneLavoro: detrazione.totale,
    cuneoDetrazione,
    irpefNetta,
    cuneoSomma,
    addizionaleRegionale,
    addizionaleComunale,
    addizionali,
    nettoAnnuo,
    dettaglioIrpef: irpef.dettaglio,
  };
}
