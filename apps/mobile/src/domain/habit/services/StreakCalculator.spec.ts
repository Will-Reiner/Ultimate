import { calculateStreak } from './StreakCalculator';
import { HabitEntry } from '../entities/HabitEntry';
import { Frequency } from '../value-objects/Frequency';

function makeEntry(daysAgo: number): HabitEntry {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return HabitEntry.create({
    id: `entry-${daysAgo}`,
    habitId: 'habit-1',
    completedAt: d,
    value: 1,
  });
}

describe('StreakCalculator', () => {
  const dailyFreq = Frequency.create({ type: 'daily' });

  it('should return 0/0 for no entries', () => {
    const result = calculateStreak([], dailyFreq);
    expect(result).toEqual({ currentStreak: 0, bestStreak: 0 });
  });

  it('should count consecutive days (yesterday and day before)', () => {
    const entries = [makeEntry(1), makeEntry(2), makeEntry(3)];
    const result = calculateStreak(entries, dailyFreq);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
  });

  it('should handle gap in streak', () => {
    // completed yesterday and 3 days ago but NOT 2 days ago
    const entries = [makeEntry(1), makeEntry(3)];
    const result = calculateStreak(entries, dailyFreq);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
  });

  it('should count today as part of current streak if completed', () => {
    const entries = [makeEntry(0), makeEntry(1), makeEntry(2)];
    const result = calculateStreak(entries, dailyFreq);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
  });

  it('should not break current streak if today is not yet completed', () => {
    // completed yesterday and day before, but not today
    const entries = [makeEntry(1), makeEntry(2)];
    const result = calculateStreak(entries, dailyFreq);
    expect(result.currentStreak).toBe(2);
  });

  it('should handle weekly frequency', () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Create a weekly frequency for today's day of week
    const weeklyFreq = Frequency.create({ type: 'weekly', daysOfWeek: [dayOfWeek] });

    // completed today (0 days ago) and 7 days ago
    const entries = [makeEntry(0), makeEntry(7)];
    const result = calculateStreak(entries, weeklyFreq);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(2);
  });
});
