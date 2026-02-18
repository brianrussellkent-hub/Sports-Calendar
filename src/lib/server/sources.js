const DAY_MS = 24 * 60 * 60 * 1000;

function atUtcHour(baseDate, addDays, hour, durationHours) {
  const start = new Date(baseDate.getTime() + addDays * DAY_MS);
  start.setUTCHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return [start.toISOString(), end.toISOString()];
}

export const SOURCES_CONFIG = {
  timezone: 'America/New_York',
  categories: [
    {
      id: 'mlb',
      label: 'MLB',
      teams: ['NY Mets'],
      feeds: [
        { name: 'Mets Primary Feed', url: 'https://www.stanza.co/api/schedules/mlb-mets/mlb-mets.ics' }
      ]
    },
    {
      id: 'nfl',
      label: 'NFL',
      teams: ['NY Giants'],
      feeds: [
        { name: 'Giants Primary Feed', url: 'https://www.stanza.co/api/schedules/nfl-giants/nfl-giants.ics' }
      ]
    },
    {
      id: 'f1',
      label: 'Formula 1',
      feeds: [
        { name: 'Formula 1 Calendar', url: 'https://files-f1.motorsportcalendars.com/Formula_1_2025.ics' }
      ]
    },
    {
      id: 'nascar',
      label: 'NASCAR',
      feeds: [
        { name: 'NASCAR Cup Calendar', url: 'https://racedayschedule.com/feeds/nascar-cup-series.ics' }
      ]
    },
    {
      id: 'cycling',
      label: 'Cycling',
      feeds: [
        { name: 'UCI WorldTour Calendar', url: 'https://calendar.google.com/calendar/ical/2h2f90gq9q7jig0g4l8nqk7m2k%40group.calendar.google.com/public/basic.ics' }
      ]
    }
  ]
};

export function getSampleEvents(nowIso = new Date().toISOString()) {
  const now = new Date(nowIso);
  const lastUpdated = new Date().toISOString();

  const [mlbStart, mlbEnd] = atUtcHour(now, 3, 23, 3);
  const [nflStart, nflEnd] = atUtcHour(now, 7, 18, 3.5);
  const [f1Start, f1End] = atUtcHour(now, 14, 19, 2);
  const [nascarStart, nascarEnd] = atUtcHour(now, 10, 20, 3.5);
  const [cyclingStart, cyclingEnd] = atUtcHour(now, 1, 12, 4);

  return [
    {
      id: 'mlb:sample-mets-rolling',
      title: 'NY Mets vs NY Yankees',
      sport: 'mlb',
      start: mlbStart,
      end: mlbEnd,
      location: 'Citi Field',
      source: 'sample-fallback',
      last_updated: lastUpdated
    },
    {
      id: 'nfl:sample-giants-rolling',
      title: 'NY Giants vs Dallas Cowboys',
      sport: 'nfl',
      start: nflStart,
      end: nflEnd,
      location: 'MetLife Stadium',
      source: 'sample-fallback',
      last_updated: lastUpdated
    },
    {
      id: 'f1:sample-rolling',
      title: 'Formula 1 Grand Prix (Sample)',
      sport: 'f1',
      start: f1Start,
      end: f1End,
      location: 'Sample Circuit',
      source: 'sample-fallback',
      last_updated: lastUpdated
    },
    {
      id: 'nascar:sample-rolling',
      title: 'NASCAR Cup Race (Sample)',
      sport: 'nascar',
      start: nascarStart,
      end: nascarEnd,
      location: 'Sample Speedway',
      source: 'sample-fallback',
      last_updated: lastUpdated
    },
    {
      id: 'cycling:sample-rolling',
      title: 'UCI WorldTour Stage (Sample)',
      sport: 'cycling',
      start: cyclingStart,
      end: cyclingEnd,
      location: 'Sample Route',
      source: 'sample-fallback',
      last_updated: lastUpdated
    }
  ];
}
