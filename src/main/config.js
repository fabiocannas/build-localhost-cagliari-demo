'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function intEnv(name, fallback) {
  const raw = process.env[name];
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

const config = {
  port: intEnv('PORT', 4000),
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  smeeUrl: process.env.SMEE_URL || '',
  windowWidth: intEnv('WINDOW_WIDTH', 320),
  windowHeight: intEnv('WINDOW_HEIGHT', 320),
  clickThrough: process.env.CLICK_THROUGH === '1',
};

module.exports = config;
