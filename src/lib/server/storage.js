import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_PATH = path.resolve('/tmp/sports-calendar-events-cache.json');
const CACHE_PATH = path.resolve('server/data/events-cache.json');

export async function readCache() {
  try {
    const content = await fs.readFile(CACHE_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return {
      lastRunAt: parsed.lastRunAt ?? null,
      events: Array.isArray(parsed.events) ? parsed.events : [],
      errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      usedSampleFallback: Boolean(parsed.usedSampleFallback)
    };
  } catch {
    return { lastRunAt: null, events: [], errors: [], usedSampleFallback: false };
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return { lastRunAt: null, events: [] };
  }
}

export async function writeCache(cache) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}
