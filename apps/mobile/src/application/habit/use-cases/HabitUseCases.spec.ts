import { CreateHabitUseCase, ListHabitsUseCase } from './HabitUseCases';
import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';
import { HabitErrors } from '@domain/habit/errors/HabitErrors';

const now = new Date('2026-01-01');

function makeMockRepo(): jest.Mocked<IHabitRepository> {
  return {
    findById: jest.fn(),
    findAllByUserId: jest.fn(),
    save: jest.fn().mockImplementation((h: Habit) => Promise.resolve(h)),
    update: jest.fn(),
    delete: jest.fn(),
    saveEntry: jest.fn(),
    findEntriesByHabitId: jest.fn(),
    findEntryForToday: jest.fn(),
  };
}

describe('CreateHabitUseCase', () => {
  it('should create and persist a habit, returning its DTO', async () => {
    const repo = makeMockRepo();
    const useCase = new CreateHabitUseCase(repo);

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Meditar',
      frequency: { type: 'daily' },
    });

    expect(result.title).toBe('Meditar');
    expect(result.userId).toBe('user-1');
    expect(result.isArchived).toBe(false);
    expect(typeof result.id).toBe('string');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw INVALID_HABIT_TITLE for an empty title', async () => {
    const repo = makeMockRepo();
    const useCase = new CreateHabitUseCase(repo);

    await expect(
      useCase.execute({ userId: 'user-1', title: '  ', frequency: { type: 'daily' } }),
    ).rejects.toThrow(expect.objectContaining({ code: 'INVALID_HABIT_TITLE' }));

    expect(repo.save).not.toHaveBeenCalled();
  });
});

describe('ListHabitsUseCase', () => {
  it('should return an array of HabitDTOs for the given user', async () => {
    const repo = makeMockRepo();
    const habit = Habit.restore({
      id: 'habit-1',
      userId: 'user-1',
      title: 'Ler',
      frequency: { type: 'daily' },
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });
    repo.findAllByUserId.mockResolvedValue([habit]);

    const useCase = new ListHabitsUseCase(repo);
    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Ler');
    expect(repo.findAllByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return an empty array when user has no habits', async () => {
    const repo = makeMockRepo();
    repo.findAllByUserId.mockResolvedValue([]);

    const useCase = new ListHabitsUseCase(repo);
    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});
