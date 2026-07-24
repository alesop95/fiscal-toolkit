/**
 * Server della UI locale. Usa solo il modulo http integrato di Node: nessuna dipendenza esterna,
 * nessun accesso di rete in uscita, bind sul solo loopback 127.0.0.1. Serve la pagina statica e
 * due API di sola lettura che restituiscono gli anni disponibili e il Prospetto serializzato,
 * cioe' lo stesso modello che la CLI stampa. La logica di calcolo resta nei moduli puri: qui c'e'
 * solo il trasporto HTTP.
 *
 * L'handler gestisciRichiesta e' esportato e privo di effetti collaterali, cosi' e' testabile
 * senza aprire una porta; l'avvio vero e proprio vive in avvia() ed e' invocato da ui/main.ts.
 */

import { type IncomingMessage, type ServerResponse, createServer } from 'node:http';
import { anniDisponibili, parametriAnno } from '../../params/index.js';
import { euros } from '../domain/money.js';
import { componiProspetto, serializzaProspetto } from '../report/prospetto.js';
import { PAGINA_HTML } from './page.js';

/** Porta di default della UI locale, sovrascrivibile con FISCAL_UI_PORT. */
export const PORTA_DEFAULT = 4173;

function inviaJson(res: ServerResponse, stato: number, dati: unknown): void {
  res.writeHead(stato, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dati));
}

/** Gestisce una richiesta HTTP. Puro rispetto allo stato del processo: nessun side effect globale. */
export function gestisciRichiesta(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PAGINA_HTML);
    return;
  }

  if (url.pathname === '/api/anni') {
    inviaJson(res, 200, { anni: anniDisponibili });
    return;
  }

  if (url.pathname === '/api/netto') {
    const ral = Number(url.searchParams.get('ral'));
    const anno = Number(url.searchParams.get('anno'));
    if (!Number.isFinite(ral) || ral < 0) {
      inviaJson(res, 400, { errore: 'RAL non valida' });
      return;
    }
    if (!parametriAnno(anno)) {
      inviaJson(res, 400, { errore: `Anno ${anno} non disponibile` });
      return;
    }
    inviaJson(res, 200, serializzaProspetto(componiProspetto(anno, euros(ral))));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

/** Avvia il server sul loopback. */
export function avvia(porta: number = Number(process.env.FISCAL_UI_PORT) || PORTA_DEFAULT): void {
  const server = createServer(gestisciRichiesta);
  server.listen(porta, '127.0.0.1', () => {
    console.log(`fiscal-toolkit UI su http://127.0.0.1:${porta}`);
    console.log('Premere Ctrl+C per fermare.');
  });
}
