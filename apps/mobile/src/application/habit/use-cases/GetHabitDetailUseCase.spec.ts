import { GetHabitDetailUseCase } from './GetHabitDetailUseCase';
import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';
import { HabitEntry } from '@domain/habit/entities/HabitEntry';

const now = new Date('2026-01-15');

function makeMockRepo(): jest.Mocked<IHabitRepository> {
  return {
    findById: jest.fn(),
    findAllByUserId: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    saveEntry: jest.fn(),
    findEntriesByHabitId: jest.fn(),
    findEntriesByHabitIdForMonth: jest.fn(),
    findEntryForToday: jest.fn(),
  };
}

function makeHabit() {
  return Habit.restore({
    id: 'habit-1',
    userId: 'user-1',
    title: 'Meditar',
    type: 'build',
    frequency: { type: 'daily' },
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  });
}

describe('GetHabitDetailUseCase', () => {
  it('should return habit detail with streak and entries', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(makeHabit());
    repo.findEntriesByHabitIdForMonth.mockResolvedValue([
      HabitEntry.create({ id: 'e1', habitId: 'habit-1', completedAt: now, value: 1 }),
    ]);
    repo.findEntryForToday.mockResolvedValue(
      HabitEntry.create({ id: 'e1', habitId: 'habit-1', completedAt: now, value: 1 }),
    );

    const useCase = new GetHabitDetailUseCase(repo);
    const result = await useCase.execute('habit-1');

    expect(result.habit.title).toBe('Meditar');
    expect(result.monthEntries).toHaveLength(1);
    expect(result.completedToday).toBe(true);
    expect(result.streak).toBeDefined();
  });

  it('should throw HABIT_NOT_FOUND when habit does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new GetHabitDetailUseCase(repo);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      expect.objectContaining({ code: 'HABIT_NOT_FOUND' }),
    );
  });
});
