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
  return Array.from({ length: 6 }, (_, row) => days.slice(row * 7, row * 7 + 7));
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
  if (view === VIEWS.month) return anchorDate.add(step, 'month');
  if (view === VIEWS.day) return anchorDate.add(step, 'day');
  return anchorDate.add(step, 'week');
}
