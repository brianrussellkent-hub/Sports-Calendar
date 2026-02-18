'use client';

import { useEffect, useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import {
  VIEWS,
  buildMonthGrid,
  buildWeekDays,
  eventsOnDay,
  shiftAnchor,
  toEventDate
} from '../lib/calendar';
import { EASTERN_TZ, startOfEasternDay } from '../lib/time';

const VIEW_OPTIONS = [
  { id: VIEWS.month, label: 'Month' },
  { id: VIEWS.week, label: 'Week' },
  { id: VIEWS.day, label: 'Day' },
  { id: VIEWS.agenda, label: 'Agenda' }
];

export default function HomePage() {
  const [config, setConfig] = useState({ categories: [] });
  const [selectedSports, setSelectedSports] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(VIEWS.month);
  const [anchorDate, setAnchorDate] = useState(startOfEasternDay());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) throw new Error('Failed to load config.');
        const payload = await response.json();
        setConfig(payload);
        setSelectedSports(payload.categories.map((category) => category.id));
      } catch (loadError) {
        setError(loadError.message);
      }

  useEffect(() => {
    async function loadConfig() {
      const response = await fetch('/api/config');
      const payload = await response.json();
      setConfig(payload);
      setSelectedSports(payload.categories.map((category) => category.id));
    }

    loadConfig();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError('');
      setWarning('');

      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedSports.length && selectedSports.length !== config.categories.length) {
          params.set('sports', selectedSports.join(','));
        }

        const response = await fetch(`/api/events?${params.toString()}`, { signal: controller.signal });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load events.');
        }

        setEvents(payload.events || []);

        if (payload.usedSampleFallback) {
          setWarning('Live feeds are currently unavailable. Showing fallback sample events.');
        } else if (payload.warnings?.length) {
          setWarning('Some feeds failed to refresh. Showing available events.');
        }
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError('Unable to load live feeds right now. Showing fallback sample events when available.');
        }
      } finally {
        setLoading(false);
      }
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedSports.length && selectedSports.length !== config.categories.length) {
        params.set('sports', selectedSports.join(','));
      }
      const response = await fetch(`/api/events?${params.toString()}`, { signal: controller.signal });
      const payload = await response.json();
      setEvents(payload.events || []);
    }

    loadEvents();
    return () => controller.abort();
  }, [search, selectedSports, config.categories.length]);

  const decoratedEvents = useMemo(() => {
    const labels = Object.fromEntries(config.categories.map((category) => [category.id, category.label]));
    const labels = Object.fromEntries(config.categories.map((c) => [c.id, c.label]));
    return events
      .map((event) => ({ ...event, sportLabel: labels[event.sport] ?? event.sport, easternDate: toEventDate(event) }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [config.categories, events]);

  const visibleEvents = useMemo(() => {
    if (view === VIEWS.day) return eventsOnDay(decoratedEvents, anchorDate);
    if (view === VIEWS.week) {
      const start = anchorDate.startOf('week');
      const end = start.add(7, 'day');
      return decoratedEvents.filter((event) => !event.easternDate.isBefore(start) && event.easternDate.isBefore(end));
      return decoratedEvents.filter((e) => !e.easternDate.isBefore(start) && e.easternDate.isBefore(end));
    }
    return decoratedEvents;
  }, [anchorDate, decoratedEvents, view]);

  useEffect(() => {
    if (!decoratedEvents.length) {
      return;
    }

    const monthHasEvents = decoratedEvents.some(
      (event) =>
        event.easternDate.year() === anchorDate.year() && event.easternDate.month() === anchorDate.month()
    );

    if (!monthHasEvents) {
      const upcoming = decoratedEvents.find((event) => event.easternDate.isAfter(startOfEasternDay().subtract(1, 'day')));
      const fallback = upcoming ?? decoratedEvents[0];
      setAnchorDate(fallback.easternDate.startOf('day'));
    }
  }, [anchorDate, decoratedEvents]);

  function toggleSport(sportId) {
    setSelectedSports((current) =>
      current.includes(sportId) ? current.filter((item) => item !== sportId) : [...current, sportId]
    );
  }

  return (
    <main className="layout">
      <header className="topbar">
        <h1>Personalized Sports Calendar</h1>
        <p>All times displayed in {EASTERN_TZ} with automatic EST/EDT transitions.</p>
      </header>

      {loading && <div className="banner info">Loading events…</div>}
      {warning && <div className="banner warning">{warning}</div>}
      {error && <div className="banner error">{error}</div>}
      {!loading && !decoratedEvents.length && (
        <div className="banner warning">No events were returned. Check /api/events and Vercel function logs.</div>
      )}

      <section className="controls">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by team or race name"
          className="search-input"
        />
        <FilterBar categories={config.categories} selected={selectedSports} onToggle={toggleSport} />
      </section>

      <section className="calendar-shell">
        <div className="calendar-toolbar">
          <div className="nav-row">
            <button type="button" onClick={() => setAnchorDate(shiftAnchor(anchorDate, view, 'prev'))}>Prev</button>
            <button type="button" onClick={() => setAnchorDate(startOfEasternDay())}>Today</button>
            <button type="button" onClick={() => setAnchorDate(shiftAnchor(anchorDate, view, 'next'))}>Next</button>
            <strong>{anchorDate.format(view === VIEWS.month ? 'MMMM YYYY' : 'MMM D, YYYY')}</strong>
          </div>
          <div className="view-switch">
            {VIEW_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.id}
                className={view === option.id ? 'active' : ''}
                onClick={() => setView(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {view === VIEWS.month && (
          <div className="month-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <div className="day-header" key={label}>{label}</div>
            ))}
            {buildMonthGrid(anchorDate).flat().map((day) => {
              const dayEvents = eventsOnDay(decoratedEvents, day).slice(0, 3);
              const isOutside = day.month() !== anchorDate.month();
              return (
                <div className={`day-cell ${isOutside ? 'outside' : ''}`} key={day.format('YYYY-MM-DD')}>
                  <div className="day-label">{day.format('D')}</div>
                  <div className="day-events">
                    {dayEvents.map((event) => <EventCard key={event.id} event={event} compact />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === VIEWS.week && (
          <div className="week-grid">
            {buildWeekDays(anchorDate).map((day) => {
              const dayEvents = eventsOnDay(visibleEvents, day);
              return (
                <section className="week-column" key={day.format('YYYY-MM-DD')}>
                  <h3>{day.format('ddd, MMM D')}</h3>
                  <div className="stack">
                    {dayEvents.map((event) => <EventCard key={event.id} event={event} />)}
                    {!dayEvents.length && <p className="muted">No events</p>}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {view === VIEWS.day && (
          <section>
            <h3>{anchorDate.format('dddd, MMMM D')}</h3>
            <div className="stack">
              {visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}
              {!visibleEvents.length && <p className="muted">No events on this day.</p>}
            </div>
          </section>
        )}

        {view === VIEWS.agenda && (
          <div className="stack">
            {decoratedEvents.map((event) => <EventCard key={event.id} event={event} />)}
            {!decoratedEvents.length && <p className="muted">No events match current filters.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
