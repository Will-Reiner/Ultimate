import { Habit } from './Habit';
import { HabitErrors } from '../errors/HabitErrors';

describe('Habit entity', () => {
  const validProps = {
    id: 'habit-1',
    userId: 'user-1',
    title: 'Meditar',
    frequency: { type: 'daily' as const },
    isArchived: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should create a habit with valid props', () => {
    const habit = Habit.create(validProps);
    expect(habit.id).toBe('habit-1');
    expect(habit.title).toBe('Meditar');
    expect(habit.isArchived).toBe(false);
  });

  it('should trim the title on creation', () => {
    const habit = Habit.create({ ...validProps, title: '  Correr  ' });
    expect(habit.title).toBe('Correr');
  });

  it('should throw INVALID_HABIT_TITLE for empty title', () => {
    expect(() => Habit.create({ ...validProps, title: '   ' })).toThrow(
      expect.objectContaining({ code: 'INVALID_HABIT_TITLE' }),
    );
  });

  it('should return isActiveToday true for daily habits', () => {
    const habit = Habit.create(validProps);
    expect(habit.isActiveToday()).toBe(true);
  });

  it('should return isActiveToday false for archived habits', () => {
    const habit = Habit.create({ ...validProps, isArchived: true });
    expect(habit.isActiveToday()).toBe(false);
  });

  it('should produce an archived copy via archive()', () => {
    const habit = Habit.create(validProps);
    const archived = habit.archive();
    expect(archived.isArchived).toBe(true);
    expect(habit.isArchived).toBe(false); // original is immutable
  });

  it('should create a weekly habit with specific days', () => {
    const habit = Habit.create({
      ...validProps,
      frequency: { type: 'weekly', daysOfWeek: [1, 3, 5] }, // Mon, Wed, Fri
    });
    expect(habit.frequency.type).toBe('weekly');
    expect(habit.frequency.daysOfWeek).toEqual([1, 3, 5]);
  });
});
