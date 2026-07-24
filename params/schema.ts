/**
 * Schema Zod dei parametri normativi per anno d'imposta e wrapper Cited<T>.
 *
 * Ogni sezione normativa (scaglioni IRPEF, detrazione da lavoro dipendente, cuneo, contributi
 * INPS, tetto di deducibilita' della previdenza) e' avvolta in un Cited<T>, che affianca al
 * valore la sua fonte di legge (URN Normattiva piu' articolo). La citazione e' per blocco
 * coerente, non per singolo numero: un blocco cita l'atto che ne fissa i valori vigenti, cosi'
 * ogni cifra resta ispezionabile e verificabile contro legal-consultant senza dipendere da esso a
 * runtime. Gli importi monetari sono in centesimi interi, coerenti con il tipo Money del dominio;
 * la conversione in Money per i motori avviene nel mapper src/engine/params-motore.ts.
 *
 * Le forme dei valori corrispondono uno a uno ai parametri che i motori consumano
 * (src/engine/*): scaglioni per l'IRPEF, la struttura a fasce della detrazione art. 13, le due
 * misure del cuneo, le aliquote contributive. In questo modo lo schema convalida esattamente cio'
 * che il motore usa.
 */

import { z } from 'zod';

/** Fonte di legge di un blocco normativo: URN Normattiva piu' articolo. */
export const fonteSchema = z.object({
  /** URN Normattiva, es. "urn:nir:stato:legge:2024-12-30;207". */
  urn: z.string().min(1),
  /** Riferimento all'articolo/comma, es. "art. 1 co. 2 lett. a". */
  articolo: z.string().min(1),
  /** Nota facoltativa (precisazione, catena di modifiche, valore da verificare). */
  nota: z.string().optional(),
});
export type Fonte = z.infer<typeof fonteSchema>;

/** Costruisce lo schema di un blocco normativo citato, dato lo schema del valore. */
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

/** Aliquota o percentuale come frazione nell'intervallo [0, 1]. */
const aliquotaSchema = z.number().min(0).max(1);

/** Uno scaglione IRPEF: limite superiore (null per l'ultimo, illimitato) e aliquota. */
export const scaglioneSchema = z.object({
  limiteSuperiore: moneyCentsSchema.nullable(),
  aliquota: aliquotaSchema,
});

/** Uno scaglione IRPEF validato. */
export type Scaglione = z.infer<typeof scaglioneSchema>;

/** Costanti della detrazione da lavoro dipendente, TUIR art. 13 co. 1 e co. 1.1. */
const detrazioneLavoroSchema = z.object({
  soglia1: moneyCentsSchema,
  importoFascia1: moneyCentsSchema,
  soglia2: moneyCentsSchema,
  importoBaseFascia2: moneyCentsSchema,
  incrementoFascia2: moneyCentsSchema,
  denominatoreFascia2: moneyCentsSchema,
  soglia3: moneyCentsSchema,
  importoBaseFascia3: moneyCentsSchema,
  denominatoreFascia3: moneyCentsSchema,
  maggiorazione: z.object({
    importo: moneyCentsSchema,
    da: moneyCentsSchema,
    a: moneyCentsSchema,
  }),
});

/** Una fascia della somma del cuneo (co. 4): percentuale fino a un limite di reddito di lavoro. */
const fasciaSommaSchema = z.object({
  limiteRedditoLavoro: moneyCentsSchema.nullable(),
  percentuale: aliquotaSchema,
});

/** Costanti del cuneo fiscale 2025, L. 207/2024 art. 1 co. 4 (somma) e co. 6 (detrazione). */
const cuneoSchema = z.object({
  somma: z.object({
    sogliaRedditoComplessivo: moneyCentsSchema,
    fasce: z.array(fasciaSommaSchema).min(1),
  }),
  detrazione: z.object({
    importoPieno: moneyCentsSchema,
    sogliaImportoPieno: moneyCentsSchema,
    sogliaAzzeramento: moneyCentsSchema,
    denominatore: moneyCentsSchema,
  }),
});

/** Costanti contributive a carico del lavoratore dipendente. */
const inpsSchema = z.object({
  aliquotaBase: aliquotaSchema,
  aliquotaAggiuntiva: aliquotaSchema,
  primaFasciaAnnua: moneyCentsSchema,
});

/** Addizionale regionale: scaglioni applicati marginalmente come l'IRPEF. */
const addizionaleRegionaleSchema = z.object({
  scaglioni: z.array(scaglioneSchema).min(1),
});

/** Addizionale comunale: aliquota unica con eventuale soglia di esenzione. */
const addizionaleComunaleSchema = z.object({
  aliquota: aliquotaSchema,
  sogliaEsenzione: moneyCentsSchema.nullable(),
});

/** Parametri normativi di un singolo anno d'imposta, ogni blocco citato alla sua fonte. */
export const paramsAnnoSchema = z.object({
  anno: z.number().int().gte(2000).lte(2100),
  irpef: z.object({
    scaglioni: cited(z.array(scaglioneSchema).min(1)),
  }),
  detrazioni: z.object({
    lavoroDipendente: cited(detrazioneLavoroSchema),
  }),
  cuneo: cited(cuneoSchema),
  inps: cited(inpsSchema),
  previdenzaComplementare: z.object({
    tettoDeducibilita: cited(moneyCentsSchema),
  }),
  // Addizionali locali: opzionali, perche' dipendono dalla residenza e le due componenti possono
  // arrivare in momenti diversi (la regionale e la comunale hanno fonti distinte). Ogni blocco
  // cita la propria fonte (legge regionale, delibera comunale, dato MEF).
  addizionali: z
    .object({
      regionale: cited(addizionaleRegionaleSchema).optional(),
      comunale: cited(addizionaleComunaleSchema).optional(),
    })
    .optional(),
});

/** Parametri normativi di un anno d'imposta, validati. */
export type ParamsAnno = z.infer<typeof paramsAnnoSchema>;

/** Convalida un input sconosciuto contro lo schema, lanciando su parametri malformati. */
export function parseParams(input: unknown): ParamsAnno {
  return paramsAnnoSchema.parse(input);
}
