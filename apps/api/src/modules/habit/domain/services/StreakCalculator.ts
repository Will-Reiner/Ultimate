import { HabitEntry } from '../entities/HabitEntry';
import { Frequency } from '../value-objects/Frequency';

export interface StreakInput {
  entries: HabitEntry[];
  frequency: Frequency;
  habitType: 'build' | 'quit';
  dailyTarget: number | null;
  habitCreatedAt: Date;
  status: 'active' | 'paused' | 'archived';
  referenceDate: Date;
  pausedAt?: Date;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  creditDays: number;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function calculateStreak(input: StreakInput): StreakResult {
  const { entries, frequency, habitType, dailyTarget, habitCreatedAt, status, referenceDate, pausedAt } = input;

  if (habitType === 'quit') {
    return calculateQuitStreak(entries, habitCreatedAt, status, referenceDate, pausedAt);
  }

  return calculateBuildStreak(entries, frequency, dailyTarget, habitCreatedAt, status, referenceDate, pausedAt);
}

function calculateQuitStreak(
  entries: HabitEntry[],
  habitCreatedAt: Date,
  status: string,
  referenceDate: Date,
  pausedAt?: Date,
): StreakResult {
  const relapses = entries
    .filter(e => e.entryType === 'relapse')
    .map(e => e.date)
    .sort();

  const uniqueRelapseDates = [...new Set(relapses)].sort();

  const endDate = status === 'paused' && pausedAt ? pausedAt : referenceDate;
  const endStr = toDateStr(endDate);
  const startStr = toDateStr(habitCreatedAt);

  // Current streak: days from last relapse (exclusive) to endDate (inclusive)
  const lastRelapse = uniqueRelapseDates.length > 0 ? uniqueRelapseDates[uniqueRelapseDates.length - 1] : null;
  
  let currentStreak: number;
  if (lastRelapse && lastRelapse >= endStr) {
    currentStreak = 0;
  } else if (lastRelapse) {
    currentStreak = daysBetween(lastRelapse, endStr);
  } else {
    currentStreak = daysBetween(startStr, endStr) + 1;
  }

  // Longest streak
  let longestStreak = currentStreak;
  const allBoundaries = [startStr, ...uniqueRelapseDates, endStr];
  
  for (let i = 0; i < uniqueRelapseDates.length; i++) {
    const periodStart = i === 0 ? startStr : uniqueRelapseDates[i - 1];
    const periodEnd = uniqueRelapseDates[i];
    const streak = i === 0
      ? daysBetween(periodStart, periodEnd)  // from creation to first relapse (exclusive of relapse day)
      : daysBetween(periodStart, periodEnd) - 1; // between relapses (exclusive of both)
    if (streak > longestStreak) longestStreak = streak;
  }

  return { currentStreak, longestStreak, creditDays: 0 };
}

function daysBetween(dateStrA: string, dateStrB: string): number {
  const a = new Date(dateStrA + 'T00:00:00');
  const b = new Date(dateStrB + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateBuildStreak(
  entries: HabitEntry[],
  frequency: Frequency,
  dailyTarget: number | null,
  habitCreatedAt: Date,
  status: string,
  referenceDate: Date,
  pausedAt?: Date,
): StreakResult {
  // Build a set of completed dates
  const completedDates = new Set<string>();
  const allEntryDates = new Set<string>();

  const checkInsByDate = new Map<string, number>();
  for (const entry of entries) {
    if (entry.entryType === 'check_in') {
      const current = checkInsByDate.get(entry.date) ?? 0;
      checkInsByDate.set(entry.date, current + entry.value);
    }
    allEntryDates.add(entry.date);
  }

  for (const [date, totalValue] of checkInsByDate) {
    if (dailyTarget != null) {
      if (totalValue >= dailyTarget) {
        completedDates.add(date);
      }
    } else {
      completedDates.add(date);
    }
  }

  const endDate = status === 'paused' && pausedAt ? pausedAt : referenceDate;

  // Walk backward from endDate to habitCreatedAt
  const startStr = toDateStr(habitCreatedAt);
  const endStr = toDateStr(endDate);

  // Forward pass to find longest streak
  let currentStreak = 0;
  let longestStreak = 0;
  let creditDays = 0;
  let tempStreak = 0;
  let tempCredit = 0;

  const startDate = new Date(habitCreatedAt);
  startDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  let cursor = new Date(startDate);
  while (cursor <= end) {
    const dateStr = toDateStr(cursor);
    const isDue = frequency.isDueOn(cursor, habitCreatedAt);
    const completed = completedDates.has(dateStr);
    const hasEntry = allEntryDates.has(dateStr);

    if (isDue) {
      if (completed) {
        tempStreak++;
      } else if (tempCredit > 0) {
        // Use a credit
        tempCredit--;
        tempStreak++;
      } else {
        // Streak broken
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
        tempCredit = 0;
      }
    } else {
      // Not a due day
      if (completed) {
        tempCredit++;
      }
    }

    cursor = addDays(cursor, 1);
  }

  currentStreak = tempStreak;
  creditDays = tempCredit;
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  return { currentStreak, longestStreak, creditDays };
}
