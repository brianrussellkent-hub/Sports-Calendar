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

export const SAMPLE_EVENTS = [
  {
    id: 'mlb:sample-mets-1',
    title: 'NY Mets vs NY Yankees',
    sport: 'mlb',
    start: '2026-04-03T17:10:00.000Z',
    end: '2026-04-03T20:10:00.000Z',
    location: 'Citi Field',
    source: 'sample-fallback',
    last_updated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'nfl:sample-giants-1',
    title: 'NY Giants vs Dallas Cowboys',
    sport: 'nfl',
    start: '2026-09-13T17:00:00.000Z',
    end: '2026-09-13T20:30:00.000Z',
    location: 'MetLife Stadium',
    source: 'sample-fallback',
    last_updated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'f1:sample-miami',
    title: 'Formula 1 Miami Grand Prix',
    sport: 'f1',
    start: '2026-05-03T20:00:00.000Z',
    end: '2026-05-03T22:00:00.000Z',
    location: 'Miami International Autodrome',
    source: 'sample-fallback',
    last_updated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'nascar:sample-daytona',
    title: 'NASCAR Daytona 500',
    sport: 'nascar',
    start: '2026-02-15T19:30:00.000Z',
    end: '2026-02-15T23:00:00.000Z',
    location: 'Daytona International Speedway',
    source: 'sample-fallback',
    last_updated: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cycling:sample-uci-1',
    title: 'UCI WorldTour - Tour Down Under Stage 1',
    sport: 'cycling',
    start: '2026-01-20T02:00:00.000Z',
    end: '2026-01-20T06:00:00.000Z',
    location: 'Adelaide',
    source: 'sample-fallback',
    last_updated: '2026-01-01T00:00:00.000Z'
  }
];
