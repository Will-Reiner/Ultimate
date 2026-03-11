import { HabitInput, HabitEntryInput } from '../inputs/HabitInput';
import { TaskInput } from '../inputs/TaskInput';
import { CalendarEventInput } from '../inputs/CalendarInput';
import { JournalEntryInput } from '../inputs/JournalInput';
import { HomeSummary } from '../value-objects/HomeSummary';

export interface HomeSummaryInput {
  habits: HabitInput[];
  habitEntries: HabitEntryInput[];
  tasks: TaskInput[];
  events: CalendarEventInput[];
  journalEntries: JournalEntryInput[];
  referenceDate: Date;
}

export class HomeDashboardService {
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

  private static formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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

  private static getMonday(date: Date): Date {
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayOffset);
  }

  private static getSunday(date: Date): Date {
    const monday = this.getMonday(date);
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private static isWithinWeek(date: Date, monday: Date, sunday: Date): boolean {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const mon = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
    const sun = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
    return d >= mon && d <= sun;
  }

  static computeSummary(input: HomeSummaryInput): HomeSummary {
    const { habits, habitEntries, tasks, events, journalEntries, referenceDate } = input;
    const refDateStr = this.formatDate(referenceDate);
    const activeHabits = habits.filter((h) => h.status === 'active');

    // 1. pendingHabits & habitCompletionToday
    const dueHabits = activeHabits.filter((h) => this.isDueOnDate(h, referenceDate));
    const completedHabits = dueHabits.filter((h) =>
      this.isCompletedOnDate(h, habitEntries, refDateStr),
    );
    const pendingHabits = dueHabits.length - completedHabits.length;
    const habitCompletionToday =
      dueHabits.length === 0 ? 0 : (completedHabits.length / dueHabits.length) * 100;

    // 2. todayTasks
    const refDayEnd = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
      23, 59, 59, 999,
    );
    const todayTasks = tasks.filter(
      (t) => t.deadline !== null && t.deadline <= refDayEnd && t.statusType !== 'done',
    ).length;

    // 3. nextEvents
    const upcoming = events
      .filter((e) => e.startAt >= referenceDate)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .slice(0, 3)
      .map((e) => ({ id: e.id, title: e.title, startAt: e.startAt }));

    // 4. todayMood
    const todayJournal = journalEntries.find((j) => this.isSameDay(j.date, referenceDate));
    const todayMood = todayJournal?.moodLevel ?? null;

    // 5. taskCompletionThisWeek
    const monday = this.getMonday(referenceDate);
    const sunday = this.getSunday(referenceDate);

    const completedThisWeek = tasks.filter(
      (t) =>
        t.statusType === 'done' &&
        t.completedAt !== null &&
        this.isWithinWeek(t.completedAt, monday, sunday),
    );

    const tasksWithDeadlineThisWeek = tasks.filter(
      (t) => t.deadline !== null && this.isWithinWeek(t.deadline, monday, sunday),
    );

    // Union: tasks with deadline this week OR completed this week
    const weekTaskIds = new Set<string>();
    for (const t of tasksWithDeadlineThisWeek) weekTaskIds.add(t.id);
    for (const t of completedThisWeek) weekTaskIds.add(t.id);

    const totalThisWeek = weekTaskIds.size;
    const taskCompletionThisWeek =
      totalThisWeek === 0 ? 0 : (completedThisWeek.length / totalThisWeek) * 100;

    // 6. topStreaks
    const topStreaks = activeHabits
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 3)
      .map((h) => ({ habitId: h.id, name: h.name, currentStreak: h.currentStreak }));

    return HomeSummary.create({
      pendingHabits,
      todayTasks,
      nextEvents: upcoming,
      todayMood,
      habitCompletionToday,
      taskCompletionThisWeek,
      topStreaks,
    });
  }
}
