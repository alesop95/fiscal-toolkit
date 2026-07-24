/**
 * Barrel di libreria: superficie pubblica importabile da una eventuale UI o da altri moduli.
 * In Fase 0 espone il dominio monetario e lo schema dei parametri; le fasi successive vi
 * aggiungono il motore di calcolo, l'ingestione e la composizione della fotografia fiscale.
 */

export * as money from './domain/money.js';
export type { Money } from './domain/money.js';

export { parseParams, paramsAnnoSchema, cited, fonteSchema } from '../params/schema.js';
export type { ParamsAnno, Cited, Fonte } from '../params/schema.js';
