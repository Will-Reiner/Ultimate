import {
  JournalEntryInput,
  JournalTagInput,
} from '../inputs/JournalInput';
import { MoodGraph, MoodDataPoint, WeeklyAverage } from '../value-objects/MoodGraph';
import { MoodTrend } from '../value-objects/MoodTrend';
import { TagFrequency } from '../value-objects/TagFrequency';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getISOWeekMonday(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  // getDay: 0=Sun, 1=Mon, ..., 6=Sat
  // Shift so Monday = 0
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return toDateString(d);
}

function daysInMonth(month: number, year: number): number {
  // month is 1-based
  return new Date(year, month, 0).getDate();
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - days);
  return d;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export class JournalDashboardService {
  static computeMoodGraph(
    entries: JournalEntryInput[],
    days: number,
    refDate: Date,
  ): MoodGraph {
    const refStr = toDateString(refDate);
    const startDate = subtractDays(refDate, days - 1);
    const startStr = toDateString(startDate);

    const filtered = entries
      .filter((e) => {
        if (e.moodLevel === null) return false;
        const ds = toDateString(e.date);
        return ds >= startStr && ds <= refStr;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const dataPoints: MoodDataPoint[] = filtered.map((e) => ({
      date: toDateString(e.date),
      level: e.moodLevel as number,
    }));

    // Weekly averages
    const weekMap = new Map<string, number[]>();
    for (const dp of dataPoints) {
      // Parse the date string back to get week start
      const [y, m, d] = dp.date.split('-').map(Number);
      const weekStart = getISOWeekMonday(new Date(y, m - 1, d));
      const arr = weekMap.get(weekStart) ?? [];
      arr.push(dp.level);
      weekMap.set(weekStart, arr);
    }

    const weeklyAverages: WeeklyAverage[] = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekStart, levels]) => ({
        weekStart,
        average: average(levels),
      }));

    return MoodGraph.create(dataPoints, weeklyAverages);
  }

  static computeMoodTrend(
    entries: JournalEntryInput[],
    refDate: Date,
  ): MoodTrend {
    const refStr = toDateString(refDate);
    const recentStart = subtractDays(refDate, 6);
    const recentStartStr = toDateString(recentStart);

    const prevEnd = subtractDays(refDate, 7);
    const prevEndStr = toDateString(prevEnd);
    const prevStart = subtractDays(refDate, 13);
    const prevStartStr = toDateString(prevStart);

    const recentMoods: number[] = [];
    const prevMoods: number[] = [];

    for (const e of entries) {
      if (e.moodLevel === null) continue;
      const ds = toDateString(e.date);
      if (ds >= recentStartStr && ds <= refStr) {
        recentMoods.push(e.moodLevel);
      } else if (ds >= prevStartStr && ds <= prevEndStr) {
        prevMoods.push(e.moodLevel);
      }
    }

    if (recentMoods.length === 0 || prevMoods.length === 0) {
      return MoodTrend.create('stable');
    }

    const diff = average(recentMoods) - average(prevMoods);

    if (diff > 0.5) return MoodTrend.create('improving');
    if (diff < -0.5) return MoodTrend.create('worsening');
    return MoodTrend.create('stable');
  }

  static computeWritingStreak(
    entries: JournalEntryInput[],
    refDate: Date,
  ): number {
    const dateSet = new Set<string>();
    for (const e of entries) {
      dateSet.add(toDateString(e.date));
    }

    let streak = 0;
    let current = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate(),
    );

    while (dateSet.has(toDateString(current))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  }

  static computeEntryFrequency(
    entries: JournalEntryInput[],
    month: number,
    year: number,
  ): number {
    const totalDays = daysInMonth(month, year);

    const uniqueDays = new Set<string>();
    for (const e of entries) {
      const d = e.date;
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        uniqueDays.add(toDateString(d));
      }
    }

    if (uniqueDays.size === 0) return 0;
    return (uniqueDays.size / totalDays) * 100;
  }

  static computeTagFrequency(
    entries: JournalEntryInput[],
    tags: JournalTagInput[],
  ): TagFrequency {
    const tagMap = new Map<string, string>();
    for (const t of tags) {
      tagMap.set(t.id, t.name);
    }

    const counts = new Map<string, number>();
    for (const e of entries) {
      for (const tagId of e.tagIds) {
        if (!tagMap.has(tagId)) continue;
        counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
      }
    }

    const tagCounts = Array.from(counts.entries()).map(([tagId, count]) => ({
      tagId,
      tagName: tagMap.get(tagId)!,
      count,
    }));

    return TagFrequency.create(tagCounts);
  }
}
