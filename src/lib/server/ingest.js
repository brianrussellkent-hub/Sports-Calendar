import axios from 'axios';
import ical from 'node-ical';
import { getConfig } from './config.js';
import { readCache, writeCache } from './storage.js';
import { SAMPLE_EVENTS } from './sources.js';

function toUtcIso(dateLike) {
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function loadFeed(url) {
  const response = await axios.get(url, { timeout: 15000 });
  return { raw: response.data, source: url };
}

function normalizeEvent({ rawEvent, categoryId, source, nowIso }) {
  if (!rawEvent.start || !rawEvent.summary) return null;

  const stableUid = rawEvent.uid ?? `${categoryId}-${rawEvent.summary}-${rawEvent.start.toISOString()}`;
  const normalized = {
    id: `${categoryId}:${stableUid}`,
    title: rawEvent.summary,
    sport: categoryId,
    start: toUtcIso(rawEvent.start),
    end: toUtcIso(rawEvent.end ?? rawEvent.start),
    location: rawEvent.location ?? '',
    source,
    last_updated: nowIso
  };

  if (!normalized.start || !normalized.end) return null;
  return normalized;
}

function withCurrentTimestamp(events, nowIso) {
  return events.map((event) => ({ ...event, last_updated: nowIso }));
}

export async function refreshEvents() {
  const config = await getConfig();
  const nowIso = new Date().toISOString();
  const mergedEvents = new Map();
  const errors = [];

  for (const category of config.categories) {
    for (const feed of category.feeds) {
      try {
        const { raw, source } = await loadFeed(feed.url);
        const parsed = ical.sync.parseICS(raw);

        for (const value of Object.values(parsed)) {
          if (value.type !== 'VEVENT') continue;
          const normalized = normalizeEvent({ rawEvent: value, categoryId: category.id, source, nowIso });
          if (!normalized) continue;
          mergedEvents.set(normalized.id, normalized);
        }
      } catch (error) {
        errors.push({
          sport: category.id,
          feed: feed.url,
          message: error.message
        });
      }
    }
  }

  if (!mergedEvents.size) {
    for (const sample of withCurrentTimestamp(SAMPLE_EVENTS, nowIso)) {
      mergedEvents.set(sample.id, sample);
    }
  }

  const nextCache = {
    lastRunAt: nowIso,
    events: [...mergedEvents.values()].sort((a, b) => a.start.localeCompare(b.start)),
    errors,
    usedSampleFallback: !errors.length ? false : mergedEvents.size === SAMPLE_EVENTS.length
  };

  await writeCache(nextCache);
  return nextCache;
}

export async function getEvents({ search = '', sports = [] } = {}) {
  let cache = await readCache();
  if (!cache.events.length) {
    cache = await refreshEvents();
  }

  const normalizedSearch = search.trim().toLowerCase();
  const events = cache.events.filter((event) => {
    const matchesSport = sports.length ? sports.includes(event.sport) : true;
    const matchesSearch = normalizedSearch
      ? `${event.title} ${event.location}`.toLowerCase().includes(normalizedSearch)
      : true;
    return matchesSport && matchesSearch;
  });

  return {
    events,
    warnings: cache.errors ?? [],
    usedSampleFallback: cache.usedSampleFallback ?? false,
    lastRunAt: cache.lastRunAt ?? null
  };
}
