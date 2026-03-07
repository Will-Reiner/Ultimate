import { Habit } from './Habit';

describe('Habit entity', () => {
  const validProps = {
    id: 'habit-1',
    userId: 'user-1',
    title: 'Meditar',
    type: 'build' as const,
    frequency: { type: 'daily' as const },
    isArchived: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should create a habit with valid props', () => {
    const habit = Habit.create(validProps);
    expect(habit.id).toBe('habit-1');
    expect(habit.title).toBe('Meditar');
    expect(habit.type).toBe('build');
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

  it('should throw INVALID_HABIT_TYPE for invalid type', () => {
    expect(() => Habit.create({ ...validProps, type: 'invalid' as any })).toThrow(
      expect.objectContaining({ code: 'INVALID_HABIT_TYPE' }),
    );
  });

  it('should throw INVALID_HABIT_GOAL for goalValue <= 0', () => {
    expect(() => Habit.create({ ...validProps, goalValue: 0 })).toThrow(
      expect.objectContaining({ code: 'INVALID_HABIT_GOAL' }),
    );
    expect(() => Habit.create({ ...validProps, goalValue: -1 })).toThrow(
      expect.objectContaining({ code: 'INVALID_HABIT_GOAL' }),
    );
  });

  it('should throw INVALID_REMINDER_TIME for bad format', () => {
    expect(() => Habit.create({ ...validProps, reminderTime: '25:00' })).toThrow(
      expect.objectContaining({ code: 'INVALID_REMINDER_TIME' }),
    );
    expect(() => Habit.create({ ...validProps, reminderTime: 'abc' })).toThrow(
      expect.objectContaining({ code: 'INVALID_REMINDER_TIME' }),
    );
  });

  it('should accept valid reminderTime', () => {
    const habit = Habit.create({ ...validProps, reminderTime: '08:30' });
    expect(habit.reminderTime).toBe('08:30');
  });

  it('should create a build habit with goal', () => {
    const habit = Habit.create({ ...validProps, goalValue: 8, goalUnit: 'copos' });
    expect(habit.goalValue).toBe(8);
    expect(habit.goalUnit).toBe('copos');
    expect(habit.hasQuantityGoal).toBe(true);
  });

  it('should create a quit habit', () => {
    const habit = Habit.create({ ...validProps, type: 'quit' });
    expect(habit.isQuitHabit).toBe(true);
    expect(habit.isBuildHabit).toBe(false);
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
    expect(habit.isArchived).toBe(false);
  });

  it('should create a weekly habit with specific days', () => {
    const habit = Habit.create({
      ...validProps,
      frequency: { type: 'weekly', daysOfWeek: [1, 3, 5] },
    });
    expect(habit.frequency.type).toBe('weekly');
    expect(habit.frequency.daysOfWeek).toEqual([1, 3, 5]);
  });

  it('should return a new instance via updateWith', () => {
    const habit = Habit.create(validProps);
    const updated = habit.updateWith({ title: 'Yoga', type: 'build' });
    expect(updated.title).toBe('Yoga');
    expect(habit.title).toBe('Meditar');
  });
});
