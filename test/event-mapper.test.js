'use strict';

const { mapGithubEvent } = require('../src/main/event-mapper');

describe('mapGithubEvent', () => {
  test('ping -> ignorato', () => {
    expect(mapGithubEvent('ping', { zen: 'x' })).toEqual({
      type: null,
      meta: { ignored: 'ping' },
    });
  });

  test('push -> type push con metadati', () => {
    const r = mapGithubEvent('push', {
      ref: 'refs/heads/main',
      pusher: { name: 'alice' },
      commits: [{ message: 'a' }, { message: 'b' }],
    });
    expect(r.type).toBe('push');
    expect(r.meta.branch).toBe('main');
    expect(r.meta.pusher).toBe('alice');
    expect(r.meta.commitCount).toBe(2);
    expect(r.meta.headMessage).toBe('b');
  });

  test('pull_request closed + merged -> merge', () => {
    const r = mapGithubEvent('pull_request', {
      action: 'closed',
      pull_request: { number: 7, title: 'PR', merged: true, base: { ref: 'main' } },
    });
    expect(r.type).toBe('merge');
    expect(r.meta.number).toBe(7);
  });

  test('pull_request closed senza merge -> ignorato', () => {
    const r = mapGithubEvent('pull_request', {
      action: 'closed',
      pull_request: { number: 7, merged: false },
    });
    expect(r.type).toBeNull();
  });

  test('evento sconosciuto -> ignorato', () => {
    expect(mapGithubEvent('issues', { action: 'opened' }).type).toBeNull();
  });

  test('input invalido -> null', () => {
    expect(mapGithubEvent(null, null)).toBeNull();
    expect(mapGithubEvent('push', null)).toBeNull();
  });
});
