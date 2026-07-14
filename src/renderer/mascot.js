'use strict';

/* global mascotAPI, resolveAnimation */

const mascot = document.getElementById('mascot');
const label = document.getElementById('label');
const fx = document.getElementById('fx');

let resetTimer = null;

function escapeText(text) {
  // Sanitizza il testo proveniente dai payload (input non fidato) prima del render.
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showLabel(text) {
  if (!text) {
    label.classList.remove('show');
    return;
  }
  label.textContent = escapeText(text); // textContent è già sicuro
  label.classList.add('show');
}

function spawnConfetti() {
  const symbols = ['💖', '🎉', '💗', '✨', '🩷'];
  for (let i = 0; i < 14; i += 1) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = symbols[i % symbols.length];
    c.style.left = `${Math.random() * 100}%`;
    c.style.animationDelay = `${Math.random() * 0.4}s`;
    fx.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }
}

function spawnMissileTrail() {
  const trail = document.createElement('div');
  trail.className = 'missile-trail';
  trail.textContent = '💨🔥🔥';
  fx.appendChild(trail);
  setTimeout(() => trail.remove(), 2300);
}

function spawnExplosion() {
  const boom = document.createElement('div');
  boom.className = 'boom';
  boom.textContent = '💥';
  fx.appendChild(boom);
  setTimeout(() => boom.remove(), 800);

  const parts = ['🔥', '💥', '✨', '🩷'];
  for (let i = 0; i < 10; i += 1) {
    const p = document.createElement('span');
    p.className = 'confetti';
    p.textContent = parts[i % parts.length];
    p.style.left = `${4 + Math.random() * 22}%`;
    p.style.animationDelay = `${Math.random() * 0.2}s`;
    fx.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}

function setAnimation(eventType, meta) {
  const anim = resolveAnimation(eventType);
  mascot.classList.remove('idle', 'commit_flap', 'push_fly', 'merge_celebrate');
  // forza reflow per riavviare l'animazione CSS
  void mascot.offsetWidth;
  mascot.classList.add(anim.state);

  if (anim.state === 'merge_celebrate') {
    spawnConfetti();
  }

  const labels = {
    push_fly: meta && meta.branch ? `push → ${meta.branch}` : 'push!',
    commit_flap: 'commit!',
    merge_celebrate:
      meta && meta.number ? `merge PR #${meta.number}` : 'merge!',
  };
  showLabel(labels[anim.state] || '');

  if (resetTimer) clearTimeout(resetTimer);
  if (anim.duration > 0) {
    resetTimer = setTimeout(() => {
      mascot.classList.remove(
        'commit_flap',
        'push_fly',
        'merge_celebrate'
      );
      mascot.classList.add('idle');
      showLabel('');
    }, anim.duration);
  }
}

if (window.mascotAPI) {
  window.mascotAPI.onEvent((evt) => {
    if (evt && evt.type) {
      setAnimation(evt.type, evt.meta);
    }
  });
}
