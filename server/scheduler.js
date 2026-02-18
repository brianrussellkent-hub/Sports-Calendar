import cron from 'node-cron';
import { refreshEvents } from './ingest.js';

export function startScheduler() {
  cron.schedule('0 4 * * *', async () => {
    try {
      await refreshEvents();
      console.log('[scheduler] Daily refresh complete.');
    } catch (error) {
      console.error('[scheduler] Daily refresh failed:', error.message);
    }
  });
}
