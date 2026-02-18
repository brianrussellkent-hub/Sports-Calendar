import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import ical from 'node-ical';
import config from './config/sources.json' with { type: 'json' };
import { readCache, writeCache } from './storage.js';

function toUtcIso(dateLike) {
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function loadFeed(url, fallbackPath) {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    return { raw: response.data, source: url };
  } catch {
    if (!fallbackPath) {
      throw new Error(`Unable to load feed ${url} and no fallback is configured.`);
    }
    const fallbackContent = await fs.readFile(path.resolve(fallbackPath), 'utf8');
    return { raw: fallbackContent, source: `${url} (fallback)` };
  }
}

function normalizeEvent({ rawEvent, categoryId, source, nowIso }) {
  if (!rawEvent.start || !rawEvent.summary) {
    return null;
  }

  const stableUid = rawEvent.uid ?? `${categoryId}-${rawEvent.summary}-${rawEvent.start.toISOString()}`;
  const id = `${categoryId}:${stableUid}`;

  const normalized = {
    id,
    title: rawEvent.summary,
    sport: categoryId,
    start: toUtcIso(rawEvent.start),
    end: toUtcIso(rawEvent.end ?? rawEvent.start),
    location: rawEvent.location ?? '',
    source,
    last_updated: nowIso
  };

  if (!normalized.start || !normalized.end) {
    return null;
  }

  return normalized;
}

export async function refreshEvents() {
  const nowIso = new Date().toISOString();
  const mergedEvents = new Map();

  for (const category of config.categories) {
    for (const feed of category.feeds) {
      const { raw, source } = await loadFeed(feed.url, feed.fallback);
      const parsed = ical.sync.parseICS(raw);

      for (const value of Object.values(parsed)) {
        if (value.type !== 'VEVENT') {
          continue;
        }

        const normalized = normalizeEvent({
          rawEvent: value,
          categoryId: category.id,
          source,
          nowIso
        });

        if (!normalized) {
          continue;
        }

        const existing = mergedEvents.get(normalized.id);
        if (!existing || existing.start !== normalized.start || existing.end !== normalized.end) {
          mergedEvents.set(normalized.id, normalized);
        }
      }
    }
  }

  const sorted = [...mergedEvents.values()].sort((a, b) => a.start.localeCompare(b.start));

  const nextCache = {
    lastRunAt: nowIso,
    events: sorted
  };

  await writeCache(nextCache);
  return nextCache;
}

export async function getEvents({ search = '', sports = [] } = {}) {
  let { events } = await readCache();

  if (!events.length) {
    const refreshed = await refreshEvents();
    events = refreshed.events;
  }

  const normalizedSearch = search.trim().toLowerCase();

  return events.filter((event) => {
    const matchesSport = sports.length ? sports.includes(event.sport) : true;
    const matchesSearch = normalizedSearch
      ? `${event.title} ${event.location}`.toLowerCase().includes(normalizedSearch)
      : true;

    return matchesSport && matchesSearch;
  });
}

export function getConfig() {
  return config;
}
