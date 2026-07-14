'use strict';

/**
 * State machine pura per le animazioni della mascotte.
 * Stati: idle, commit_flap, push_fly, merge_celebrate.
 * Gli eventi temporanei tornano a 'idle' dopo la loro durata.
 */

const ANIMATIONS = {
  idle: { state: 'idle', duration: 0 },
  push: { state: 'push_fly', duration: 2200 },
  commit: { state: 'commit_flap', duration: 1400 },
  merge: { state: 'merge_celebrate', duration: 2600 },
};

/**
 * Data la mappa evento->animazione, restituisce lo stato di animazione
 * per un dato tipo di evento. Eventi sconosciuti -> idle.
 */
function resolveAnimation(eventType) {
  return ANIMATIONS[eventType] || ANIMATIONS.idle;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolveAnimation, ANIMATIONS };
}
