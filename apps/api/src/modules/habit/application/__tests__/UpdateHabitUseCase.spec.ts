import { NotFoundException } from '@nestjs/common';
import { UpdateHabitUseCase } from '../use-cases/UpdateHabitUseCase';
import { createMockRepository, createMockHabit } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('UpdateHabitUseCase', () => {
  let useCase: UpdateHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new UpdateHabitUseCase(repo);
  });

  it('deve atualizar nome do hábito', async () => {
    const habit = createMockHabit();
    const updated = createMockHabit({ name: 'Novo nome' });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('habit-1', 'user-1', { name: 'Novo nome' });

    expect(result.name).toBe('Novo nome');
    expect(repo.update).toHaveBeenCalledWith('habit-1', expect.objectContaining({ name: 'Novo nome' }));
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute('no-id', 'user-1', { name: 'Teste' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve rejeitar nome vazio via domínio', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);

    await expect(
      useCase.execute('habit-1', 'user-1', { name: '' }),
    ).rejects.toThrow();
  });

  it('deve atualizar frequência', async () => {
    const habit = createMockHabit();
    const updated = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(updated);

    await useCase.execute('habit-1', 'user-1', {
      frequencyType: 'weekly',
      frequencyTimesPerWeek: 5,
    });

    expect(repo.update).toHaveBeenCalledWith('habit-1', expect.objectContaining({
      frequencyType: 'weekly',
      frequencyTimesPerWeek: 5,
    }));
  });

  it('deve atualizar goal', async () => {
    const habit = createMockHabit();
    const updated = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(updated);

    await useCase.execute('habit-1', 'user-1', {
      goalType: 'ongoing',
      goalTargetValue: 100,
      goalTargetUnit: 'dias',
    });

    expect(repo.update).toHaveBeenCalledWith('habit-1', expect.objectContaining({
      goalType: 'ongoing',
      goalTargetValue: 100,
      goalTargetUnit: 'dias',
    }));
  });

  it('deve remover goal quando goalType é null', async () => {
    const habit = createMockHabit();
    const updated = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(updated);

    await useCase.execute('habit-1', 'user-1', { goalType: null });

    expect(repo.update).toHaveBeenCalledWith('habit-1', expect.objectContaining({
      goalType: null,
    }));
  });

  it('deve atualizar reminders', async () => {
    const habit = createMockHabit();
    const updated = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(updated);

    await useCase.execute('habit-1', 'user-1', {
      reminders: ['07:00', '19:00'],
    });

    expect(repo.update).toHaveBeenCalledWith('habit-1', expect.objectContaining({
      reminders: ['07:00', '19:00'],
    }));
  });

  it('deve rejeitar reminder com formato inválido via domínio', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);

    await expect(
      useCase.execute('habit-1', 'user-1', { reminders: ['25:00'] }),
    ).rejects.toThrow();
  });
});
