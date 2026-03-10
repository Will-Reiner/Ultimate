import { Priority, PriorityLevel } from '../value-objects/Priority';
import { InvalidPriorityError } from '../errors/TaskErrors';

describe('Priority', () => {
  describe('create', () => {
    it.each(['none', 'low', 'medium', 'high', 'urgent'])(
      'deve aceitar valor "%s"',
      (level) => {
        const priority = Priority.create(level);
        expect(priority.level).toBe(level);
      },
    );

    it('deve rejeitar valor invalido', () => {
      expect(() => Priority.create('critical')).toThrow(InvalidPriorityError);
      expect(() => Priority.create('')).toThrow(InvalidPriorityError);
      expect(() => Priority.create('HIGH')).toThrow(InvalidPriorityError);
    });
  });

  describe('weight', () => {
    it.each([
      ['none', 0],
      ['low', 1],
      ['medium', 2],
      ['high', 3],
      ['urgent', 4],
    ] as [string, number][])(
      'deve retornar weight correto para level "%s" (weight=%i)',
      (level, expectedWeight) => {
        const priority = Priority.create(level as string);
        expect(priority.weight).toBe(expectedWeight);
      },
    );
  });

  describe('isHigherThan', () => {
    it('deve ordenar: urgent > high > medium > low > none', () => {
      const none = Priority.create('none');
      const low = Priority.create('low');
      const medium = Priority.create('medium');
      const high = Priority.create('high');
      const urgent = Priority.create('urgent');

      expect(urgent.isHigherThan(high)).toBe(true);
      expect(high.isHigherThan(medium)).toBe(true);
      expect(medium.isHigherThan(low)).toBe(true);
      expect(low.isHigherThan(none)).toBe(true);

      expect(none.isHigherThan(low)).toBe(false);
      expect(low.isHigherThan(medium)).toBe(false);
      expect(medium.isHigherThan(high)).toBe(false);
      expect(high.isHigherThan(urgent)).toBe(false);

      expect(medium.isHigherThan(medium)).toBe(false);
    });
  });

  describe('restore', () => {
    it('deve restaurar priority sem validacao', () => {
      const priority = Priority.restore('high');
      expect(priority.level).toBe('high');
      expect(priority.weight).toBe(3);
    });
  });
});
