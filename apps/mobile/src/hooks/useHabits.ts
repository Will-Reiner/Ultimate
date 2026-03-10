import { useEffect, useMemo } from 'react';
import { useHabitStore } from '../stores/habitStore';
import { useAuth } from './useAuth';
import { HabitStatus } from '../types/habit';

export function useHabits(statusFilter?: HabitStatus) {
  const habits = useHabitStore((s) => s.habits);
  const selectedDetail = useHabitStore((s) => s.selectedDetail);
  const isLoading = useHabitStore((s) => s.isLoading);
  const error = useHabitStore((s) => s.error);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const createHabit = useHabitStore((s) => s.createHabit);
  const addEntry = useHabitStore((s) => s.addEntry);
  const fetchHabitDetail = useHabitStore((s) => s.fetchHabitDetail);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const pauseHabit = useHabitStore((s) => s.pauseHabit);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const reactivateHabit = useHabitStore((s) => s.reactivateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchHabits(statusFilter);
    }
  }, [user?.id, statusFilter]);

  const activeHabits = useMemo(() => habits.filter((h) => h.status === 'active'), [habits]);
  const buildHabits = useMemo(() => activeHabits.filter((h) => h.type === 'build'), [activeHabits]);
  const quitHabits = useMemo(() => activeHabits.filter((h) => h.type === 'quit'), [activeHabits]);

  return {
    habits,
    activeHabits,
    buildHabits,
    quitHabits,
    selectedDetail,
    isLoading,
    error,
    createHabit,
    addEntry,
    fetchHabitDetail,
    updateHabit,
    pauseHabit,
    archiveHabit,
    reactivateHabit,
    deleteHabit,
    refresh: () => user?.id && fetchHabits(statusFilter),
  };
}
