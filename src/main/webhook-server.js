'use strict';

const crypto = require('crypto');
const { EventEmitter } = require('events');
const express = require('express');
const { mapGithubEvent } = require('./event-mapper');

/**
 * Verifica la firma HMAC sha256 inviata da GitHub nell'header X-Hub-Signature-256.
 * Usa un confronto a tempo costante. Ritorna false se firma o secret mancano.
 */
function verifySignature(secret, rawBody, signatureHeader) {
  if (!secret || !signatureHeader || !Buffer.isBuffer(rawBody)) {
    return false;
  }
  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/**
 * Crea il server webhook. Ritorna { app, emitter }.
 * Emette eventi 'mascot-event' con { type, meta } per eventi rilevanti.
 */
function createWebhookServer(options = {}) {
  const secret = options.secret || '';
  const emitter = options.emitter || new EventEmitter();
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.post('/webhook', (req, res) => {
    const signature = req.get('X-Hub-Signature-256');
    if (!verifySignature(secret, req.rawBody, signature)) {
      return res.status(401).json({ error: 'invalid signature' });
    }

    const eventName = req.get('X-GitHub-Event');
    const mapped = mapGithubEvent(eventName, req.body);

    if (mapped && mapped.type) {
      emitter.emit('mascot-event', mapped);
      return res.status(200).json({ received: mapped.type });
    }
    return res.status(200).json({ received: 'ignored' });
  });

  return { app, emitter, verifySignature };
}

module.exports = { createWebhookServer, verifySignature };
