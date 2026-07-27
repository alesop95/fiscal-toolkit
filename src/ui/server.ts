/**
 * Server della UI locale. Usa solo il modulo http integrato di Node: nessuna dipendenza esterna,
 * nessun accesso di rete in uscita, bind sul solo loopback 127.0.0.1. Serve la pagina statica e
 * quattro API di sola lettura: gli anni disponibili, il Prospetto serializzato di un anno, il
 * confronto fra gli anni e la curva del prelievo al variare della RAL. Sono gli stessi modelli che
 * la CLI stampa. La logica di calcolo resta nei moduli puri: qui c'e' solo trasporto HTTP e
 * validazione degli ingressi.
 *
 * L'handler gestisciRichiesta e' esportato e privo di effetti collaterali, cosi' e' testabile
 * senza aprire una porta; l'avvio vero e proprio vive in avvia() ed e' invocato da ui/main.ts.
 */

import { type IncomingMessage, type ServerResponse, createServer } from 'node:http';
import { anniDisponibili, parametriAnno } from '../../params/index.js';
import { type Money, euros, toEuros } from '../domain/money.js';
import { CURVA_DEFAULT, componiCurva, serializzaCurva } from '../report/curva.js';
import { componiProspetto, serializzaProspetto } from '../report/prospetto.js';
import { PAGINA_HTML } from './page.js';

/** Porta di default della UI locale, sovrascrivibile con FISCAL_UI_PORT. */
export const PORTA_DEFAULT = 4173;

/**
 * Tetto sulla RAL accettata dalle API. Non e' un vincolo fiscale, e' una guardia di ingresso: senza
 * un limite superiore una query malformata farebbe calcolare importi assurdi, e con la curva ne
 * farebbe calcolare molti. Dieci milioni di euro sono ben oltre qualsiasi caso d'uso reale.
 */
export const RAL_MASSIMA = 10_000_000;

function inviaJson(res: ServerResponse, stato: number, dati: unknown): void {
  res.writeHead(stato, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dati));
}

/**
 * Legge un importo in euro da un parametro di query. Restituisce null su assente, non numerico,
 * negativo o oltre il tetto: `Number('')` vale zero, quindi il controllo sulla stringa vuota deve
 * precedere la conversione, altrimenti un parametro mancante passerebbe come RAL zero.
 */
function leggiEuroQuery(valore: string | null): Money | null {
  if (valore === null || valore.trim() === '') {
    return null;
  }
  const numero = Number(valore);
  if (!Number.isFinite(numero) || numero < 0 || numero > RAL_MASSIMA) {
    return null;
  }
  return euros(numero);
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
    const ral = leggiEuroQuery(url.searchParams.get('ral'));
    const anno = Number(url.searchParams.get('anno'));
    if (ral === null) {
      inviaJson(res, 400, { errore: 'RAL non valida' });
      return;
    }
    if (!parametriAnno(anno)) {
      inviaJson(res, 400, { errore: `Anno ${anno} non disponibile` });
      return;
    }
    inviaJson(res, 200, serializzaProspetto(componiProspetto(anno, ral)));
    return;
  }

  if (url.pathname === '/api/confronta') {
    const ral = leggiEuroQuery(url.searchParams.get('ral'));
    if (ral === null) {
      inviaJson(res, 400, { errore: 'RAL non valida' });
      return;
    }
    const prospetti = anniDisponibili.map((a) => serializzaProspetto(componiProspetto(a, ral)));
    inviaJson(res, 200, { ral: toEuros(ral), prospetti });
    return;
  }

  if (url.pathname === '/api/curva') {
    const anno = Number(url.searchParams.get('anno'));
    if (!parametriAnno(anno)) {
      inviaJson(res, 400, { errore: `Anno ${anno} non disponibile` });
      return;
    }
    const opzioni = {
      da: leggiEuroQuery(url.searchParams.get('da')) ?? CURVA_DEFAULT.da,
      a: leggiEuroQuery(url.searchParams.get('a')) ?? CURVA_DEFAULT.a,
      passo: leggiEuroQuery(url.searchParams.get('passo')) ?? CURVA_DEFAULT.passo,
    };
    try {
      inviaJson(res, 200, serializzaCurva(componiCurva(anno, opzioni)));
    } catch (errore) {
      // componiCurva rifiuta intervalli e passi non sensati e i campionamenti troppo fitti.
      inviaJson(res, 400, {
        errore: errore instanceof Error ? errore.message : 'Curva non calcolabile',
      });
    }
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
