import { NotFoundException } from '@nestjs/common';
import { GetStreakUseCase } from '../use-cases/GetStreakUseCase';
import { createMockRepository, createMockHabit, createMockEntry } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('GetStreakUseCase', () => {
  let useCase: GetStreakUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new GetStreakUseCase(repo);
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(useCase.execute('h1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('deve retornar streak 0 para hábito build sem entries', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([]);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result).toEqual(expect.objectContaining({
      current_streak: expect.any(Number),
      longest_streak: expect.any(Number),
      credit_days: expect.any(Number),
    }));
    expect(repo.getEntries).toHaveBeenCalledWith('habit-1', '1970-01-01', '2999-12-31');
  });

  it('deve calcular streak para hábito build com entries', async () => {
    const habit = createMockHabit();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([
      createMockEntry({ date: yesterdayStr }),
      createMockEntry({ id: 'e2', date: todayStr }),
    ]);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.current_streak).toBe(2);
  });

  it('deve retornar streak para hábito quit', async () => {
    const habit = createMockHabit({ type: 'quit' });
    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([]);

    const result = await useCase.execute('habit-1', 'user-1');

    // Quit habit with no relapses: streak = days since creation
    expect(result.current_streak).toBeGreaterThan(0);
    expect(result.credit_days).toBe(0);
  });
});
