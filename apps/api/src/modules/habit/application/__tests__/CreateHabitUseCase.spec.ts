import { CreateHabitUseCase, CreateHabitInput } from '../use-cases/CreateHabitUseCase';
import { createMockRepository, createMockHabit } from './helpers';
import { IHabitRepository } from '../../domain/repositories/IHabitRepository';

describe('CreateHabitUseCase', () => {
  let useCase: CreateHabitUseCase;
  let repo: jest.Mocked<IHabitRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    useCase = new CreateHabitUseCase(repo);
  });

  const validInput: CreateHabitInput = {
    userId: 'user-1',
    name: 'Beber água',
    type: 'build',
    trackingMode: 'boolean',
    frequencyType: 'daily',
  };

  it('deve criar hábito com dados válidos', async () => {
    const habit = createMockHabit({ name: 'Beber água' });
    repo.create.mockResolvedValue(habit);

    const result = await useCase.execute(validInput);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Beber água');
    expect(result.type).toBe('build');
  });

  it('deve passar campos de frequência para o repositório', async () => {
    const habit = createMockHabit();
    repo.create.mockResolvedValue(habit);

    await useCase.execute({
      ...validInput,
      frequencyType: 'weekly',
      frequencyTimesPerWeek: 3,
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        frequencyType: 'weekly',
        frequencyTimesPerWeek: 3,
      }),
    );
  });

  it('deve passar campos de goal para o repositório', async () => {
    const habit = createMockHabit();
    repo.create.mockResolvedValue(habit);

    await useCase.execute({
      ...validInput,
      goalType: 'deadline',
      goalTargetValue: 30,
      goalTargetUnit: 'dias',
      goalDeadline: '2026-06-01T00:00:00.000Z',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        goalType: 'deadline',
        goalTargetValue: 30,
        goalTargetUnit: 'dias',
      }),
    );
  });

  it('deve rejeitar nome vazio via validação de domínio', async () => {
    await expect(
      useCase.execute({ ...validInput, name: '' }),
    ).rejects.toThrow();
  });

  it('deve rejeitar nome com mais de 100 caracteres', async () => {
    await expect(
      useCase.execute({ ...validInput, name: 'a'.repeat(101) }),
    ).rejects.toThrow();
  });

  it('deve rejeitar trackingMode quantitative sem dailyTarget', async () => {
    await expect(
      useCase.execute({ ...validInput, trackingMode: 'quantitative' }),
    ).rejects.toThrow();
  });

  it('deve criar hábito quantitativo com dailyTarget e targetUnit', async () => {
    const habit = createMockHabit({ trackingMode: 'quantitative' });
    repo.create.mockResolvedValue(habit);

    await useCase.execute({
      ...validInput,
      trackingMode: 'quantitative',
      dailyTarget: 8,
      targetUnit: 'copos',
      frequencyType: 'daily',
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        trackingMode: 'quantitative',
        dailyTarget: 8,
        targetUnit: 'copos',
      }),
    );
  });

  it('deve rejeitar frequência inválida', async () => {
    await expect(
      useCase.execute({ ...validInput, frequencyType: 'invalid' as any }),
    ).rejects.toThrow();
  });

  it('deve passar tagIds e reminders', async () => {
    const habit = createMockHabit();
    repo.create.mockResolvedValue(habit);

    await useCase.execute({
      ...validInput,
      tagIds: ['tag-1', 'tag-2'],
      reminders: ['08:00', '20:00'],
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tagIds: ['tag-1', 'tag-2'],
        reminders: ['08:00', '20:00'],
      }),
    );
  });

  it('deve ignorar trackRelapse* para tipo build', async () => {
    const habit = createMockHabit();
    repo.create.mockResolvedValue(habit);

    await useCase.execute({
      ...validInput,
      type: 'build',
      trackRelapseIntensity: true,
    });

    // Domain validation passes (ignores the flag), repo receives the raw data
    expect(repo.create).toHaveBeenCalledTimes(1);
  });
});
