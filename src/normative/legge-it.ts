/**
 * Accesso in sola lettura all'indice normativo di E:\legal-consultant (legge.sqlite).
 *
 * Modulo isolato e di sola manutenzione: serve a verificare e citare i valori dei parametri
 * contro il testo di legge, non entra mai nel bundle di runtime del tool (l'orchestratore di
 * calcolo non lo importa) e non e' richiesto perche' il calcolo funzioni. Il runtime resta quindi
 * offline e deterministico anche senza il corpus.
 *
 * Usa il modulo SQLite integrato in Node (node:sqlite), che include FTS5 e non richiede
 * compilazione nativa: una scelta deliberata rispetto a un binding nativo come better-sqlite3,
 * che su questa macchina non compila senza toolchain C++. L'indice si apre in sola lettura e il
 * percorso e' sovrascrivibile con la variabile d'ambiente FISCAL_LEGGE_DB.
 */

import { DatabaseSync } from 'node:sqlite';

/** Percorso di default dell'indice normativo. */
export const PERCORSO_DB_DEFAULT = 'E:\\legal-consultant\\data\\index\\legge.sqlite';

/** Percorso effettivo del DB: variabile FISCAL_LEGGE_DB se presente, altrimenti il default. */
export function percorsoDb(): string {
  return process.env.FISCAL_LEGGE_DB ?? PERCORSO_DB_DEFAULT;
}

/** Un chunk normativo: articolo di un atto, con la sua rubrica, vigenza e testo. */
export interface Norma {
  urn: string;
  articolo: string;
  rubrica: string | null;
  vigente: string | null;
  testo: string;
}

/** Apre l'indice in sola lettura. Il chiamante e' responsabile di chiuderlo con db.close(). */
export function apriDb(percorso: string = percorsoDb()): DatabaseSync {
  return new DatabaseSync(percorso, { readOnly: true });
}

/**
 * Legge gli articoli che corrispondono a un pattern di urn (LIKE) e a un articolo esatto. Il
 * pattern LIKE permette di ignorare le differenze di forma dell'urn fra la citazione e il corpus.
 */
export function leggiArticolo(db: DatabaseSync, urnLike: string, articolo: string): Norma[] {
  const stmt = db.prepare(
    'SELECT urn, articolo, rubrica, vigente, testo FROM chunks WHERE urn LIKE ? AND articolo = ? LIMIT 10',
  );
  return stmt.all(urnLike, articolo) as unknown as Norma[];
}

/** Ricerca full-text (BM25) sul testo degli atti. */
export function cerca(db: DatabaseSync, query: string, limite = 10): Norma[] {
  const stmt = db.prepare(
    'SELECT urn, articolo, rubrica, vigente, testo FROM chunks WHERE chunks MATCH ? ORDER BY bm25(chunks) LIMIT ?',
  );
  return stmt.all(query, limite) as unknown as Norma[];
}
