import { HabitInput, HabitEntryInput } from '../inputs/HabitInput';
import { CompletionRate } from '../value-objects/CompletionRate';
import { HabitHeatmap, HeatmapDay } from '../value-objects/HabitHeatmap';
import { ViceMetrics } from '../value-objects/ViceMetrics';

export class HabitDashboardService {
  private static isDueOnDate(habit: HabitInput, date: Date): boolean {
    switch (habit.frequencyType) {
      case 'daily':
        return true;
      case 'weekly':
        return true;
      case 'specific_days':
        return habit.frequencyDays.includes(date.getDay());
      case 'interval': {
        const diffMs = date.getTime() - habit.createdAt.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % habit.frequencyEveryNDays! === 0;
      }
      default:
        return false;
    }
  }

  private static isCompletedOnDate(
    habit: HabitInput,
    entries: HabitEntryInput[],
    dateStr: string,
  ): boolean {
    const dayEntries = entries.filter(
      (e) => e.habitId === habit.id && e.date === dateStr && e.entryType === 'check_in',
    );

    if (dayEntries.length === 0) return false;

    if (habit.trackingMode === 'quantitative' && habit.dailyTarget !== null) {
      const sum = dayEntries.reduce((acc, e) => acc + e.value, 0);
      return sum >= habit.dailyTarget;
    }

    return true;
  }

  private static formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private static getDaysInPeriod(
    period: 'day' | 'week' | 'month',
    refDate: Date,
  ): Date[] {
    if (period === 'day') {
      return [new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())];
    }

    if (period === 'week') {
      const day = refDate.getDay();
      // Monday-based week: Monday=1, Sunday=7
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() + mondayOffset);
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
      }
      return days;
    }

    // month
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days: Date[] = [];
    for (let d = 1; d <= lastDay; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }

  static computeCompletionRate(
    habits: HabitInput[],
    entries: HabitEntryInput[],
    period: 'day' | 'week' | 'month',
    refDate: Date,
    habitId?: string,
  ): CompletionRate {
    let activeHabits = habits.filter((h) => h.status === 'active');
    if (habitId) {
      activeHabits = activeHabits.filter((h) => h.id === habitId);
    }

    const days = this.getDaysInPeriod(period, refDate);
    let dueCount = 0;
    let completedCount = 0;

    for (const habit of activeHabits) {
      for (const day of days) {
        if (this.isDueOnDate(habit, day)) {
          dueCount++;
          const dateStr = this.formatDate(day);
          if (this.isCompletedOnDate(habit, entries, dateStr)) {
            completedCount++;
          }
        }
      }
    }

    return CompletionRate.create(completedCount, dueCount);
  }

  static computeHeatmap(
    habit: HabitInput,
    entries: HabitEntryInput[],
    periodDays: number,
    refDate: Date,
  ): HabitHeatmap {
    const days: HeatmapDay[] = [];

    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - i);
      const dateStr = this.formatDate(date);

      if (!this.isDueOnDate(habit, date)) {
        days.push({ date: dateStr, status: 'not_due' });
        continue;
      }

      const dayCheckIns = entries.filter(
        (e) => e.habitId === habit.id && e.date === dateStr && e.entryType === 'check_in',
      );

      if (dayCheckIns.length === 0) {
        days.push({ date: dateStr, status: 'failed' });
        continue;
      }

      if (habit.trackingMode === 'quantitative' && habit.dailyTarget !== null) {
        const sum = dayCheckIns.reduce((acc, e) => acc + e.value, 0);
        days.push({ date: dateStr, status: sum >= habit.dailyTarget ? 'complete' : 'partial' });
      } else {
        days.push({ date: dateStr, status: 'complete' });
      }
    }

    return HabitHeatmap.create(days);
  }

  static computeViceMetrics(
    habit: HabitInput,
    entries: HabitEntryInput[],
    refDate: Date,
  ): ViceMetrics {
    const relapses = entries
      .filter((e) => e.habitId === habit.id && e.entryType === 'relapse')
      .sort((a, b) => a.date.localeCompare(b.date));

    const diffFromCreation = Math.round(
      (refDate.getTime() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    // daysClean
    let daysClean: number;
    if (relapses.length === 0) {
      daysClean = diffFromCreation;
    } else {
      const lastRelapse = relapses[relapses.length - 1];
      const lastRelapseDate = new Date(lastRelapse.date + 'T00:00:00');
      daysClean = Math.round(
        (refDate.getTime() - lastRelapseDate.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // frequencies
    const weeks = diffFromCreation / 7;
    const months = Math.max(1, diffFromCreation / 30);

    const relapseCount = relapses.length;
    const relapseFrequencyPerWeek = weeks > 0 ? relapseCount / weeks : 0;
    const relapseFrequencyPerMonth = relapseCount / months;

    // topTriggers
    const triggerCounts: Record<string, number> = {};
    for (const entry of relapses) {
      if (entry.trigger !== null) {
        triggerCounts[entry.trigger] = (triggerCounts[entry.trigger] || 0) + 1;
      }
    }
    const topTriggers = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return ViceMetrics.create({
      habitId: habit.id,
      daysClean,
      relapseFrequencyPerWeek,
      relapseFrequencyPerMonth,
      topTriggers,
    });
  }
}
