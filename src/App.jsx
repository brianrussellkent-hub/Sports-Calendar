import React, { useEffect, useMemo, useState } from 'react';
import EventCard from './components/EventCard';
import FilterBar from './components/FilterBar';
import {
  VIEWS,
  buildMonthGrid,
  buildWeekDays,
  eventsOnDay,
  shiftAnchor,
  toEventDate
} from './lib/calendar';
import { EASTERN_TZ, startOfEasternDay } from './lib/time';

const VIEW_OPTIONS = [
  { id: VIEWS.month, label: 'Month' },
  { id: VIEWS.week, label: 'Week' },
  { id: VIEWS.day, label: 'Day' },
  { id: VIEWS.agenda, label: 'Agenda' }
];

export default function App() {
  const [config, setConfig] = useState({ categories: [] });
  const [selectedSports, setSelectedSports] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(VIEWS.month);
  const [anchorDate, setAnchorDate] = useState(startOfEasternDay());

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
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }
      if (selectedSports.length && selectedSports.length !== config.categories.length) {
        params.set('sports', selectedSports.join(','));
      }

      const response = await fetch(`/api/events?${params.toString()}`, { signal: controller.signal });
      const payload = await response.json();
      setEvents(payload.events);
    }

    loadEvents();
    return () => controller.abort();
  }, [search, selectedSports, config.categories.length]);

  const decoratedEvents = useMemo(() => {
    const sportLabelById = Object.fromEntries(
      config.categories.map((category) => [category.id, category.label])
    );

    return events
      .map((event) => ({
        ...event,
        sportLabel: sportLabelById[event.sport] ?? event.sport,
        easternDate: toEventDate(event)
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [config.categories, events]);

  const visibleEvents = useMemo(() => {
    if (view === VIEWS.day) {
      return eventsOnDay(decoratedEvents, anchorDate);
    }

    if (view === VIEWS.week) {
      const start = anchorDate.startOf('week');
      const end = start.add(7, 'day');
      return decoratedEvents.filter(
        (event) => !event.easternDate.isBefore(start) && event.easternDate.isBefore(end)
      );
    }

    return decoratedEvents;
  }, [anchorDate, decoratedEvents, view]);

  function toggleSport(sportId) {
    setSelectedSports((current) =>
      current.includes(sportId)
        ? current.filter((item) => item !== sportId)
        : [...current, sportId]
    );
  }

  function renderMonthView() {
    const monthRows = buildMonthGrid(anchorDate);

    return (
      <div className="month-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div className="day-header" key={label}>{label}</div>
        ))}
        {monthRows.flat().map((day) => {
          const dayEvents = eventsOnDay(decoratedEvents, day).slice(0, 3);
          const isOutside = day.month() !== anchorDate.month();

          return (
            <div className={`day-cell ${isOutside ? 'outside' : ''}`} key={day.format('YYYY-MM-DD')}>
              <div className="day-label">{day.format('D')}</div>
              <div className="day-events">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderWeekView() {
    const weekDays = buildWeekDays(anchorDate);

    return (
      <div className="week-grid">
        {weekDays.map((day) => (
          <section className="week-column" key={day.format('YYYY-MM-DD')}>
            <h3>{day.format('ddd, MMM D')}</h3>
            <div className="stack">
              {eventsOnDay(visibleEvents, day).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {!eventsOnDay(visibleEvents, day).length && <p className="muted">No events</p>}
            </div>
          </section>
        ))}
      </div>
    );
  }

  function renderDayView() {
    return (
      <section>
        <h3>{anchorDate.format('dddd, MMMM D')}</h3>
        <div className="stack">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {!visibleEvents.length && <p className="muted">No events on this day.</p>}
        </div>
      </section>
    );
  }

  function renderAgendaView() {
    return (
      <div className="stack">
        {decoratedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {!decoratedEvents.length && <p className="muted">No events match current filters.</p>}
      </div>
    );
  }

  return (
    <main className="layout">
      <header className="topbar">
        <h1>Personalized Sports Calendar</h1>
        <p>All times displayed in {EASTERN_TZ} with automatic EST/EDT transitions.</p>
      </header>

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

        {view === VIEWS.month && renderMonthView()}
        {view === VIEWS.week && renderWeekView()}
        {view === VIEWS.day && renderDayView()}
        {view === VIEWS.agenda && renderAgendaView()}
      </section>
    </main>
  );
}
