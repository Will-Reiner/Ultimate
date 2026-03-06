import { useEffect } from 'react';
import { useHabitStore } from '../stores/habitStore';
import { useAuth } from './useAuth';

export function useHabits() {
  const habits = useHabitStore((s) => s.habits);
  const isLoading = useHabitStore((s) => s.isLoading);
  const error = useHabitStore((s) => s.error);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const createHabit = useHabitStore((s) => s.createHabit);
  const completeHabit = useHabitStore((s) => s.completeHabit);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchHabits(user.id);
    }
  }, [user?.id]);

  return {
    habits,
    isLoading,
    error,
    todaysHabits: habits.filter((h) => !h.isArchived),
    createHabit,
    completeHabit,
    refresh: () => user?.id && fetchHabits(user.id),
  };
}
