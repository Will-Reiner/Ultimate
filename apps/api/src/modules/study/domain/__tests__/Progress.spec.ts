import { Progress } from '../value-objects/Progress';
import { InvalidProgressError } from '../errors/StudyErrors';

describe('Progress', () => {
  describe('simple', () => {
    it('deve criar com currentValue = 0', () => {
      const progress = Progress.create({ type: 'simple' });
      expect(progress.type).toBe('simple');
      expect(progress.currentValue).toBe(0);
    });

    it('deve não ter totalValue', () => {
      const progress = Progress.create({ type: 'simple' });
      expect(progress.totalValue).toBeNull();
    });
  });

  describe('percentage', () => {
    it('deve criar com currentValue entre 0 e 100', () => {
      const progress = Progress.create({ type: 'percentage', currentValue: 50 });
      expect(progress.type).toBe('percentage');
      expect(progress.currentValue).toBe(50);
    });

    it('deve rejeitar valor negativo', () => {
      expect(() =>
        Progress.create({ type: 'percentage', currentValue: -1 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve rejeitar valor acima de 100', () => {
      expect(() =>
        Progress.create({ type: 'percentage', currentValue: 101 }),
      ).toThrow(InvalidProgressError);
    });
  });

  describe('chapters', () => {
    it('deve criar com currentValue e totalValue', () => {
      const progress = Progress.create({ type: 'chapters', currentValue: 3, totalValue: 10 });
      expect(progress.type).toBe('chapters');
      expect(progress.currentValue).toBe(3);
      expect(progress.totalValue).toBe(10);
    });

    it('deve calcular percentual corretamente', () => {
      const progress = Progress.create({ type: 'chapters', currentValue: 3, totalValue: 10 });
      expect(progress.getPercentage()).toBe(30);
    });

    it('deve rejeitar totalValue <= 0', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: 0, totalValue: 0 }),
      ).toThrow(InvalidProgressError);
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: 0, totalValue: -1 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve rejeitar currentValue negativo', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: -1, totalValue: 10 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve rejeitar currentValue > totalValue', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: 11, totalValue: 10 }),
      ).toThrow(InvalidProgressError);
    });
  });

  describe('restore', () => {
    it('deve restaurar progresso a partir de dados brutos', () => {
      const progress = Progress.restore({ type: 'chapters', currentValue: 5, totalValue: 20 });
      expect(progress.type).toBe('chapters');
      expect(progress.currentValue).toBe(5);
      expect(progress.totalValue).toBe(20);
    });
  });
});
