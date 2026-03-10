import { Recurrence } from '../value-objects/Recurrence';
import { InvalidRecurrenceError } from '../errors/CalendarErrors';

describe('Recurrence', () => {
  describe('validação', () => {
    it('deve criar recorrência diária', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'never' });
      expect(r.type).toBe('daily');
      expect(r.interval).toBe(1);
      expect(r.endType).toBe('never');
    });

    it('deve criar recorrência semanal com dias específicos', () => {
      const r = Recurrence.create({
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endType: 'never',
      });
      expect(r.type).toBe('weekly');
      expect(r.daysOfWeek).toEqual([1, 3, 5]);
    });

    it('deve criar recorrência mensal com dia do mês', () => {
      const r = Recurrence.create({
        type: 'monthly',
        interval: 1,
        dayOfMonth: 15,
        endType: 'never',
      });
      expect(r.type).toBe('monthly');
      expect(r.dayOfMonth).toBe(15);
    });

    it('deve criar recorrência anual', () => {
      const r = Recurrence.create({ type: 'yearly', interval: 1, endType: 'never' });
      expect(r.type).toBe('yearly');
    });

    it('deve criar recorrência customizada com intervalo', () => {
      const r = Recurrence.create({ type: 'custom', interval: 3, endType: 'never' });
      expect(r.type).toBe('custom');
      expect(r.interval).toBe(3);
    });

    it('deve rejeitar intervalo <= 0', () => {
      expect(() =>
        Recurrence.create({ type: 'daily', interval: 0, endType: 'never' }),
      ).toThrow(InvalidRecurrenceError);
      expect(() =>
        Recurrence.create({ type: 'daily', interval: -1, endType: 'never' }),
      ).toThrow(InvalidRecurrenceError);
    });

    it('deve rejeitar daysOfWeek vazio para tipo weekly', () => {
      expect(() =>
        Recurrence.create({ type: 'weekly', interval: 1, daysOfWeek: [], endType: 'never' }),
      ).toThrow(InvalidRecurrenceError);
    });

    it('deve rejeitar dayOfMonth fora de 1-31', () => {
      expect(() =>
        Recurrence.create({ type: 'monthly', interval: 1, dayOfMonth: 0, endType: 'never' }),
      ).toThrow(InvalidRecurrenceError);
      expect(() =>
        Recurrence.create({ type: 'monthly', interval: 1, dayOfMonth: 32, endType: 'never' }),
      ).toThrow(InvalidRecurrenceError);
    });

    it('deve rejeitar endCount <= 0', () => {
      expect(() =>
        Recurrence.create({ type: 'daily', interval: 1, endType: 'after_count', endCount: 0 }),
      ).toThrow(InvalidRecurrenceError);
      expect(() =>
        Recurrence.create({ type: 'daily', interval: 1, endType: 'after_count', endCount: -1 }),
      ).toThrow(InvalidRecurrenceError);
    });

    it('deve rejeitar endDate no passado', () => {
      const pastDate = new Date('2020-01-01');
      expect(() =>
        Recurrence.create({ type: 'daily', interval: 1, endType: 'until_date', endDate: pastDate }),
      ).toThrow(InvalidRecurrenceError);
    });

    it('deve criar com endType after_count', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'after_count', endCount: 10 });
      expect(r.endType).toBe('after_count');
      expect(r.endCount).toBe(10);
    });

    it('deve criar com endType until_date', () => {
      const futureDate = new Date('2030-12-31');
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'until_date', endDate: futureDate });
      expect(r.endType).toBe('until_date');
      expect(r.endDate).toEqual(futureDate);
    });
  });

  describe('geração de ocorrências', () => {
    it('deve calcular próxima ocorrência diária', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'never' });
      const from = new Date('2026-03-09T10:00:00Z');
      const next = r.getNextOccurrence(from);
      expect(next).toEqual(new Date('2026-03-10T10:00:00Z'));
    });

    it('deve respeitar intervalo (ex: a cada 2 semanas)', () => {
      const r = Recurrence.create({ type: 'weekly', interval: 2, daysOfWeek: [1], endType: 'never' });
      const from = new Date('2026-03-09T10:00:00Z'); // Monday
      const next = r.getNextOccurrence(from);
      expect(next).toEqual(new Date('2026-03-23T10:00:00Z'));
    });

    it('deve calcular próxima ocorrência mensal', () => {
      const r = Recurrence.create({ type: 'monthly', interval: 1, dayOfMonth: 15, endType: 'never' });
      const from = new Date('2026-03-09T10:00:00Z');
      const next = r.getNextOccurrence(from);
      expect(next).toEqual(new Date('2026-04-15T10:00:00Z'));
    });

    it('deve calcular próxima ocorrência anual', () => {
      const r = Recurrence.create({ type: 'yearly', interval: 1, endType: 'never' });
      const from = new Date('2026-03-09T10:00:00Z');
      const next = r.getNextOccurrence(from);
      expect(next).toEqual(new Date('2027-03-09T10:00:00Z'));
    });

    it('deve retornar null quando endCount atingido', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'after_count', endCount: 3 });
      const from = new Date('2026-03-09T10:00:00Z');
      const next = r.getNextOccurrence(from, 3);
      expect(next).toBeNull();
    });

    it('deve retornar null quando endDate ultrapassada', () => {
      const r = Recurrence.create({
        type: 'daily',
        interval: 1,
        endType: 'until_date',
        endDate: new Date('2030-06-01'),
      });
      const from = new Date('2030-06-01T10:00:00Z');
      const next = r.getNextOccurrence(from);
      expect(next).toBeNull();
    });
  });

  describe('conversão RRULE', () => {
    it('deve converter recorrência diária para RRULE', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'never' });
      expect(r.toRRule()).toBe('FREQ=DAILY;INTERVAL=1');
    });

    it('deve converter recorrência semanal para RRULE com BYDAY', () => {
      const r = Recurrence.create({ type: 'weekly', interval: 1, daysOfWeek: [1, 3, 5], endType: 'never' });
      expect(r.toRRule()).toBe('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR');
    });

    it('deve converter recorrência mensal para RRULE com BYMONTHDAY', () => {
      const r = Recurrence.create({ type: 'monthly', interval: 1, dayOfMonth: 15, endType: 'never' });
      expect(r.toRRule()).toBe('FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15');
    });

    it('deve preservar INTERVAL na conversão', () => {
      const r = Recurrence.create({ type: 'weekly', interval: 2, daysOfWeek: [1], endType: 'never' });
      expect(r.toRRule()).toContain('INTERVAL=2');
    });

    it('deve preservar COUNT na conversão', () => {
      const r = Recurrence.create({ type: 'daily', interval: 1, endType: 'after_count', endCount: 10 });
      expect(r.toRRule()).toContain('COUNT=10');
    });

    it('deve preservar UNTIL na conversão', () => {
      const r = Recurrence.create({
        type: 'daily',
        interval: 1,
        endType: 'until_date',
        endDate: new Date('2030-12-31'),
      });
      expect(r.toRRule()).toContain('UNTIL=20301231');
    });

    it('deve converter RRULE do Google para Recurrence local', () => {
      const r = Recurrence.fromRRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR');
      expect(r.type).toBe('weekly');
      expect(r.interval).toBe(2);
      expect(r.daysOfWeek).toEqual([1, 3, 5]);
    });

    it('deve converter RRULE com COUNT', () => {
      const r = Recurrence.fromRRule('FREQ=DAILY;INTERVAL=1;COUNT=10');
      expect(r.endType).toBe('after_count');
      expect(r.endCount).toBe(10);
    });

    it('deve converter RRULE com UNTIL', () => {
      const r = Recurrence.fromRRule('FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15;UNTIL=20301231');
      expect(r.endType).toBe('until_date');
      expect(r.endDate).toEqual(new Date('2030-12-31'));
    });
  });
});
