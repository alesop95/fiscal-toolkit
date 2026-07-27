/**
 * Curva del prelievo al variare della RAL.
 *
 * Il motore sa gia' rispondere alla domanda "quanto mi resta di un euro lordo in piu'", ma nessuna
 * vista la poneva: il prospetto risponde per una sola RAL e il confronto fra anni varia l'anno, non
 * il reddito. Questo modulo campiona il calcolo su una scala di RAL e restituisce, punto per punto,
 * il netto e le aliquote. E' la vista che rende visibili le discontinuita' del cuneo: la somma non
 * tassata del co. 4 si spegne oltre 20.000 euro di reddito complessivo e l'ulteriore detrazione del
 * co. 6 decresce fra 32.000 e 40.000, quindi in quelle zone un euro lordo in piu' puo' valere molto
 * meno di quanto suggerisca l'aliquota IRPEF marginale.
 *
 * L'aliquota marginale effettiva qui e' una differenza in avanti sul passo di campionamento, non
 * una derivata: e' la quota dell'incremento lordo che non arriva al netto, contati contributi,
 * IRPEF, detrazioni, cuneo e addizionali. Dipende quindi dal passo scelto, e su un passo largo
 * spalma uno scalino su tutto l'intervallo invece di mostrarlo netto. Il modulo non duplica
 * aritmetica fiscale: ogni punto e' un Prospetto completo, calcolato dai motori.
 *
 * La grandezza puo' risultare negativa, e non e' un errore di calcolo: dove la norma modellata ha
 * una discontinuita' a gradino, un lordo maggiore produce un netto piu' che proporzionalmente
 * maggiore. Accade al passaggio di 15.000 EUR di reddito, dove la detrazione dell'art. 13 TUIR
 * salta dai 1.955 EUR fissi della lett. a) ai circa 3.100 EUR con cui riparte la lett. b), e dove
 * cambia anche la fascia percentuale della somma del cuneo. Rendere visibili questi salti e' lo
 * scopo della curva.
 */

import { type Money, cents, euros, subtract, toEuros } from '../domain/money.js';
import { type Prospetto, componiProspetto } from './prospetto.js';

/** Estremi e passo di default del campionamento. */
export const CURVA_DEFAULT = {
  da: euros(15_000),
  a: euros(60_000),
  passo: euros(1_000),
} as const;

/** Tetto sul numero di punti: la curva e' una vista, non un motore di simulazione di massa. */
export const MAX_PUNTI = 200;

/** Un punto della curva: una RAL e il prelievo che le corrisponde. */
export interface PuntoCurva {
  ral: Money;
  nettoAnnuo: Money;
  /** Imposte personali (IRPEF netta piu' addizionali) sull'imponibile. */
  aliquotaMediaImposte: number;
  /** Divario fra RAL e netto rapportato alla RAL. */
  pressioneFiscale: number;
  /** Aliquota marginale IRPEF di legge all'imponibile del punto. */
  aliquotaMarginaleIrpef: number;
  /** Quota trattenuta dell'incremento lordo pari a un passo, differenza in avanti. */
  aliquotaMarginaleEffettiva: number;
}

/** La curva campionata per un anno d'imposta. */
export interface Curva {
  anno: number;
  da: Money;
  a: Money;
  passo: Money;
  punti: PuntoCurva[];
}

/** Opzioni di campionamento; ognuna ricade sul default se omessa. */
export interface OpzioniCurva {
  da?: Money;
  a?: Money;
  passo?: Money;
}

/**
 * Campiona il calcolo lordo-netto da `da` ad `a` con il passo indicato, estremi inclusi. Lancia su
 * intervallo o passo non sensati e quando il numero di punti supera MAX_PUNTI, cosi' un ingresso
 * malformato fallisce subito invece di generare migliaia di prospetti.
 */
export function componiCurva(anno: number, opzioni: OpzioniCurva = {}): Curva {
  const da = opzioni.da ?? CURVA_DEFAULT.da;
  const a = opzioni.a ?? CURVA_DEFAULT.a;
  const passo = opzioni.passo ?? CURVA_DEFAULT.passo;

  if (passo <= 0) {
    throw new RangeError('Il passo della curva deve essere positivo');
  }
  if (da < 0 || a < da) {
    throw new RangeError('Intervallo della curva non valido');
  }
  const numeroPunti = Math.floor((a - da) / passo) + 1;
  if (numeroPunti > MAX_PUNTI) {
    throw new RangeError(
      `La curva richiederebbe ${numeroPunti} punti, oltre il massimo ${MAX_PUNTI}`,
    );
  }

  // Si calcola un prospetto in piu' oltre l'estremo superiore: serve alla differenza in avanti
  // dell'ultimo punto, che altrimenti non avrebbe un successore.
  const prospetti: Prospetto[] = [];
  for (let i = 0; i <= numeroPunti; i += 1) {
    prospetti.push(componiProspetto(anno, cents(da + i * passo)));
  }

  const passoEuro = toEuros(passo);
  const punti: PuntoCurva[] = [];
  for (let i = 0; i < numeroPunti; i += 1) {
    const corrente = prospetti[i] as Prospetto;
    const successivo = prospetti[i + 1] as Prospetto;
    const incrementoNetto = subtract(
      successivo.risultato.nettoAnnuo,
      corrente.risultato.nettoAnnuo,
    );
    punti.push({
      ral: corrente.ral,
      nettoAnnuo: corrente.risultato.nettoAnnuo,
      aliquotaMediaImposte: corrente.indicatori.aliquotaMediaImposte,
      pressioneFiscale: corrente.indicatori.pressioneFiscale,
      aliquotaMarginaleIrpef: corrente.indicatori.aliquotaMarginaleIrpef,
      aliquotaMarginaleEffettiva: 1 - toEuros(incrementoNetto) / passoEuro,
    });
  }

  return { anno, da, a, passo, punti };
}

/** Un punto serializzato, importi in euro. */
export interface PuntoSerializzato {
  ral: number;
  nettoAnnuo: number;
  aliquotaMediaImposte: number;
  pressioneFiscale: number;
  aliquotaMarginaleIrpef: number;
  aliquotaMarginaleEffettiva: number;
}

/** La curva serializzata: contratto di /api/curva e di `fiscal curva --json`. */
export interface CurvaSerializzata {
  anno: number;
  da: number;
  a: number;
  passo: number;
  punti: PuntoSerializzato[];
}

/** Converte una Curva in una struttura JSON-friendly con importi in euro. */
export function serializzaCurva(c: Curva): CurvaSerializzata {
  return {
    anno: c.anno,
    da: toEuros(c.da),
    a: toEuros(c.a),
    passo: toEuros(c.passo),
    punti: c.punti.map((p) => ({
      ral: toEuros(p.ral),
      nettoAnnuo: toEuros(p.nettoAnnuo),
      aliquotaMediaImposte: p.aliquotaMediaImposte,
      pressioneFiscale: p.pressioneFiscale,
      aliquotaMarginaleIrpef: p.aliquotaMarginaleIrpef,
      aliquotaMarginaleEffettiva: p.aliquotaMarginaleEffettiva,
    })),
  };
}
