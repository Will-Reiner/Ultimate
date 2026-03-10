import { Mood } from '../value-objects/Mood';
import { InvalidMoodLevelError } from '../errors/JournalErrors';

describe('Mood', () => {
  describe('criação', () => {
    it.each([1, 2, 3, 4, 5])('deve criar mood com level %i', (level) => {
      const mood = Mood.create(level);
      expect(mood.level).toBe(level);
    });

    it('deve rejeitar level menor que 1', () => {
      expect(() => Mood.create(0)).toThrow(InvalidMoodLevelError);
    });

    it('deve rejeitar level maior que 5', () => {
      expect(() => Mood.create(6)).toThrow(InvalidMoodLevelError);
    });

    it('deve rejeitar level não inteiro', () => {
      expect(() => Mood.create(2.5)).toThrow(InvalidMoodLevelError);
      expect(() => Mood.create(1.1)).toThrow(InvalidMoodLevelError);
    });

    it('deve rejeitar level negativo', () => {
      expect(() => Mood.create(-1)).toThrow(InvalidMoodLevelError);
    });
  });

  describe('labels', () => {
    it.each([
      [1, 'péssimo'],
      [2, 'ruim'],
      [3, 'neutro'],
      [4, 'bom'],
      [5, 'ótimo'],
    ] as const)('deve mapear level %i para "%s"', (level, expectedLabel) => {
      const mood = Mood.create(level);
      expect(mood.label).toBe(expectedLabel);
    });
  });

  describe('restore', () => {
    it('deve restaurar mood sem validação', () => {
      const mood = Mood.restore(3);
      expect(mood.level).toBe(3);
      expect(mood.label).toBe('neutro');
    });
  });
});
