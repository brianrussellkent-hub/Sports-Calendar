'use client';

import { formatEasternTime } from '../lib/time';

export default function EventCard({ event, compact = false }) {
  return (
    <article className={`event-card ${compact ? 'compact' : ''}`}>
      <div className="event-title">{event.title}</div>
      <div className="event-meta">{formatEasternTime(event.start, 'h:mm A z')}</div>
      <div className="event-sport">{event.sportLabel}</div>
    </article>
  );
}
