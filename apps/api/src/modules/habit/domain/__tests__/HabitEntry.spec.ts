import { HabitEntry } from '../entities/HabitEntry';
import {
  InvalidEntryValueError,
  InvalidIntensityError,
  UnauthorizedTrackingFieldError,
} from '../errors/HabitErrors';

describe('HabitEntry', () => {
  describe('check-in (type build)', () => {
    it('deve registrar check-in booleano (valor 1)', () => {
      const entry = HabitEntry.createCheckIn({
        habitId: 'habit-1',
        date: '2026-03-09',
        value: 1,
      });
      expect(entry.entryType).toBe('check_in');
      expect(entry.value).toBe(1);
      expect(entry.date).toBe('2026-03-09');
    });

    it('deve registrar check-in quantitativo com valor > 0', () => {
      const entry = HabitEntry.createCheckIn({
        habitId: 'habit-1',
        date: '2026-03-09',
        value: 8,
      });
      expect(entry.value).toBe(8);
    });

    it('deve rejeitar check-in com valor <= 0', () => {
      expect(() =>
        HabitEntry.createCheckIn({
          habitId: 'habit-1',
          date: '2026-03-09',
          value: 0,
        }),
      ).toThrow(InvalidEntryValueError);

      expect(() =>
        HabitEntry.createCheckIn({
          habitId: 'habit-1',
          date: '2026-03-09',
          value: -1,
        }),
      ).toThrow(InvalidEntryValueError);
    });

    it('deve permitir nota opcional no check-in', () => {
      const entry = HabitEntry.createCheckIn({
        habitId: 'habit-1',
        date: '2026-03-09',
        value: 1,
        note: 'Completei antes do almoço',
      });
      expect(entry.note).toBe('Completei antes do almoço');
    });

    it('deve permitir check-in sem nota', () => {
      const entry = HabitEntry.createCheckIn({
        habitId: 'habit-1',
        date: '2026-03-09',
        value: 1,
      });
      expect(entry.note).toBeNull();
    });
  });

  describe('recaída (type quit)', () => {
    it('deve registrar recaída', () => {
      const entry = HabitEntry.createRelapse({
        habitId: 'habit-1',
        date: '2026-03-09',
        trackRelapseIntensity: false,
        trackRelapseTrigger: false,
      });
      expect(entry.entryType).toBe('relapse');
      expect(entry.value).toBe(1);
    });

    it('deve registrar intensidade quando hábito tem tracking de intensidade habilitado', () => {
      const entry = HabitEntry.createRelapse({
        habitId: 'habit-1',
        date: '2026-03-09',
        trackRelapseIntensity: true,
        trackRelapseTrigger: false,
        intensity: 7,
      });
      expect(entry.intensity).toBe(7);
    });

    it('deve rejeitar intensidade quando hábito não tem tracking habilitado', () => {
      expect(() =>
        HabitEntry.createRelapse({
          habitId: 'habit-1',
          date: '2026-03-09',
          trackRelapseIntensity: false,
          trackRelapseTrigger: false,
          intensity: 5,
        }),
      ).toThrow(UnauthorizedTrackingFieldError);
    });

    it('deve validar intensidade entre 1 e 10', () => {
      expect(() =>
        HabitEntry.createRelapse({
          habitId: 'habit-1',
          date: '2026-03-09',
          trackRelapseIntensity: true,
          trackRelapseTrigger: false,
          intensity: 0,
        }),
      ).toThrow(InvalidIntensityError);

      expect(() =>
        HabitEntry.createRelapse({
          habitId: 'habit-1',
          date: '2026-03-09',
          trackRelapseIntensity: true,
          trackRelapseTrigger: false,
          intensity: 11,
        }),
      ).toThrow(InvalidIntensityError);
    });

    it('deve registrar gatilho quando hábito tem tracking de gatilho habilitado', () => {
      const entry = HabitEntry.createRelapse({
        habitId: 'habit-1',
        date: '2026-03-09',
        trackRelapseIntensity: false,
        trackRelapseTrigger: true,
        trigger: 'Estresse no trabalho',
      });
      expect(entry.trigger).toBe('Estresse no trabalho');
    });

    it('deve rejeitar gatilho quando hábito não tem tracking habilitado', () => {
      expect(() =>
        HabitEntry.createRelapse({
          habitId: 'habit-1',
          date: '2026-03-09',
          trackRelapseIntensity: false,
          trackRelapseTrigger: false,
          trigger: 'Estresse',
        }),
      ).toThrow(UnauthorizedTrackingFieldError);
    });

    it('deve permitir nota opcional na recaída', () => {
      const entry = HabitEntry.createRelapse({
        habitId: 'habit-1',
        date: '2026-03-09',
        trackRelapseIntensity: false,
        trackRelapseTrigger: false,
        note: 'Foi difícil hoje',
      });
      expect(entry.note).toBe('Foi difícil hoje');
    });

    it('deve permitir recaída com intensidade e gatilho ao mesmo tempo', () => {
      const entry = HabitEntry.createRelapse({
        habitId: 'habit-1',
        date: '2026-03-09',
        trackRelapseIntensity: true,
        trackRelapseTrigger: true,
        intensity: 8,
        trigger: 'Festa com amigos',
      });
      expect(entry.intensity).toBe(8);
      expect(entry.trigger).toBe('Festa com amigos');
    });
  });

  describe('restore', () => {
    it('deve restaurar uma entry a partir dos dados do banco', () => {
      const entry = HabitEntry.restore({
        id: 'entry-1',
        habitId: 'habit-1',
        date: '2026-03-09',
        entryType: 'check_in',
        value: 1,
        note: null,
        intensity: null,
        trigger: null,
        createdAt: new Date(),
      });
      expect(entry.id).toBe('entry-1');
      expect(entry.entryType).toBe('check_in');
    });
  });
});
