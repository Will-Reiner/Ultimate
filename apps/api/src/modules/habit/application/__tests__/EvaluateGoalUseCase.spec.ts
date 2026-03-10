import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EvaluateGoalUseCase } from '../use-cases/EvaluateGoalUseCase';
import { createMockRepository, createMockHabit, createMockEntry } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';
import { Habit } from '../../domain/entities/Habit';
import { Frequency } from '../../domain/value-objects/Frequency';
import { Goal } from '../../domain/value-objects/Goal';

function makeHabitWithGoal(goalOverrides: Partial<{ type: 'deadline' | 'ongoing'; targetValue: number; targetUnit: string; deadline: Date | null; status: 'in_progress' | 'completed' | 'failed' }> = {}): Habit {
  const goal = Goal.restore({
    type: goalOverrides.type ?? 'ongoing',
    targetValue: goalOverrides.targetValue ?? 30,
    targetUnit: goalOverrides.targetUnit ?? 'dias',
    deadline: goalOverrides.deadline ?? null,
    status: goalOverrides.status ?? 'in_progress',
  });
  return Habit.restore({
    id: 'habit-1',
    userId: 'user-1',
    name: 'Exercício',
    description: null,
    type: 'build',
    trackingMode: 'boolean',
    dailyTarget: null,
    targetUnit: null,
    frequency: Frequency.create({ type: 'daily' }),
    goal,
    categoryId: null,
    tags: [],
    reminders: [],
    status: 'active',
    trackRelapseIntensity: false,
    trackRelapseTrigger: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('EvaluateGoalUseCase', () => {
  let useCase: EvaluateGoalUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new EvaluateGoalUseCase(repo);
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(useCase.execute('h1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException se hábito não tem meta', async () => {
    repo.findOne.mockResolvedValue(createMockHabit());
    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('deve manter in_progress se meta ongoing não atingida', async () => {
    const habit = makeHabitWithGoal({ targetValue: 30 });
    repo.findOne.mockResolvedValue(habit);
    // 10 check-ins, each value 1 → total 10 < 30
    const entries = Array.from({ length: 10 }, (_, i) =>
      createMockEntry({ id: `e${i}`, date: `2026-01-${String(i + 1).padStart(2, '0')}` })
    );
    repo.getEntries.mockResolvedValue(entries);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.goal?.status).toBe('in_progress');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deve marcar como completed ao atingir targetValue', async () => {
    const habit = makeHabitWithGoal({ targetValue: 5 });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(habit);
    const entries = Array.from({ length: 5 }, (_, i) =>
      createMockEntry({ id: `e${i}`, date: `2026-01-${String(i + 1).padStart(2, '0')}` })
    );
    repo.getEntries.mockResolvedValue(entries);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.goal?.status).toBe('completed');
    expect(repo.update).toHaveBeenCalledWith('habit-1', { goalStatus: 'completed' });
  });

  it('deve marcar como failed se deadline expirou sem atingir meta', async () => {
    const pastDeadline = new Date('2026-01-15');
    const habit = makeHabitWithGoal({ type: 'deadline', targetValue: 30, deadline: pastDeadline });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([
      createMockEntry({ id: 'e1', date: '2026-01-01' }),
    ]);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.goal?.status).toBe('failed');
    expect(repo.update).toHaveBeenCalledWith('habit-1', { goalStatus: 'failed' });
  });

  it('não deve alterar status se meta já completada', async () => {
    const habit = makeHabitWithGoal({ targetValue: 5, status: 'completed' });
    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([]);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.goal?.status).toBe('completed');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
