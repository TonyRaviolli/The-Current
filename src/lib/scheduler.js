import { readFile } from 'node:fs/promises';
import { refreshOnce } from '../refresh.js';
import { info, error } from './logger.js';

function parseTimes(times = []) {
  return times
    .map((time) => {
      const [h, m] = time.split(':').map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return { h, m };
    })
    .filter(Boolean);
}

function msUntilNext(times) {
  const now = new Date();
  const today = new Date(now);
  const parsed = parseTimes(times);
  const candidates = parsed.map(({ h, m }) => {
    const dt = new Date(today);
    dt.setHours(h, m, 0, 0);
    if (dt <= now) dt.setDate(dt.getDate() + 1);
    return dt;
  });
  const next = candidates.sort((a, b) => a - b)[0];
  return next ? next.getTime() - now.getTime() : 6 * 3600000;
}

export async function scheduleRefreshLoop({ once = false, logPrefix = 'refresh' } = {}) {
  const config = JSON.parse(await readFile(new URL('../../config/refresh.json', import.meta.url)));
  if (process.env.REFRESH_DISABLE_SCHEDULE === 'true') {
    info('schedule_disabled', { logPrefix });
    if (once) await refreshOnce();
    return;
  }

  if (once) {
    await refreshOnce();
    return;
  }

  const loop = async () => {
    const waitMs = msUntilNext(config.schedule);
    info('schedule_wait', { logPrefix, waitMs });
    setTimeout(async () => {
      try {
        await refreshOnce();
      } catch (err) {
        error('scheduled_refresh_failed', { message: err.message });
      }
      loop();
    }, waitMs);
  };

  loop();
}
