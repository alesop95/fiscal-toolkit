/**
 * Calcolo dell'IRPEF lorda per scaglioni, con aliquote marginali.
 *
 * Funzione pura nella forma (imponibile, scaglioni) => risultato: nessun IO, nessuna lettura
 * dell'orologio, nessun numero normativo cablato. Le aliquote e le soglie arrivano dai parametri
 * (params/AAAA.ts), cosi' il motore resta corretto qualunque sia l'anno d'imposta e verificabile
 * contro la fonte di legge separatamente. Gli scaglioni si intendono ordinati per limite
 * superiore crescente, con l'ultimo a limite null (illimitato).
 *
 * Ogni scaglione tassa solo la porzione di imponibile compresa fra il limite precedente e il
 * proprio limite superiore (aliquota marginale), non l'intero reddito. Il risultato riporta anche
 * il dettaglio voce per voce, utile alla fotografia fiscale per spiegare l'imposta.
 */

import type { Scaglione } from '../../params/schema.js';
import { type Money, add, applyRate, cents, toCents, zero } from '../domain/money.js';

/** La porzione di imponibile che ricade in un singolo scaglione e l'imposta relativa. */
export interface ScaglioneApplicato {
  /** Limite inferiore (escluso) della porzione, in centesimi. */
  da: Money;
  /** Limite superiore (incluso) della porzione, null se illimitato. */
  a: Money | null;
  /** Aliquota marginale applicata, come frazione. */
  aliquota: number;
  /** Imponibile che ricade in questo scaglione. */
  base: Money;
  /** Imposta dovuta su questo scaglione. */
  imposta: Money;
}

/** Esito del calcolo IRPEF lordo: imponibile, imposta lorda e dettaglio per scaglione. */
export interface RisultatoIrpef {
  imponibile: Money;
  lorda: Money;
  dettaglio: ScaglioneApplicato[];
}

/**
 * Calcola l'IRPEF lorda applicando le aliquote marginali per scaglione all'imponibile dato.
 * Un imponibile nullo o negativo produce imposta zero e dettaglio vuoto.
 */
export function calcolaIrpefLorda(
  imponibile: Money,
  scaglioni: readonly Scaglione[],
): RisultatoIrpef {
  const dettaglio: ScaglioneApplicato[] = [];
  let lorda: Money = zero;

  const imp = toCents(imponibile);
  let precedente = 0;

  for (const scaglione of scaglioni) {
    if (imp <= precedente) {
      break;
    }
    const limite = scaglione.limiteSuperiore;
    const superiore = limite === null ? imp : Math.min(imp, limite);
    const baseCents = superiore - precedente;
    if (baseCents > 0) {
      const base = cents(baseCents);
      const imposta = applyRate(base, scaglione.aliquota);
      lorda = add(lorda, imposta);
      dettaglio.push({
        da: cents(precedente),
        a: limite === null ? null : cents(limite),
        aliquota: scaglione.aliquota,
        base,
        imposta,
      });
    }
    if (limite === null) {
      break;
    }
    precedente = limite;
  }

  return { imponibile, lorda, dettaglio };
}

/** Aliquota marginale applicabile a un dato imponibile, come frazione. Zero se non tassato. */
export function aliquotaMarginale(imponibile: Money, scaglioni: readonly Scaglione[]): number {
  const imp = toCents(imponibile);
  let precedente = 0;
  let marginale = 0;
  for (const scaglione of scaglioni) {
    if (imp <= precedente) {
      break;
    }
    marginale = scaglione.aliquota;
    if (scaglione.limiteSuperiore === null) {
      break;
    }
    precedente = scaglione.limiteSuperiore;
  }
  return marginale;
}
