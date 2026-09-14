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
 * Una novella pero' c'e', ed e' sulla previdenza complementare: l'art. 1 comma 201 lettera a)
 * numero 1 della stessa L. 199/2025 aggiunge all'art. 8 comma 4 del D.Lgs. 252/2005 il periodo
 * per cui, a decorrere dal periodo d'imposta 2026, il tetto di deducibilita' sale da 5.164,57 a
 * 5.300 EUR. Il blocco previdenzaComplementare viene quindi sovrascritto con il nuovo valore e
 * con la citazione della legge modificatrice, coerentemente con ADR-006 (la fonte di un valore
 * modificato e' la legge che lo modifica, non il solo testo consolidato dell'articolo base).
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
  previdenzaComplementare: {
    tettoDeducibilita: {
      valore: 530_000,
      fonte: {
        urn: 'urn:nir:stato:legge:2025-12-30;199',
        articolo: 'art. 1 co. 201 lett. a) n. 1',
        nota: 'Innalza a 5.300 EUR, dal periodo d imposta 2026, il tetto dell art. 8 co. 4 del D.Lgs. 252/2005. Il tetto e unico e cumulativo: lo saturano i contributi del lavoratore, quelli del datore e i versamenti volontari aggiuntivi',
      },
    },
  },
};
