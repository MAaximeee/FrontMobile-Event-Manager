export function parseEventDate(dueDate) {
  if (!dueDate) return null;
  const iso = dueDate.includes('T') ? dueDate : `${dueDate}T12:00:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function eventDayStart(dueDate) {
  const d = parseEventDate(dueDate);
  if (!d) return null;
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function startOfCalendarDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function filterEventsByCalendarDay(events, day) {
  const target = startOfCalendarDay(day).getTime();
  return [...(events || [])]
    .filter((ev) => {
      const eventDay = eventDayStart(ev.dueDate);
      return eventDay && eventDay.getTime() === target;
    })
    .sort(
      (a, b) =>
        (parseEventDate(a.dueDate)?.getTime() ?? 0) -
        (parseEventDate(b.dueDate)?.getTime() ?? 0),
    );
}

export function listUpcomingEventsAfterToday(events) {
  const today = startOfCalendarDay();
  return [...(events || [])]
    .filter((ev) => {
      const day = eventDayStart(ev.dueDate);
      return day && day.getTime() > today.getTime();
    })
    .sort(
      (a, b) =>
        (parseEventDate(a.dueDate)?.getTime() ?? 0) -
        (parseEventDate(b.dueDate)?.getTime() ?? 0),
    );
}

export function eventOrganizerName(event) {
  const creator = event?.creator;
  if (!creator) return null;
  const full = [creator.firstName, creator.lastName].filter(Boolean).join(' ').trim();
  return full || creator.username?.trim() || null;
}

export function buildCalendarDays(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  const days = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }

  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
    });
  }

  return days;
}

export const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
