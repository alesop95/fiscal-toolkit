#!/usr/bin/env node
/**
 * Entry di avvio della UI locale. Separato da server.ts affinche' il server sia importabile e
 * testabile senza aprire una porta. Si lancia con `npm run ui`.
 */

import { avvia } from './server.js';

avvia();
