import { HabitEntry } from '../entities/HabitEntry';
import { Frequency } from '../value-objects/Frequency';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

export function calculateStreak(entries: HabitEntry[], frequency: Frequency): StreakResult {
  if (entries.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedDays = new Set<string>();
  for (const entry of entries) {
    const d = entry.completedAt;
    completedDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  let isCurrentStreak = true;

  // Iterate backwards from today up to 365 days
  for (let i = 0; i < 365; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    const isActive = frequency.isActiveOn(cursor);

    if (isActive) {
      if (completedDays.has(key)) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        // Today not completed yet doesn't break current streak
        if (i === 0 && isCurrentStreak) {
          // skip today — user may not have completed yet
        } else {
          if (isCurrentStreak) {
            currentStreak = streak;
            isCurrentStreak = false;
          }
          streak = 0;
        }
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  if (isCurrentStreak) {
    currentStreak = streak;
  }

  return { currentStreak, bestStreak };
}
