/**
 * verify-params: riconcilia i valori memorizzati in params/AAAA.ts con il testo di legge vigente
 * in E:\legal-consultant (legge.sqlite). Strumento di manutenzione, non di runtime.
 *
 * Per l'anno indicato (default: il piu' recente disponibile) recupera, per ogni blocco citato, il
 * testo dell'atto indicato nella fonte e verifica che i numeri memorizzati (aliquote, soglie,
 * importi) compaiano in quel testo. In coerenza con ADR-006, la fonte di uno scaglione e' la legge
 * modificatrice (es. L. 207/2024), non il solo testo consolidato dell'articolo base. I valori
 * amministrativi (INPS) non stanno nel corpus statale e restano da verificare a mano.
 *
 * Uso: npm run verify-params -- [anno]
 */

import { anniDisponibili, parametriAnno } from '../params/index.js';
import { type Norma, apriDb, leggiArticolo, percorsoDb } from '../src/normative/legge-it.js';

/** Estrae dall'urn il segmento "data;numero" usabile come pattern LIKE contro il corpus. */
function segmentoUrn(urn: string): string {
  const parti = urn.split(':');
  return parti[parti.length - 1] ?? urn;
}

/** Estrae il numero dell'articolo (es. "13", "3-ter") da una citazione come "art. 13 co. 1". */
function numeroArticolo(articolo: string): string {
  const m = articolo.match(/(\d+(?:-[a-z]+)?)/i);
  return m?.[1] ?? articolo;
}

/**
 * Formatta un importo in centesimi come intero all'italiana (es. 2_800_000 -> "28.000").
 * useGrouping true forza il punto delle migliaia anche sui numeri di quattro cifre (1.955),
 * come li scrive il testo di legge, che altrimenti non combacerebbero con la locale it-IT.
 */
function euroInt(centesimi: number): string {
  return (centesimi / 100).toLocaleString('it-IT', { useGrouping: true });
}

/** Formatta un importo in centesimi con due decimali all'italiana (516457 -> "5.164,57"). */
function euroDec(centesimi: number): string {
  return (centesimi / 100).toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}

function testoFonte(righe: Norma[]): string {
  return righe.map((r) => r.testo).join('\n');
}

const anno = Number(process.argv[2]) || anniDisponibili[anniDisponibili.length - 1] || 0;
const p = parametriAnno(anno);
if (!p) {
  console.error(
    `Nessun parametro per l'anno ${anno}. Anni disponibili: ${anniDisponibili.join(', ')}.`,
  );
  process.exit(1);
}

console.log(`verify-params - anno d'imposta ${anno}`);
console.log(`indice normativo: ${percorsoDb()}`);
console.log('');

const db = apriDb();
let problemi = 0;

function verifica(nome: string, fonteUrn: string, fonteArt: string, attesi: string[]): void {
  const righe = leggiArticolo(db, `%${segmentoUrn(fonteUrn)}%`, numeroArticolo(fonteArt));
  if (righe.length === 0) {
    problemi++;
    console.log(`CHECK ${nome}: fonte non trovata nel corpus (${fonteArt})`);
    return;
  }
  const testo = testoFonte(righe);
  const mancanti = attesi.filter((a) => !testo.includes(a));
  if (mancanti.length === 0) {
    console.log(`OK    ${nome}: ${attesi.join('  ')}`);
  } else {
    problemi++;
    console.log(`CHECK ${nome}: non trovati nel testo di legge -> ${mancanti.join('  ')}`);
  }
}

// IRPEF scaglioni: aliquote e soglie devono comparire nella legge modificatrice citata.
{
  const b = p.irpef.scaglioni;
  const attesi = b.valore.flatMap((s) => {
    const tokens = [`${Math.round(s.aliquota * 100)} per cento`];
    if (s.limiteSuperiore !== null) {
      tokens.push(euroInt(s.limiteSuperiore));
    }
    return tokens;
  });
  verifica('IRPEF scaglioni', b.fonte.urn, b.fonte.articolo, attesi);
}

// Detrazione: l'importo della fascia piena deve comparire nell'articolo citato.
{
  const b = p.detrazioni.lavoroDipendente;
  verifica('Detrazione fascia piena', b.fonte.urn, b.fonte.articolo, [
    euroInt(b.valore.importoFascia1),
  ]);
}

// Tetto previdenza complementare.
{
  const b = p.previdenzaComplementare.tettoDeducibilita;
  verifica('Tetto previdenza', b.fonte.urn, b.fonte.articolo, [euroDec(b.valore)]);
}

// INPS: valori amministrativi, non presenti come cifra nel corpus statale.
console.log(
  'NOTA  INPS: aliquota base e prima fascia sono valori amministrativi INPS (circolare annuale), da verificare a mano',
);

db.close();
console.log('');
console.log(
  problemi === 0 ? 'Riconciliazione OK.' : `Riconciliazione con ${problemi} punti da controllare.`,
);
process.exit(problemi === 0 ? 0 : 2);
