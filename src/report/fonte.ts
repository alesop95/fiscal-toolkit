/**
 * Resa leggibile di una citazione normativa.
 *
 * I parametri di `params/AAAA.ts` citano ogni blocco con un URN Normattiva piu' il riferimento
 * all'articolo. L'URN e' preciso ma illeggibile: `urn:nir:stato:legge:2024-12-30;207` non dice a
 * colpo d'occhio che si tratta della Legge di Bilancio 2025. Questo modulo traduce l'URN nella
 * sigla d'uso ("L. 207/2024", "DPR 917/1986", "D.Lgs. 252/2005", "L.R. Marche 5/2022") e compone
 * la stringa di citazione che CLI e UI mostrano, cosi' la forma della citazione e' una sola,
 * definita qui e testata, invece di essere reinventata in ogni vista.
 *
 * Non tutte le fonti sono URN: l'addizionale comunale cita una pagina del MEF, perche' le delibere
 * comunali non sono su Normattiva. Un URN non riconosciuto non viene forzato in una sigla inventata
 * ma restituito com'e': meglio una citazione grezza che una etichetta plausibile e sbagliata.
 */

import type { Fonte } from '../../params/schema.js';

/** Una citazione pronta da mostrare, con le parti separate per chi vuole comporle diversamente. */
export interface FonteLeggibile {
  /** Sigla d'uso dell'atto, es. "L. 207/2024". Null se l'URN non e' riconducibile a una sigla. */
  atto: string | null;
  /** Riferimento all'articolo cosi' come scritto nel parametro. */
  articolo: string;
  /** Citazione completa in una riga: "L. 207/2024, art. 1 co. 2 lett. a". */
  testo: string;
  /** Nota del blocco normativo, se presente. */
  nota: string | null;
  /** URN o URL originale, per risalire alla fonte. */
  urn: string;
}

/** Sigle d'uso dei tipi di atto ricorrenti nella fiscalita' italiana. */
const SIGLE: Readonly<Record<string, string>> = {
  legge: 'L.',
  'decreto.legge': 'D.L.',
  'decreto.legislativo': 'D.Lgs.',
  'decreto.presidente.repubblica': 'DPR',
  'decreto.ministeriale': 'D.M.',
};

/** "regione.marche" -> "Marche"; "stato" -> "". */
function nomeEmanante(emanante: string): string {
  if (emanante === 'stato') {
    return '';
  }
  const parti = emanante.split('.').slice(1);
  return parti.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/**
 * Traduce un URN NIR nella sigla d'uso dell'atto. Restituisce null se l'URN non ha la forma attesa
 * `urn:nir:<emanante>:<tipo>:<data>;<numero>`, cosi' il chiamante puo' ripiegare sull'originale.
 */
function siglaDaUrn(urn: string): string | null {
  const parti = urn.split(':');
  if (parti.length < 5 || parti[0] !== 'urn' || parti[1] !== 'nir') {
    return null;
  }
  const emanante = parti[2] ?? '';
  const tipo = parti[3] ?? '';
  const [data, numero] = (parti[4] ?? '').split(';');
  const anno = (data ?? '').slice(0, 4);
  if (!numero || anno.length !== 4) {
    return null;
  }

  const sigla = SIGLE[tipo] ?? tipo.replace(/\./g, ' ');
  const regione = nomeEmanante(emanante);
  // Una legge regionale si cita come L.R. seguita dal nome della regione.
  if (regione && tipo === 'legge') {
    return `L.R. ${regione} ${numero}/${anno}`;
  }
  if (regione) {
    return `${sigla} ${regione} ${numero}/${anno}`;
  }
  return `${sigla} ${numero}/${anno}`;
}

/**
 * Rende leggibile una fonte di legge, senza inventare sigle per gli URN non riconosciuti. Quando
 * l'atto non e' su Normattiva (e' il caso della delibera comunale, citata su una pagina del MEF) il
 * riferimento leggibile e' il solo articolo, che gia' nomina l'atto per esteso; l'indirizzo resta
 * disponibile in `urn` per chi vuole risalire alla fonte, invece di finire in mezzo alla citazione.
 */
export function formattaFonte(fonte: Fonte): FonteLeggibile {
  const atto = siglaDaUrn(fonte.urn);
  return {
    atto,
    articolo: fonte.articolo,
    testo: atto ? `${atto}, ${fonte.articolo}` : fonte.articolo,
    nota: fonte.nota ?? null,
    urn: fonte.urn,
  };
}
