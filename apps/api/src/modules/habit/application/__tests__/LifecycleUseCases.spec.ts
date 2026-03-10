import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PauseHabitUseCase } from '../use-cases/PauseHabitUseCase';
import { ArchiveHabitUseCase } from '../use-cases/ArchiveHabitUseCase';
import { ReactivateHabitUseCase } from '../use-cases/ReactivateHabitUseCase';
import { createMockRepository, createMockHabit } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('PauseHabitUseCase', () => {
  let useCase: PauseHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new PauseHabitUseCase(repo);
  });

  it('deve pausar hábito active', async () => {
    const habit = createMockHabit({ status: 'active' });
    const paused = createMockHabit({ status: 'paused' });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(paused);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.status).toBe('paused');
    expect(repo.update).toHaveBeenCalledWith('habit-1', { status: 'paused' });
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('no-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('deve rejeitar pausar hábito já pausado', async () => {
    const habit = createMockHabit({ status: 'paused' });
    repo.findOne.mockResolvedValue(habit);

    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar pausar hábito archived', async () => {
    const habit = createMockHabit({ status: 'archived' });
    repo.findOne.mockResolvedValue(habit);

    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});

describe('ArchiveHabitUseCase', () => {
  let useCase: ArchiveHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new ArchiveHabitUseCase(repo);
  });

  it('deve arquivar hábito active', async () => {
    const habit = createMockHabit({ status: 'active' });
    const archived = createMockHabit({ status: 'archived' });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(archived);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.status).toBe('archived');
  });

  it('deve rejeitar arquivar hábito paused', async () => {
    const habit = createMockHabit({ status: 'paused' });
    repo.findOne.mockResolvedValue(habit);

    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar arquivar se já está archived', async () => {
    const habit = createMockHabit({ status: 'archived' });
    repo.findOne.mockResolvedValue(habit);

    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});

describe('ReactivateHabitUseCase', () => {
  let useCase: ReactivateHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new ReactivateHabitUseCase(repo);
  });

  it('deve reativar hábito paused', async () => {
    const habit = createMockHabit({ status: 'paused' });
    const active = createMockHabit({ status: 'active' });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(active);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.status).toBe('active');
  });

  it('deve reativar hábito archived', async () => {
    const habit = createMockHabit({ status: 'archived' });
    const active = createMockHabit({ status: 'active' });
    repo.findOne.mockResolvedValue(habit);
    repo.update.mockResolvedValue(active);

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.status).toBe('active');
  });

  it('deve rejeitar reativar se já está active', async () => {
    const habit = createMockHabit({ status: 'active' });
    repo.findOne.mockResolvedValue(habit);

    await expect(useCase.execute('habit-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});
