import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEntryUseCase } from '../use-cases/CreateEntryUseCase';
import { GetEntriesUseCase } from '../use-cases/GetEntriesUseCase';
import { createMockRepository, createMockHabit, createMockEntry } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('CreateEntryUseCase', () => {
  let useCase: CreateEntryUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new CreateEntryUseCase(repo);
  });

  it('deve criar check_in com valores padrão', async () => {
    const habit = createMockHabit();
    const entry = createMockEntry();
    repo.findOne.mockResolvedValue(habit);
    repo.findEntryByDate.mockResolvedValue(null);
    repo.createEntry.mockResolvedValue(entry);

    const result = await useCase.execute('habit-1', 'user-1', {});

    expect(result.entry_type).toBe('check_in');
    expect(repo.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        habitId: 'habit-1',
        entryType: 'check_in',
        value: 1,
      }),
    );
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute('no-id', 'user-1', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar ConflictException se check_in já existe na data', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.findEntryByDate.mockResolvedValue(createMockEntry());

    await expect(
      useCase.execute('habit-1', 'user-1', { date: '2026-03-10' }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve criar entry com data específica', async () => {
    const habit = createMockHabit();
    const entry = createMockEntry({ date: '2026-03-09' });
    repo.findOne.mockResolvedValue(habit);
    repo.findEntryByDate.mockResolvedValue(null);
    repo.createEntry.mockResolvedValue(entry);

    const result = await useCase.execute('habit-1', 'user-1', {
      date: '2026-03-09',
      value: 3,
    });

    expect(result.date).toBe('2026-03-09');
  });

  it('deve criar relapse entry', async () => {
    const habit = createMockHabit({
      type: 'quit',
      trackRelapseIntensity: true,
      trackRelapseTrigger: true,
    });
    const entry = createMockEntry({ entryType: 'relapse' });
    repo.findOne.mockResolvedValue(habit);
    repo.createEntry.mockResolvedValue(entry);

    const result = await useCase.execute('habit-1', 'user-1', {
      entryType: 'relapse',
      intensity: 7,
      trigger: 'stress',
    });

    expect(result.entry_type).toBe('relapse');
    expect(repo.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        entryType: 'relapse',
        intensity: 7,
        trigger: 'stress',
      }),
    );
  });

  it('deve permitir múltiplos relapses na mesma data', async () => {
    const habit = createMockHabit({ type: 'quit' });
    const entry = createMockEntry({ entryType: 'relapse' });
    repo.findOne.mockResolvedValue(habit);
    repo.createEntry.mockResolvedValue(entry);

    // Should NOT check for duplicates on relapse
    await useCase.execute('habit-1', 'user-1', {
      entryType: 'relapse',
      date: '2026-03-10',
    });

    expect(repo.findEntryByDate).not.toHaveBeenCalled();
    expect(repo.createEntry).toHaveBeenCalledTimes(1);
  });

  it('deve rejeitar intensity sem tracking habilitado', async () => {
    const habit = createMockHabit({
      type: 'quit',
      trackRelapseIntensity: false,
    });
    repo.findOne.mockResolvedValue(habit);

    await expect(
      useCase.execute('habit-1', 'user-1', {
        entryType: 'relapse',
        intensity: 5,
      }),
    ).rejects.toThrow();
  });

  it('deve rejeitar valor <= 0 para check_in', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);

    await expect(
      useCase.execute('habit-1', 'user-1', { value: 0 }),
    ).rejects.toThrow();
  });
});

describe('GetEntriesUseCase', () => {
  let useCase: GetEntriesUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new GetEntriesUseCase(repo);
  });

  it('deve retornar entries no intervalo', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([createMockEntry()]);

    const result = await useCase.execute('habit-1', 'user-1', '2026-03-01', '2026-03-31');

    expect(result).toHaveLength(1);
    expect(repo.getEntries).toHaveBeenCalledWith('habit-1', '2026-03-01', '2026-03-31', undefined);
  });

  it('deve filtrar por entryType', async () => {
    const habit = createMockHabit();
    repo.findOne.mockResolvedValue(habit);
    repo.getEntries.mockResolvedValue([]);

    await useCase.execute('habit-1', 'user-1', '2026-03-01', '2026-03-31', 'relapse');

    expect(repo.getEntries).toHaveBeenCalledWith('habit-1', '2026-03-01', '2026-03-31', 'relapse');
  });

  it('deve lançar NotFoundException se hábito não existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute('no-id', 'user-1', '2026-03-01', '2026-03-31'),
    ).rejects.toThrow(NotFoundException);
  });
});
