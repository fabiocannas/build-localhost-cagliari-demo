'use strict';

/**
 * Simulatore di eventi GitHub per il demo offline.
 * Invia payload firmati (HMAC) al server webhook locale, così la mascotte
 * reagisce senza dipendere da GitHub.
 *
 * Uso: node scripts/simulate.js [commit|push|merge]   (default: ciclo completo)
 */

const crypto = require('crypto');
const http = require('http');
const config = require('../src/main/config');

const PAYLOADS = {
  push: {
    event: 'push',
    body: {
      ref: 'refs/heads/main',
      pusher: { name: 'demo-user' },
      commits: [{ message: 'feat: aggiunge la mascotte fenicottero' }],
    },
  },
  commit: {
    event: 'push',
    body: {
      ref: 'refs/heads/feature',
      pusher: { name: 'demo-user' },
      commits: [{ message: 'fix: piccolo aggiustamento' }],
    },
  },
  merge: {
    event: 'pull_request',
    body: {
      action: 'closed',
      pull_request: {
        number: 42,
        title: 'Aggiunge animazione mascotte',
        merged: true,
        base: { ref: 'main' },
      },
    },
  },
};

function send(kind) {
  const def = PAYLOADS[kind];
  if (!def) {
    console.error(`Tipo evento sconosciuto: ${kind}`);
    return Promise.reject(new Error('unknown'));
  }
  const raw = Buffer.from(JSON.stringify(def.body));
  const signature =
    'sha256=' +
    crypto.createHmac('sha256', config.webhookSecret).update(raw).digest('hex');

  const options = {
    host: 'localhost',
    port: config.port,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': def.event,
      'X-Hub-Signature-256': signature,
      'Content-Length': raw.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        console.log(`[${kind}] -> ${res.statusCode} ${data}`);
        resolve();
      });
    });
    req.on('error', reject);
    req.write(raw);
    req.end();
  });
}

async function main() {
  const arg = process.argv[2];
  if (arg) {
    await send(arg);
    return;
  }
  // ciclo dimostrativo
  for (const kind of ['commit', 'push', 'merge']) {
    // eslint-disable-next-line no-await-in-loop
    await send(kind);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 3000));
  }
}

main().catch((e) => {
  console.error('Simulazione fallita:', e.message);
  process.exit(1);
});
