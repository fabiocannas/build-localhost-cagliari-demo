'use strict';

const { resolveAnimation, ANIMATIONS } = require('../src/renderer/animation-states');

describe('resolveAnimation', () => {
  test('push -> push_fly', () => {
    expect(resolveAnimation('push').state).toBe('push_fly');
  });
  test('commit -> commit_flap', () => {
    expect(resolveAnimation('commit').state).toBe('commit_flap');
  });
  test('merge -> merge_celebrate', () => {
    expect(resolveAnimation('merge').state).toBe('merge_celebrate');
  });
  test('sconosciuto -> idle', () => {
    expect(resolveAnimation('boh').state).toBe('idle');
    expect(resolveAnimation(undefined).state).toBe('idle');
  });
  test('le durate degli eventi attivi sono positive', () => {
    expect(ANIMATIONS.push.duration).toBeGreaterThan(0);
    expect(ANIMATIONS.commit.duration).toBeGreaterThan(0);
    expect(ANIMATIONS.merge.duration).toBeGreaterThan(0);
  });
});
