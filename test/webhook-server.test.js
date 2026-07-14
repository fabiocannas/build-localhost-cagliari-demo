'use strict';

const crypto = require('crypto');
const request = require('supertest');
const { createWebhookServer, verifySignature } = require('../src/main/webhook-server');

const SECRET = 'test-secret';

function sign(body) {
  const raw = Buffer.from(JSON.stringify(body));
  return (
    'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex')
  );
}

describe('verifySignature', () => {
  test('firma valida -> true', () => {
    const raw = Buffer.from('{"a":1}');
    const sig =
      'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
    expect(verifySignature(SECRET, raw, sig)).toBe(true);
  });
  test('firma assente -> false', () => {
    expect(verifySignature(SECRET, Buffer.from('{}'), undefined)).toBe(false);
  });
  test('secret assente -> false', () => {
    expect(verifySignature('', Buffer.from('{}'), 'sha256=x')).toBe(false);
  });
});

describe('POST /webhook', () => {
  let app;
  let emitter;

  beforeEach(() => {
    const srv = createWebhookServer({ secret: SECRET });
    app = srv.app;
    emitter = srv.emitter;
  });

  test('firma invalida -> 401', async () => {
    await request(app)
      .post('/webhook')
      .set('X-GitHub-Event', 'push')
      .set('X-Hub-Signature-256', 'sha256=deadbeef')
      .send({ ref: 'refs/heads/main' })
      .expect(401);
  });

  test('push valido -> 200 ed emette mascot-event', async () => {
    const body = {
      ref: 'refs/heads/main',
      pusher: { name: 'bob' },
      commits: [{ message: 'x' }],
    };
    const received = new Promise((resolve) =>
      emitter.once('mascot-event', resolve)
    );
    await request(app)
      .post('/webhook')
      .set('X-GitHub-Event', 'push')
      .set('X-Hub-Signature-256', sign(body))
      .send(body)
      .expect(200);
    const evt = await received;
    expect(evt.type).toBe('push');
  });

  test('merge valido -> emette merge', async () => {
    const body = {
      action: 'closed',
      pull_request: { number: 1, merged: true, base: { ref: 'main' } },
    };
    const received = new Promise((resolve) =>
      emitter.once('mascot-event', resolve)
    );
    await request(app)
      .post('/webhook')
      .set('X-GitHub-Event', 'pull_request')
      .set('X-Hub-Signature-256', sign(body))
      .send(body)
      .expect(200);
    const evt = await received;
    expect(evt.type).toBe('merge');
  });

  test('ping firmato -> 200 ignorato', async () => {
    const body = { zen: 'Keep it simple' };
    await request(app)
      .post('/webhook')
      .set('X-GitHub-Event', 'ping')
      .set('X-Hub-Signature-256', sign(body))
      .send(body)
      .expect(200, { received: 'ignored' });
  });
});
