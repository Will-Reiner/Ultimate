import { Habit, HabitType, TrackingMode, HabitStatus } from '../entities/Habit';
import { Frequency } from '../value-objects/Frequency';
import { Goal } from '../value-objects/Goal';
import {
  InvalidHabitNameError,
  ImmutableTypeError,
  InvalidTrackingModeError,
  InvalidStatusTransitionError,
  InvalidReminderTimeError,
} from '../errors/HabitErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Beber água',
    type: 'build' as HabitType,
    trackingMode: 'boolean' as TrackingMode,
    frequency: Frequency.create({ type: 'daily' }),
    ...overrides,
  };
}

describe('Habit', () => {
  describe('criação', () => {
    it('deve criar um hábito do tipo "build" com campos obrigatórios', () => {
      const habit = Habit.create(buildValidProps());
      expect(habit.name).toBe('Beber água');
      expect(habit.type).toBe('build');
      expect(habit.trackingMode).toBe('boolean');
      expect(habit.status).toBe('active');
    });

    it('deve criar um hábito do tipo "quit" com campos obrigatórios', () => {
      const habit = Habit.create(buildValidProps({ type: 'quit', name: 'Parar de fumar' }));
      expect(habit.type).toBe('quit');
      expect(habit.name).toBe('Parar de fumar');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => Habit.create(buildValidProps({ name: '' }))).toThrow(InvalidHabitNameError);
      expect(() => Habit.create(buildValidProps({ name: '   ' }))).toThrow(InvalidHabitNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(() => Habit.create(buildValidProps({ name: longName }))).toThrow(InvalidHabitNameError);
    });

    it('deve fazer trim no nome', () => {
      const habit = Habit.create(buildValidProps({ name: '  Meditar  ' }));
      expect(habit.name).toBe('Meditar');
    });

    it('não deve permitir alterar o type após criação', () => {
      const habit = Habit.create(buildValidProps());
      expect(() => habit.updateType('quit' as any)).toThrow(ImmutableTypeError);
    });

    it('deve exigir frequência na criação', () => {
      expect(() => Habit.create(buildValidProps({ frequency: undefined }))).toThrow();
    });

    it('deve exigir tracking mode na criação (boolean ou quantitative)', () => {
      expect(() => Habit.create(buildValidProps({ trackingMode: 'invalid' }))).toThrow(InvalidTrackingModeError);
    });

    it('deve exigir unidade e meta diária se tracking mode for quantitative', () => {
      expect(() =>
        Habit.create(buildValidProps({ trackingMode: 'quantitative' })),
      ).toThrow(InvalidTrackingModeError);

      expect(() =>
        Habit.create(buildValidProps({ trackingMode: 'quantitative', dailyTarget: 8 })),
      ).toThrow(InvalidTrackingModeError);

      expect(() =>
        Habit.create(buildValidProps({ trackingMode: 'quantitative', targetUnit: 'copos' })),
      ).toThrow(InvalidTrackingModeError);
    });

    it('deve criar hábito quantitativo com dailyTarget e targetUnit', () => {
      const habit = Habit.create(buildValidProps({
        trackingMode: 'quantitative',
        dailyTarget: 8,
        targetUnit: 'copos',
      }));
      expect(habit.trackingMode).toBe('quantitative');
      expect(habit.dailyTarget).toBe(8);
      expect(habit.targetUnit).toBe('copos');
    });

    it('deve permitir criar sem categoria, tags e lembretes', () => {
      const habit = Habit.create(buildValidProps());
      expect(habit.categoryId).toBeNull();
      expect(habit.tags).toEqual([]);
      expect(habit.reminders).toEqual([]);
    });

    it('deve iniciar com status "active"', () => {
      const habit = Habit.create(buildValidProps());
      expect(habit.status).toBe('active');
    });

    it('deve permitir criar hábito tipo "quit" com tracking de intensidade habilitado', () => {
      const habit = Habit.create(buildValidProps({
        type: 'quit',
        trackRelapseIntensity: true,
      }));
      expect(habit.trackRelapseIntensity).toBe(true);
    });

    it('deve permitir criar hábito tipo "quit" com tracking de gatilho habilitado', () => {
      const habit = Habit.create(buildValidProps({
        type: 'quit',
        trackRelapseTrigger: true,
      }));
      expect(habit.trackRelapseTrigger).toBe(true);
    });

    it('deve permitir criar hábito tipo "quit" sem tracking de intensidade e gatilho', () => {
      const habit = Habit.create(buildValidProps({ type: 'quit' }));
      expect(habit.trackRelapseIntensity).toBe(false);
      expect(habit.trackRelapseTrigger).toBe(false);
    });

    it('deve ignorar trackRelapseIntensity e trackRelapseTrigger para tipo "build"', () => {
      const habit = Habit.create(buildValidProps({
        type: 'build',
        trackRelapseIntensity: true,
        trackRelapseTrigger: true,
      }));
      expect(habit.trackRelapseIntensity).toBe(false);
      expect(habit.trackRelapseTrigger).toBe(false);
    });

    it('deve permitir criar com descrição opcional', () => {
      const habit = Habit.create(buildValidProps({ description: 'Beber 8 copos por dia' }));
      expect(habit.description).toBe('Beber 8 copos por dia');
    });

    it('deve permitir criar com goal opcional', () => {
      const goal = Goal.create({
        type: 'ongoing',
        targetValue: 100,
        targetUnit: 'dias',
      });
      const habit = Habit.create(buildValidProps({ goal }));
      expect(habit.goal).not.toBeNull();
      expect(habit.goal!.targetValue).toBe(100);
    });
  });

  describe('edição', () => {
    it('deve atualizar o nome', () => {
      const habit = Habit.create(buildValidProps());
      habit.updateName('Beber mais água');
      expect(habit.name).toBe('Beber mais água');
    });

    it('deve rejeitar nome inválido na atualização', () => {
      const habit = Habit.create(buildValidProps());
      expect(() => habit.updateName('')).toThrow(InvalidHabitNameError);
      expect(() => habit.updateName('a'.repeat(101))).toThrow(InvalidHabitNameError);
    });

    it('deve atualizar a frequência', () => {
      const habit = Habit.create(buildValidProps());
      const newFreq = Frequency.create({ type: 'specific_days', days: [1, 3, 5] });
      habit.updateFrequency(newFreq);
      expect(habit.frequency.type).toBe('specific_days');
      expect(habit.frequency.days).toEqual([1, 3, 5]);
    });

    it('deve atualizar a meta diária (quantitativo)', () => {
      const habit = Habit.create(buildValidProps({
        trackingMode: 'quantitative',
        dailyTarget: 8,
        targetUnit: 'copos',
      }));
      habit.updateDailyTarget(10, 'copos');
      expect(habit.dailyTarget).toBe(10);
    });

    it('deve atualizar categoria', () => {
      const habit = Habit.create(buildValidProps());
      habit.setCategory('cat-123');
      expect(habit.categoryId).toBe('cat-123');
    });

    it('deve remover categoria (setar null)', () => {
      const habit = Habit.create(buildValidProps());
      habit.setCategory('cat-123');
      habit.setCategory(null);
      expect(habit.categoryId).toBeNull();
    });

    it('deve adicionar tag', () => {
      const habit = Habit.create(buildValidProps());
      habit.addTag('tag-1');
      habit.addTag('tag-2');
      expect(habit.tags).toEqual(['tag-1', 'tag-2']);
    });

    it('não deve adicionar tag duplicada', () => {
      const habit = Habit.create(buildValidProps());
      habit.addTag('tag-1');
      habit.addTag('tag-1');
      expect(habit.tags).toEqual(['tag-1']);
    });

    it('deve remover tag', () => {
      const habit = Habit.create(buildValidProps());
      habit.addTag('tag-1');
      habit.addTag('tag-2');
      habit.removeTag('tag-1');
      expect(habit.tags).toEqual(['tag-2']);
    });

    it('deve atualizar lembretes (lista de horários)', () => {
      const habit = Habit.create(buildValidProps());
      habit.setReminders(['08:00', '20:00']);
      expect(habit.reminders).toEqual(['08:00', '20:00']);
    });

    it('deve permitir lembrete com múltiplos horários', () => {
      const habit = Habit.create(buildValidProps());
      habit.setReminders(['06:00', '12:00', '18:00', '22:00']);
      expect(habit.reminders).toHaveLength(4);
    });

    it('deve permitir lembrete sem nenhum horário', () => {
      const habit = Habit.create(buildValidProps());
      habit.setReminders(['08:00']);
      habit.setReminders([]);
      expect(habit.reminders).toEqual([]);
    });

    it('deve rejeitar horário de lembrete inválido', () => {
      const habit = Habit.create(buildValidProps());
      expect(() => habit.setReminders(['25:00'])).toThrow(InvalidReminderTimeError);
      expect(() => habit.setReminders(['8:00'])).toThrow(InvalidReminderTimeError);
      expect(() => habit.setReminders(['abc'])).toThrow(InvalidReminderTimeError);
    });

    it('não deve permitir alterar o type (build/quit)', () => {
      const habit = Habit.create(buildValidProps());
      expect(() => habit.updateType('quit' as any)).toThrow(ImmutableTypeError);
    });

    it('deve atualizar descrição', () => {
      const habit = Habit.create(buildValidProps());
      habit.updateDescription('Nova descrição');
      expect(habit.description).toBe('Nova descrição');
    });

    it('deve remover descrição (setar null)', () => {
      const habit = Habit.create(buildValidProps({ description: 'abc' }));
      habit.updateDescription(null);
      expect(habit.description).toBeNull();
    });
  });

  describe('ciclo de vida', () => {
    it('deve pausar um hábito ativo', () => {
      const habit = Habit.create(buildValidProps());
      habit.pause();
      expect(habit.status).toBe('paused');
    });

    it('deve arquivar um hábito ativo', () => {
      const habit = Habit.create(buildValidProps());
      habit.archive();
      expect(habit.status).toBe('archived');
    });

    it('deve reativar um hábito pausado', () => {
      const habit = Habit.create(buildValidProps());
      habit.pause();
      habit.reactivate();
      expect(habit.status).toBe('active');
    });

    it('deve reativar um hábito arquivado', () => {
      const habit = Habit.create(buildValidProps());
      habit.archive();
      habit.reactivate();
      expect(habit.status).toBe('active');
    });

    it('não deve pausar um hábito já pausado', () => {
      const habit = Habit.create(buildValidProps());
      habit.pause();
      expect(() => habit.pause()).toThrow(InvalidStatusTransitionError);
    });

    it('não deve arquivar um hábito já arquivado', () => {
      const habit = Habit.create(buildValidProps());
      habit.archive();
      expect(() => habit.archive()).toThrow(InvalidStatusTransitionError);
    });

    it('não deve reativar um hábito já ativo', () => {
      const habit = Habit.create(buildValidProps());
      expect(() => habit.reactivate()).toThrow(InvalidStatusTransitionError);
    });
  });

  describe('restore', () => {
    it('deve restaurar um hábito a partir dos dados do banco', () => {
      const now = new Date();
      const habit = Habit.restore({
        id: 'habit-1',
        userId: 'user-1',
        name: 'Exercício',
        description: null,
        type: 'build',
        trackingMode: 'boolean',
        dailyTarget: null,
        targetUnit: null,
        frequency: Frequency.create({ type: 'daily' }),
        goal: null,
        categoryId: null,
        tags: [],
        reminders: [],
        status: 'active',
        trackRelapseIntensity: false,
        trackRelapseTrigger: false,
        createdAt: now,
        updatedAt: now,
      });
      expect(habit.id).toBe('habit-1');
      expect(habit.name).toBe('Exercício');
      expect(habit.status).toBe('active');
    });
  });
});
