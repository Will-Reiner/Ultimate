import { CalendarEventInput } from '../inputs/CalendarInput';
import { CalendarDensity, DayDensity } from '../value-objects/CalendarDensity';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysInMonth(month: number, year: number): number {
  // month is 1-based
  return new Date(year, month, 0).getDate();
}

export class CalendarDashboardService {
  static aggregateEvents(
    events: CalendarEventInput[],
  ): CalendarEventInput[] {
    return [...events].sort(
      (a, b) => a.startAt.getTime() - b.startAt.getTime(),
    );
  }

  static computeMonthlyDensity(
    events: CalendarEventInput[],
    month: number,
    year: number,
  ): CalendarDensity {
    const totalDays = daysInMonth(month, year);

    const countMap = new Map<string, number>();
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      countMap.set(dateStr, 0);
    }

    for (const event of events) {
      const dateStr = toDateString(event.startAt);
      if (countMap.has(dateStr)) {
        countMap.set(dateStr, countMap.get(dateStr)! + 1);
      }
    }

    const days: DayDensity[] = Array.from(countMap.entries()).map(
      ([date, eventCount]) => ({
        date,
        eventCount,
        isHighDensity: eventCount > 5,
      }),
    );

    return CalendarDensity.create(days);
  }

  static getEventsForDay(
    events: CalendarEventInput[],
    date: Date,
  ): CalendarEventInput[] {
    const targetStr = toDateString(date);
    return events.filter((e) => toDateString(e.startAt) === targetStr);
  }
}
