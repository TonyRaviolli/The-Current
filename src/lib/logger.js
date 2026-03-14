/**
 * logger.js — Structured JSON logging for The UnderCurrent.
 *
 * All log entries go to stdout/stderr by default (compatible with systemd/pm2).
 * Set LOG_FILE=./data/logs/app.log to also append to a file.
 * A new file is opened on each log call; no persistent handle is kept,
 * so log rotation tools (logrotate, pm2-logrotate) can safely rename the file.
 */

import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const LOG_FILE = process.env.LOG_FILE || null;

// Ensure the log directory exists once at startup (best-effort)
if (LOG_FILE) {
  mkdir(path.dirname(LOG_FILE), { recursive: true }).catch(() => {});
}

export function log(level, message, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta
  };
  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }

  if (LOG_FILE) {
    appendFile(LOG_FILE, line + '\n').catch(() => {});
  }
}

export function info(message, meta) {
  log('info', message, meta);
}

export function warn(message, meta) {
  log('warn', message, meta);
}

export function error(message, meta) {
  log('error', message, meta);
}
