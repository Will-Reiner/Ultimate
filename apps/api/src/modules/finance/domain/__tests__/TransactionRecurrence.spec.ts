import { TransactionRecurrence } from '../value-objects/TransactionRecurrence';
import { InvalidTransactionRecurrenceError } from '../errors/FinanceErrors';

const buildValidProps = () => ({
  frequency: 'monthly' as const,
  startDate: '2026-03-09',
});

describe('TransactionRecurrence', () => {
  describe('criacao', () => {
    it('deve criar TransactionRecurrence com props validas', () => {
      const tr = TransactionRecurrence.create(buildValidProps());

      expect(tr.frequency).toBe('monthly');
      expect(tr.nextOccurrence).toBeDefined();
      expect(tr.endDate).toBeNull();
    });

    it('deve aceitar todas as frequencias validas', () => {
      const frequencies = ['daily', 'weekly', 'monthly', 'yearly'] as const;

      for (const frequency of frequencies) {
        const tr = TransactionRecurrence.create({ frequency, startDate: '2026-03-09' });
        expect(tr.frequency).toBe(frequency);
      }
    });

    it('deve calcular nextOccurrence a partir de startDate', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'daily',
        startDate: '2026-03-09',
      });
      expect(tr.nextOccurrence).toBe('2026-03-10');
    });

    it('deve aceitar endDate posterior a startDate', () => {
      const tr = TransactionRecurrence.create({
        ...buildValidProps(),
        endDate: '2026-12-31',
      });
      expect(tr.endDate).toBe('2026-12-31');
    });

    it('deve rejeitar frequencia invalida', () => {
      expect(() =>
        TransactionRecurrence.create({
          frequency: 'biweekly' as any,
          startDate: '2026-03-09',
        }),
      ).toThrow(InvalidTransactionRecurrenceError);
    });

    it('deve rejeitar endDate anterior a startDate', () => {
      expect(() =>
        TransactionRecurrence.create({
          ...buildValidProps(),
          endDate: '2026-01-01',
        }),
      ).toThrow(InvalidTransactionRecurrenceError);
    });

    it('deve rejeitar endDate igual a startDate', () => {
      expect(() =>
        TransactionRecurrence.create({
          ...buildValidProps(),
          endDate: '2026-03-09',
        }),
      ).toThrow(InvalidTransactionRecurrenceError);
    });
  });

  describe('restore', () => {
    it('deve restaurar TransactionRecurrence sem validacao', () => {
      const tr = TransactionRecurrence.restore({
        frequency: 'weekly',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
        nextOccurrence: '2026-01-08',
      });

      expect(tr.frequency).toBe('weekly');
      expect(tr.endDate).toBe('2026-06-30');
      expect(tr.nextOccurrence).toBe('2026-01-08');
    });

    it('deve restaurar sem endDate', () => {
      const tr = TransactionRecurrence.restore({
        frequency: 'monthly',
        startDate: '2026-01-01',
        nextOccurrence: '2026-02-01',
      });

      expect(tr.endDate).toBeNull();
    });
  });

  describe('calculateNextOccurrence', () => {
    it('deve calcular proxima ocorrencia diaria', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'daily',
        startDate: '2026-03-09',
      });
      const next = tr.calculateNextOccurrence('2026-03-15');
      expect(next).toBe('2026-03-16');
    });

    it('deve calcular proxima ocorrencia semanal', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'weekly',
        startDate: '2026-03-09',
      });
      const next = tr.calculateNextOccurrence('2026-03-09');
      expect(next).toBe('2026-03-16');
    });

    it('deve calcular proxima ocorrencia mensal', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'monthly',
        startDate: '2026-03-09',
      });
      const next = tr.calculateNextOccurrence('2026-03-09');
      expect(next).toBe('2026-04-09');
    });

    it('deve calcular proxima ocorrencia anual', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'yearly',
        startDate: '2026-03-09',
      });
      const next = tr.calculateNextOccurrence('2026-03-09');
      expect(next).toBe('2027-03-09');
    });

    it('deve tratar corretamente mudanca de mes', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'daily',
        startDate: '2026-01-01',
      });
      const next = tr.calculateNextOccurrence('2026-01-31');
      expect(next).toBe('2026-02-01');
    });

    it('deve tratar corretamente mudanca de ano', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'monthly',
        startDate: '2026-01-01',
      });
      const next = tr.calculateNextOccurrence('2026-12-01');
      expect(next).toBe('2027-01-01');
    });
  });

  describe('toJSON', () => {
    it('deve retornar representacao JSON correta com endDate', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'monthly',
        startDate: '2026-03-09',
        endDate: '2026-12-31',
      });

      const json = tr.toJSON();
      expect(json.frequency).toBe('monthly');
      expect(json.startDate).toBe('2026-03-09');
      expect(json.endDate).toBe('2026-12-31');
      expect(json.nextOccurrence).toBe('2026-04-09');
    });

    it('deve retornar representacao JSON correta sem endDate', () => {
      const tr = TransactionRecurrence.create({
        frequency: 'daily',
        startDate: '2026-03-09',
      });

      const json = tr.toJSON();
      expect(json.frequency).toBe('daily');
      expect(json.startDate).toBe('2026-03-09');
      expect(json.endDate).toBeNull();
      expect(json.nextOccurrence).toBe('2026-03-10');
    });
  });
});
