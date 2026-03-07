import { UpdateHabitUseCase } from './UpdateHabitUseCase';
import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';

const now = new Date('2026-01-01');

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

describe('UpdateHabitUseCase', () => {
  it('should update a habit title', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(makeHabit());
    const useCase = new UpdateHabitUseCase(repo);

    const result = await useCase.execute('habit-1', { title: 'Yoga' });

    expect(result.title).toBe('Yoga');
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw HABIT_NOT_FOUND when habit does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateHabitUseCase(repo);

    await expect(
      useCase.execute('nonexistent', { title: 'Yoga' }),
    ).rejects.toThrow(expect.objectContaining({ code: 'HABIT_NOT_FOUND' }));
  });
});
