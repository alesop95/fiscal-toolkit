#!/usr/bin/env node
/**
 * CLI sottile. In Fase 0 e' solo uno stub che verifica il wiring fra bin, build e dominio.
 * I comandi reali (netto, ingest, fotografia) arrivano nelle fasi successive, come adattatori
 * sottili sopra i moduli puri di src/.
 */

import { euros, format } from './domain/money.js';

const comando = process.argv[2];

if (comando === '--version' || comando === '-v') {
  console.log('fiscal-toolkit 0.0.0 (Fase 0 - scaffolding)');
} else {
  console.log('fiscal-toolkit - scaffolding attivo.');
  console.log(`Esempio di importo formattato: ${format(euros(1234.56))}`);
  console.log('Comandi (netto, ingest, fotografia) in arrivo nelle fasi successive.');
}
