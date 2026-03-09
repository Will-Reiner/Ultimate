import { useEffect, useMemo } from 'react';
import { useHabitStore } from '../stores/habitStore';
import { useAuth } from './useAuth';

export function useHabits() {
  const habits = useHabitStore((s) => s.habits);
  const selectedDetail = useHabitStore((s) => s.selectedDetail);
  const isLoading = useHabitStore((s) => s.isLoading);
  const error = useHabitStore((s) => s.error);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const createHabit = useHabitStore((s) => s.createHabit);
  const completeHabit = useHabitStore((s) => s.completeHabit);
  const fetchHabitDetail = useHabitStore((s) => s.fetchHabitDetail);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchHabits();
    }
  }, [user?.id]);

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);
  const buildHabits = useMemo(() => activeHabits.filter((h) => h.type === 'build'), [activeHabits]);
  const quitHabits = useMemo(() => activeHabits.filter((h) => h.type === 'quit'), [activeHabits]);

  return {
    habits,
    buildHabits,
    quitHabits,
    selectedDetail,
    isLoading,
    error,
    createHabit,
    completeHabit,
    fetchHabitDetail,
    updateHabit,
    archiveHabit,
    refresh: () => user?.id && fetchHabits(),
  };
}
