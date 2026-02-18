import { refreshEvents } from '../ingest.js';

const result = await refreshEvents();
console.log(`Refreshed ${result.events.length} events at ${result.lastRunAt}`);
