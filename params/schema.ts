/**
 * Schema Zod dei parametri normativi per anno d'imposta e wrapper Cited<T>.
 *
 * Ogni valore normativo (scaglioni IRPEF, aliquota INPS, tetto di deducibilita', ecc.) e'
 * avvolto in un Cited<T>, che affianca al valore la sua fonte di legge (URN Normattiva piu'
 * articolo). Questo rende la provenienza di ogni numero ispezionabile e verificabile contro
 * legal-consultant, senza dipendere da esso a runtime. Gli importi monetari nello schema sono
 * espressi in centesimi interi, coerenti con il tipo Money del dominio.
 *
 * Al termine della Fase 0 lo schema fissa la forma; i campi di dettaglio (detrazioni, cuneo)
 * vengono affinati in Fase 1 quando nascono i file params/AAAA.ts con i valori reali citati.
 */

import { z } from 'zod';

/** Fonte di legge di un valore normativo: URN Normattiva piu' articolo. */
export const fonteSchema = z.object({
  /** URN Normattiva, es. "urn:nir:stato:decreto.presidente.repubblica:1986-12-22;917". */
  urn: z.string().min(1),
  /** Riferimento all'articolo, es. "art. 11". */
  articolo: z.string().min(1),
  /** Nota facoltativa (comma, allegato, precisazione). */
  nota: z.string().optional(),
});
export type Fonte = z.infer<typeof fonteSchema>;

/** Costruisce lo schema di un valore normativo citato, dato lo schema del valore. */
export function cited<T extends z.ZodTypeAny>(valore: T) {
  return z.object({ valore, fonte: fonteSchema });
}

/** Valore normativo con la sua fonte di legge. */
export interface Cited<T> {
  valore: T;
  fonte: Fonte;
}

/** Importo monetario in centesimi interi. */
const moneyCentsSchema = z.number().int();

/** Aliquota come frazione nell'intervallo [0, 1]. */
const aliquotaSchema = z.number().min(0).max(1);

/** Uno scaglione IRPEF: limite superiore (null per l'ultimo, illimitato) e aliquota. */
const scaglioneSchema = z.object({
  limiteSuperiore: moneyCentsSchema.nullable(),
  aliquota: aliquotaSchema,
});

/** Una fascia della detrazione da lavoro dipendente. Struttura affinata in Fase 1. */
const fasciaDetrazioneSchema = z.object({
  redditoFino: moneyCentsSchema.nullable(),
  importo: moneyCentsSchema,
  decrescente: z.boolean().default(false),
});

/** Parametri normativi di un singolo anno d'imposta. */
export const paramsAnnoSchema = z.object({
  anno: z.number().int().gte(2000).lte(2100),
  irpef: z.object({
    scaglioni: cited(z.array(scaglioneSchema).min(1)),
  }),
  inps: z.object({
    aliquotaLavoratoreDipendente: cited(aliquotaSchema),
  }),
  detrazioni: z.object({
    lavoroDipendente: cited(z.array(fasciaDetrazioneSchema).min(1)),
  }),
  previdenzaComplementare: z.object({
    tettoDeducibilita: cited(moneyCentsSchema),
  }),
  cuneo: z.object({
    descrizione: z.string(),
    parametri: cited(z.record(z.string(), z.number())),
  }),
});

/** Parametri normativi di un anno d'imposta, validati. */
export type ParamsAnno = z.infer<typeof paramsAnnoSchema>;

/** Convalida un input sconosciuto contro lo schema, lanciando su parametri malformati. */
export function parseParams(input: unknown): ParamsAnno {
  return paramsAnnoSchema.parse(input);
}
