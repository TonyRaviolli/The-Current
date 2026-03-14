import { scheduleRefreshLoop } from '../src/lib/scheduler.js';

scheduleRefreshLoop({
  once: false,
  logPrefix: 'scheduler'
});
