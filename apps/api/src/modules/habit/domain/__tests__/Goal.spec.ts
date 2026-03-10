import { Goal } from '../value-objects/Goal';
import { InvalidGoalError } from '../errors/HabitErrors';

describe('Goal', () => {
  describe('meta com prazo (deadline)', () => {
    it('deve criar meta com valor alvo, unidade e data limite', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 30,
        targetUnit: 'dias',
        deadline: new Date(2026, 5, 1), // futuro
      });
      expect(goal.type).toBe('deadline');
      expect(goal.targetValue).toBe(30);
      expect(goal.targetUnit).toBe('dias');
      expect(goal.status).toBe('in_progress');
    });

    it('deve calcular progresso como % do target', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 100,
        targetUnit: 'páginas',
        deadline: new Date(2026, 11, 31),
      });
      expect(goal.calculateProgress(25)).toBe(25);
      expect(goal.calculateProgress(50)).toBe(50);
      expect(goal.calculateProgress(100)).toBe(100);
      expect(goal.calculateProgress(150)).toBe(100); // cap at 100
    });

    it('deve marcar como completada ao atingir target antes do prazo', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 10,
        targetUnit: 'sessões',
        deadline: new Date(2026, 11, 31),
      });
      const evaluated = goal.evaluate(10, new Date(2026, 5, 1));
      expect(evaluated.status).toBe('completed');
    });

    it('deve marcar como falhada ao passar do prazo sem atingir', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 10,
        targetUnit: 'sessões',
        deadline: new Date(2026, 5, 1), // junho 2026 — futuro na criação
      });
      // Avaliar depois do deadline, sem ter atingido
      const evaluated = goal.evaluate(5, new Date(2026, 7, 1)); // agosto
      expect(evaluated.status).toBe('failed');
    });

    it('deve rejeitar deadline no passado na criação', () => {
      expect(() =>
        Goal.create({
          type: 'deadline',
          targetValue: 10,
          targetUnit: 'dias',
          deadline: new Date(2020, 0, 1),
        }),
      ).toThrow(InvalidGoalError);
    });

    it('deve rejeitar deadline sem targetValue', () => {
      expect(() =>
        Goal.create({
          type: 'deadline',
          targetValue: 0,
          targetUnit: 'dias',
          deadline: new Date(2026, 11, 31),
        }),
      ).toThrow(InvalidGoalError);
    });

    it('deve rejeitar deadline sem targetUnit', () => {
      expect(() =>
        Goal.create({
          type: 'deadline',
          targetValue: 10,
          targetUnit: '',
          deadline: new Date(2026, 11, 31),
        }),
      ).toThrow(InvalidGoalError);
    });

    it('não deve alterar status se já completed', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 10,
        targetUnit: 'sessões',
        deadline: new Date(2026, 11, 31),
      });
      const completed = goal.evaluate(10, new Date(2026, 5, 1));
      // Mesmo avaliando após deadline com valor baixo, status permanece completed
      const reEvaluated = completed.evaluate(5, new Date(2027, 0, 1));
      expect(reEvaluated.status).toBe('completed');
    });
  });

  describe('meta contínua (ongoing)', () => {
    it('deve criar meta sem prazo', () => {
      const goal = Goal.create({
        type: 'ongoing',
        targetValue: 1000,
        targetUnit: 'km',
      });
      expect(goal.type).toBe('ongoing');
      expect(goal.deadline).toBeNull();
      expect(goal.status).toBe('in_progress');
    });

    it('deve calcular progresso acumulativo', () => {
      const goal = Goal.create({
        type: 'ongoing',
        targetValue: 1000,
        targetUnit: 'km',
      });
      expect(goal.calculateProgress(500)).toBe(50);
    });

    it('deve marcar como completada ao atingir target', () => {
      const goal = Goal.create({
        type: 'ongoing',
        targetValue: 100,
        targetUnit: 'treinos',
      });
      const evaluated = goal.evaluate(100, new Date());
      expect(evaluated.status).toBe('completed');
    });

    it('nunca deve marcar como falhada (não tem prazo)', () => {
      const goal = Goal.create({
        type: 'ongoing',
        targetValue: 100,
        targetUnit: 'treinos',
      });
      // Mesmo muito tempo depois, sem atingir, não falha
      const evaluated = goal.evaluate(10, new Date(2030, 0, 1));
      expect(evaluated.status).toBe('in_progress');
    });
  });

  describe('tipo inválido', () => {
    it('deve rejeitar tipo desconhecido', () => {
      expect(() =>
        Goal.create({ type: 'monthly' as any, targetValue: 10, targetUnit: 'x' }),
      ).toThrow(InvalidGoalError);
    });
  });

  describe('serialização', () => {
    it('deve serializar e restaurar corretamente', () => {
      const goal = Goal.create({
        type: 'deadline',
        targetValue: 50,
        targetUnit: 'páginas',
        deadline: new Date(2026, 11, 31),
      });
      const raw = goal.toJSON();
      const restored = Goal.restore(raw);
      expect(restored.type).toBe('deadline');
      expect(restored.targetValue).toBe(50);
      expect(restored.targetUnit).toBe('páginas');
      expect(restored.status).toBe('in_progress');
    });
  });
});
