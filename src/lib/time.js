import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const EASTERN_TZ = 'America/New_York';

export function toEastern(utcIso) {
  return dayjs.utc(utcIso).tz(EASTERN_TZ);
}

export function formatEasternTime(utcIso, format = 'MMM D, h:mm A z') {
  return toEastern(utcIso).format(format);
}

export function startOfEasternDay() {
  return dayjs().tz(EASTERN_TZ).startOf('day');
}
