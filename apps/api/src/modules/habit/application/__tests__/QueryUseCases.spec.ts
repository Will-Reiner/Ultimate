import { NotFoundException } from '@nestjs/common';
import { GetHabitsUseCase } from '../use-cases/GetHabitsUseCase';
import { GetHabitUseCase } from '../use-cases/GetHabitUseCase';
import { DeleteHabitUseCase } from '../use-cases/DeleteHabitUseCase';
import { createMockRepository, createMockHabit } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('GetHabitsUseCase', () => {
  let useCase: GetHabitsUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new GetHabitsUseCase(repo);
  });

  it('deve listar todos os hábitos do usuário', async () => {
    repo.findAll.mockResolvedValue([createMockHabit(), createMockHabit({ id: 'habit-2' })]);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(repo.findAll).toHaveBeenCalledWith('user-1', undefined);
  });

  it('deve filtrar por status', async () => {
    repo.findAll.mockResolvedValue([]);

    await useCase.execute('user-1', 'paused');

    expect(repo.findAll).toHaveBeenCalledWith('user-1', 'paused');
  });
});

describe('GetHabitUseCase', () => {
  let useCase: GetHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new GetHabitUseCase(repo);
  });

  it('deve retornar hábito existente', async () => {
    repo.findOne.mockResolvedValue(createMockHabit());

    const result = await useCase.execute('habit-1', 'user-1');

    expect(result.id).toBe('habit-1');
  });

  it('deve lançar NotFoundException se não encontrar', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('no-id', 'user-1')).rejects.toThrow(NotFoundException);
  });
});

describe('DeleteHabitUseCase', () => {
  let useCase: DeleteHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new DeleteHabitUseCase(repo);
  });

  it('deve deletar hábito existente', async () => {
    repo.findOne.mockResolvedValue(createMockHabit());
    repo.remove.mockResolvedValue();

    await useCase.execute('habit-1', 'user-1');

    expect(repo.remove).toHaveBeenCalledWith('habit-1');
  });

  it('deve lançar NotFoundException se não encontrar', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('no-id', 'user-1')).rejects.toThrow(NotFoundException);
  });
});
