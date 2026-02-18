import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { toEastern } from './time';

dayjs.extend(isoWeek);

export const VIEWS = {
  month: 'month',
  week: 'week',
  day: 'day',
  agenda: 'agenda'
};

export function buildMonthGrid(anchorDate) {
  const start = anchorDate.startOf('month').startOf('week');
  const days = Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  const rows = [];

  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  return rows;
}

export function buildWeekDays(anchorDate) {
  const start = anchorDate.startOf('week');
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
}

export function toEventDate(event) {
  return toEastern(event.start);
}

export function sameDay(dayA, dayB) {
  return dayA.format('YYYY-MM-DD') === dayB.format('YYYY-MM-DD');
}

export function eventsOnDay(events, day) {
  return events
    .filter((event) => sameDay(toEventDate(event), day))
    .sort((a, b) => a.start.localeCompare(b.start));
}

export function shiftAnchor(anchorDate, view, direction) {
  const step = direction === 'next' ? 1 : -1;
  if (view === VIEWS.month) {
    return anchorDate.add(step, 'month');
  }
  return anchorDate.add(step, 'week');
}
