import { Frequency } from '../value-objects/Frequency';
import { InvalidFrequencyError } from '../errors/HabitErrors';

describe('Frequency', () => {
  describe('daily', () => {
    it('deve criar frequência diária', () => {
      const freq = Frequency.create({ type: 'daily' });
      expect(freq.type).toBe('daily');
    });

    it('deve marcar todos os dias como due', () => {
      const freq = Frequency.create({ type: 'daily' });
      const habitCreatedAt = new Date(2026, 0, 1);
      for (let i = 0; i < 7; i++) {
        const date = new Date(2026, 2, 1 + i);
        expect(freq.isDueOn(date, habitCreatedAt)).toBe(true);
      }
    });
  });

  describe('weekly', () => {
    it('deve aceitar timesPerWeek entre 1 e 7', () => {
      for (let i = 1; i <= 7; i++) {
        const freq = Frequency.create({ type: 'weekly', timesPerWeek: i });
        expect(freq.timesPerWeek).toBe(i);
      }
    });

    it('deve rejeitar timesPerWeek menor que 1', () => {
      expect(() => Frequency.create({ type: 'weekly', timesPerWeek: 0 }))
        .toThrow(InvalidFrequencyError);
    });

    it('deve rejeitar timesPerWeek maior que 7', () => {
      expect(() => Frequency.create({ type: 'weekly', timesPerWeek: 8 }))
        .toThrow(InvalidFrequencyError);
    });

    it('deve rejeitar weekly sem timesPerWeek', () => {
      expect(() => Frequency.create({ type: 'weekly' } as any))
        .toThrow(InvalidFrequencyError);
    });
  });

  describe('specific_days', () => {
    it('deve marcar apenas dias selecionados como due', () => {
      const freq = Frequency.create({ type: 'specific_days', days: [1, 3, 5] }); // seg, qua, sex
      const habitCreatedAt = new Date(2026, 0, 1);

      // 2026-03-09 é segunda (1)
      const monday = new Date(2026, 2, 9);
      expect(freq.isDueOn(monday, habitCreatedAt)).toBe(true);

      // 2026-03-10 é terça (2)
      const tuesday = new Date(2026, 2, 10);
      expect(freq.isDueOn(tuesday, habitCreatedAt)).toBe(false);

      // 2026-03-11 é quarta (3)
      const wednesday = new Date(2026, 2, 11);
      expect(freq.isDueOn(wednesday, habitCreatedAt)).toBe(true);
    });

    it('deve rejeitar lista vazia', () => {
      expect(() => Frequency.create({ type: 'specific_days', days: [] }))
        .toThrow(InvalidFrequencyError);
    });

    it('deve deduplicar e ordenar dias', () => {
      const freq = Frequency.create({ type: 'specific_days', days: [5, 1, 3, 1, 5] });
      expect(freq.days).toEqual([1, 3, 5]);
    });

    it('deve rejeitar valores fora de 0-6', () => {
      expect(() => Frequency.create({ type: 'specific_days', days: [7] }))
        .toThrow(InvalidFrequencyError);
      expect(() => Frequency.create({ type: 'specific_days', days: [-1] }))
        .toThrow(InvalidFrequencyError);
    });

    it('deve rejeitar specific_days sem days', () => {
      expect(() => Frequency.create({ type: 'specific_days' } as any))
        .toThrow(InvalidFrequencyError);
    });
  });

  describe('interval', () => {
    it('deve marcar como due a cada N dias a partir da criação', () => {
      const freq = Frequency.create({ type: 'interval', everyNDays: 3 });
      const habitCreatedAt = new Date(2026, 2, 1);

      // dia 0 (criação) = due
      expect(freq.isDueOn(new Date(2026, 2, 1), habitCreatedAt)).toBe(true);
      // dia 1 = não due
      expect(freq.isDueOn(new Date(2026, 2, 2), habitCreatedAt)).toBe(false);
      // dia 2 = não due
      expect(freq.isDueOn(new Date(2026, 2, 3), habitCreatedAt)).toBe(false);
      // dia 3 = due
      expect(freq.isDueOn(new Date(2026, 2, 4), habitCreatedAt)).toBe(true);
      // dia 6 = due
      expect(freq.isDueOn(new Date(2026, 2, 7), habitCreatedAt)).toBe(true);
    });

    it('deve rejeitar intervalo <= 0', () => {
      expect(() => Frequency.create({ type: 'interval', everyNDays: 0 }))
        .toThrow(InvalidFrequencyError);
      expect(() => Frequency.create({ type: 'interval', everyNDays: -2 }))
        .toThrow(InvalidFrequencyError);
    });

    it('deve rejeitar interval sem everyNDays', () => {
      expect(() => Frequency.create({ type: 'interval' } as any))
        .toThrow(InvalidFrequencyError);
    });
  });

  describe('tipo inválido', () => {
    it('deve rejeitar tipo desconhecido', () => {
      expect(() => Frequency.create({ type: 'monthly' as any }))
        .toThrow(InvalidFrequencyError);
    });
  });

  describe('serialização', () => {
    it('deve serializar e restaurar corretamente', () => {
      const freq = Frequency.create({ type: 'specific_days', days: [0, 2, 4] });
      const raw = freq.toJSON();
      const restored = Frequency.restore(raw);
      expect(restored.type).toBe('specific_days');
      expect(restored.days).toEqual([0, 2, 4]);
    });
  });
});
