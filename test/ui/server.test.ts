import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';
import { gestisciRichiesta } from '../../src/ui/server.js';

interface VoceJson {
  chiave: string;
  euro: number;
}
interface ProspettoJson {
  anno: number;
  voci: VoceJson[];
  errore?: string;
}

function fakeRes() {
  const stato = { code: 0 };
  let body = '';
  const res = {
    writeHead(code: number) {
      stato.code = code;
      return res;
    },
    end(chunk?: string) {
      body = chunk ?? '';
    },
  };
  return { res: res as unknown as ServerResponse, stato, corpo: () => body };
}

function req(url: string): IncomingMessage {
  return { url } as IncomingMessage;
}

describe('UI server handler', () => {
  it('serve la pagina HTML sulla root', () => {
    const { res, stato, corpo } = fakeRes();
    gestisciRichiesta(req('/'), res);
    expect(stato.code).toBe(200);
    expect(corpo()).toContain('<title>fiscal-toolkit');
  });

  it('/api/anni elenca gli anni disponibili', () => {
    const { res, corpo } = fakeRes();
    gestisciRichiesta(req('/api/anni'), res);
    const dati = JSON.parse(corpo()) as { anni: number[] };
    expect(dati.anni).toContain(2025);
  });

  it('/api/netto restituisce il prospetto serializzato', () => {
    const { res, stato, corpo } = fakeRes();
    gestisciRichiesta(req('/api/netto?ral=30000&anno=2025'), res);
    expect(stato.code).toBe(200);
    const dati = JSON.parse(corpo()) as ProspettoJson;
    expect(dati.anno).toBe(2025);
    const netto = dati.voci.find((v) => v.chiave === 'nettoAnnuo');
    expect(netto?.euro).toBeGreaterThan(0);
  });

  it('/api/netto con RAL non valida risponde 400', () => {
    const { res, stato, corpo } = fakeRes();
    gestisciRichiesta(req('/api/netto?ral=abc&anno=2025'), res);
    expect(stato.code).toBe(400);
    expect((JSON.parse(corpo()) as ProspettoJson).errore).toBeTruthy();
  });

  it('404 su percorso sconosciuto', () => {
    const { res, stato } = fakeRes();
    gestisciRichiesta(req('/ignoto'), res);
    expect(stato.code).toBe(404);
  });
});
