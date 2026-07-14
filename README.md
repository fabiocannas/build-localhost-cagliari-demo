# build-localhost-cagliari-demo

Live coding con GitHub Copilot CLI — **Build 2026: From CLI to PR**.

## 🦩 Mascotte Fenicottero Rosa (Azure Meetup Casteddu)

Una mascotte desktop **always-on-top** (il fenicottero rosa) che reagisce in tempo reale
agli eventi del ciclo di vita di GitHub:

| Evento GitHub | Reazione della mascotte |
| --- | --- |
| **commit / push** (`push`) | vola attraverso lo schermo / sbatte le ali |
| **merge** (`pull_request` chiusa con merge) | celebrazione con coriandoli e cuori |
| nessun evento | animazione idle (dondolio) |

### Stack
- **Electron** — finestra trasparente, frameless, always-on-top
- **Express** — server webhook locale con verifica firma **HMAC**
- Grafica **SVG/CSS** (nessun asset binario)

## Setup

```bash
npm install
cp .env.example .env   # poi imposta WEBHOOK_SECRET
```

### Avvio della mascotte
```bash
npm start
```

### Demo offline (senza GitHub)
Il simulatore invia eventi firmati al server locale:
```bash
npm start              # in un terminale
npm run simulate       # in un altro: cicla commit -> push -> merge
npm run simulate merge # un singolo evento
```

### Collegare i veri webhook GitHub
GitHub non raggiunge `localhost`, quindi serve un tunnel (es. [smee.io](https://smee.io)):

```bash
npx smee-client --url https://smee.io/IL_TUO_CANALE --target http://localhost:4000/webhook
```

Poi su GitHub: **Settings → Webhooks → Add webhook**
- Payload URL: l'URL smee
- Content type: `application/json`
- Secret: lo stesso valore di `WEBHOOK_SECRET`
- Eventi: *Pushes* e *Pull requests*

## Test

```bash
npm test
```

Copertura:
- **Unit** — verifica HMAC, normalizzazione eventi (`event-mapper`), state machine animazioni
- **Integration** — server Express in-process con payload GitHub di esempio

## Sicurezza
Gli eventi del pubblico sono **input non fidato**: ogni webhook richiede firma HMAC valida,
i secret non vengono committati (`.env` in `.gitignore`) e il testo mostrato nella UI è
sanitizzato per prevenire injection.

## Struttura
```
src/main/      main.js, webhook-server.js, event-mapper.js, preload.js, config.js
src/renderer/  index.html, styles.css, mascot.js, animation-states.js
scripts/       simulate.js
test/          *.test.js
```
