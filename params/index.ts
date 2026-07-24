/**
 * Registro dei parametri normativi per anno d'imposta.
 *
 * Punto unico da cui il motore e la CLI recuperano i parametri di un anno. Gli anni non ancora
 * modellati non compaiono: il 2024 e' assente perche' il suo cuneo (esonero contributivo) ha una
 * struttura diversa da quella introdotta dal 2025 e va modellato a parte prima di essere aggiunto.
 */

import { params2025 } from './2025.js';
import { params2026 } from './2026.js';
import type { ParamsAnno } from './schema.js';

/** Parametri disponibili, indicizzati per anno d'imposta. */
export const parametriPerAnno: Readonly<Record<number, ParamsAnno>> = {
  2025: params2025,
  2026: params2026,
};

/** Anni d'imposta per cui esistono parametri, in ordine crescente. */
export const anniDisponibili: readonly number[] = Object.keys(parametriPerAnno)
  .map(Number)
  .sort((a, b) => a - b);

/** Restituisce i parametri di un anno, o undefined se non modellato. */
export function parametriAnno(anno: number): ParamsAnno | undefined {
  return parametriPerAnno[anno];
}
