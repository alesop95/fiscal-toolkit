/**
 * Parametri normativi per l'anno d'imposta 2026.
 *
 * La Legge di Bilancio 2026 (L. 30 dicembre 2025, n. 199) non modifica gli scaglioni IRPEF, la
 * detrazione da lavoro dipendente (TUIR art. 13) ne' la struttura del cuneo: verificato contro
 * E:\legal-consultant (legge.sqlite), non risultano novelle all'art. 11 o all'art. 13 del TUIR
 * ne' alle misure della L. 207/2024. Restano quindi i valori strutturali del 2025, che qui
 * vengono riusati cambiando solo l'anno. Le fonti citate nei blocchi restano gli atti che fissano
 * i valori vigenti anche per il 2026.
 *
 * Addizionali: l'addizionale comunale di Civitanova Marche per il 2026 non risulta ancora
 * pubblicata sulla fonte MEF; si eredita provvisoriamente l'aliquota 2025 (0,72%), da confermare
 * quando la delibera 2026 sara' disponibile.
 */

import { params2025 } from './2025.js';
import type { ParamsAnno } from './schema.js';

export const params2026: ParamsAnno = {
  ...params2025,
  anno: 2026,
};
