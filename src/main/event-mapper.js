'use strict';

/**
 * Normalizza i payload dei webhook GitHub in un evento interno della mascotte.
 *
 * Output: { type, meta } dove type è uno tra:
 *   - 'push'   : uno o più commit pushati su un branch
 *   - 'merge'  : una pull request è stata chiusa con merge
 *   - null     : evento ignorato (es. ping, close senza merge, eventi non gestiti)
 *
 * NB: l'input è considerato NON FIDATO. Qui non eseguiamo nulla dal payload;
 * estraiamo solo campi scalari e li usiamo come metadati.
 */
function mapGithubEvent(eventName, payload) {
  if (!eventName || typeof payload !== 'object' || payload === null) {
    return null;
  }

  if (eventName === 'ping') {
    return { type: null, meta: { ignored: 'ping' } };
  }

  if (eventName === 'push') {
    const commits = Array.isArray(payload.commits) ? payload.commits : [];
    const ref = typeof payload.ref === 'string' ? payload.ref : '';
    const branch = ref.replace(/^refs\/heads\//, '');
    const pusher =
      payload.pusher && typeof payload.pusher.name === 'string'
        ? payload.pusher.name
        : '';
    return {
      type: 'push',
      meta: {
        branch,
        pusher,
        commitCount: commits.length,
        headMessage:
          commits.length > 0 &&
          typeof commits[commits.length - 1].message === 'string'
            ? commits[commits.length - 1].message
            : '',
      },
    };
  }

  if (eventName === 'pull_request') {
    const action = payload.action;
    const pr = payload.pull_request || {};
    const merged = pr.merged === true;
    if (action === 'closed' && merged) {
      return {
        type: 'merge',
        meta: {
          number: typeof pr.number === 'number' ? pr.number : null,
          title: typeof pr.title === 'string' ? pr.title : '',
          base: pr.base && typeof pr.base.ref === 'string' ? pr.base.ref : '',
        },
      };
    }
    return { type: null, meta: { ignored: `pull_request:${action}` } };
  }

  return { type: null, meta: { ignored: eventName } };
}

module.exports = { mapGithubEvent };
