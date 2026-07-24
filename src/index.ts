/**
 * Barrel di libreria: superficie pubblica importabile da una eventuale UI o da altri moduli.
 * Espone il dominio monetario, lo schema dei parametri, il registro dei parametri per anno e il
 * motore di calcolo lordo-netto. Le fasi successive vi aggiungono ingestione e fotografia fiscale.
 */

export * as money from './domain/money.js';
export type { Money } from './domain/money.js';

export { parseParams, paramsAnnoSchema, cited, fonteSchema } from '../params/schema.js';
export type { ParamsAnno, Cited, Fonte, Scaglione } from '../params/schema.js';
export { parametriAnno, parametriPerAnno, anniDisponibili } from '../params/index.js';

export { calcolaIrpefLorda, aliquotaMarginale } from './engine/irpef.js';
export { calcolaDetrazioneLavoroDipendente } from './engine/detrazioni.js';
export { calcolaCuneo } from './engine/cuneo.js';
export { calcolaInpsDipendente } from './engine/inps.js';
export { calcolaLordoNetto } from './engine/lordo-netto.js';
export type { RisultatoLordoNetto, ParametriMotore } from './engine/lordo-netto.js';
export { toParametriMotore, calcolaLordoNettoAnno } from './engine/params-motore.js';

export { componiProspetto } from './report/prospetto.js';
export type {
  Prospetto,
  VoceProspetto,
  DettaglioVoce,
  IndicatoriProspetto,
  CategoriaVoce,
} from './report/prospetto.js';
