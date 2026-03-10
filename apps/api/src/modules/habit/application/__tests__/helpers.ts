import { Habit } from '../../domain/entities/Habit';
import { HabitEntry } from '../../domain/entities/HabitEntry';
import { Frequency } from '../../domain/value-objects/Frequency';
import { Goal } from '../../domain/value-objects/Goal';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

export function createMockHabit(overrides: Partial<{
  id: string;
  userId: string;
  name: string;
  type: 'build' | 'quit';
  trackingMode: 'boolean' | 'quantitative';
  status: 'active' | 'paused' | 'archived';
  trackRelapseIntensity: boolean;
  trackRelapseTrigger: boolean;
}> = {}): Habit {
  return Habit.restore({
    id: overrides.id ?? 'habit-1',
    userId: overrides.userId ?? 'user-1',
    name: overrides.name ?? 'Meu hábito',
    description: null,
    type: overrides.type ?? 'build',
    trackingMode: overrides.trackingMode ?? 'boolean',
    dailyTarget: null,
    targetUnit: null,
    frequency: Frequency.create({ type: 'daily' }),
    goal: null,
    categoryId: null,
    tags: [],
    reminders: [],
    status: overrides.status ?? 'active',
    trackRelapseIntensity: overrides.trackRelapseIntensity ?? false,
    trackRelapseTrigger: overrides.trackRelapseTrigger ?? false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

export function createMockEntry(overrides: Partial<{
  id: string;
  habitId: string;
  date: string;
  entryType: 'check_in' | 'relapse';
  value: number;
}> = {}): HabitEntry {
  return HabitEntry.restore({
    id: overrides.id ?? 'entry-1',
    habitId: overrides.habitId ?? 'habit-1',
    date: overrides.date ?? '2026-03-10',
    entryType: overrides.entryType ?? 'check_in',
    value: overrides.value ?? 1,
    note: null,
    intensity: null,
    trigger: null,
    createdAt: new Date(),
  });
}

export function createMockRepository(): jest.Mocked<IHabitRepository> {
  return {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getEntries: jest.fn(),
    findEntryByDate: jest.fn(),
    createEntry: jest.fn(),
  };
}
