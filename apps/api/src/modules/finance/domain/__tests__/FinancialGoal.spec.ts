import { FinancialGoal, FinancialGoalStatus } from '../entities/FinancialGoal';
import {
  InvalidFinancialGoalNameError,
  InvalidFinancialGoalAmountError,
  InvalidFinancialGoalStatusTransitionError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Fundo de Emergencia',
    targetAmount: 10000,
    ...overrides,
  };
}

describe('FinancialGoal', () => {
  describe('criacao', () => {
    it('deve criar uma meta financeira com campos obrigatorios', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(goal.id).toBe('');
      expect(goal.userId).toBe('user-1');
      expect(goal.name).toBe('Fundo de Emergencia');
      expect(goal.targetAmount).toBe(10000);
      expect(goal.currentAmount).toBe(0);
      expect(goal.deadline).toBeNull();
      expect(goal.accountIds).toEqual([]);
      expect(goal.status).toBe('in_progress');
      expect(goal.createdAt).toBeInstanceOf(Date);
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar meta com deadline informado', () => {
      const goal = FinancialGoal.create(buildValidProps({ deadline: '2025-12-31' }));

      expect(goal.deadline).toBe('2025-12-31');
    });

    it('deve criar meta com accountIds informados', () => {
      const goal = FinancialGoal.create(buildValidProps({ accountIds: ['acc-1', 'acc-2'] }));

      expect(goal.accountIds).toEqual(['acc-1', 'acc-2']);
    });

    it('deve definir currentAmount como 0', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(goal.currentAmount).toBe(0);
    });

    it('deve definir status como in_progress', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(goal.status).toBe('in_progress');
    });

    it('deve definir deadline como null quando nao informado', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(goal.deadline).toBeNull();
    });

    it('deve definir accountIds como array vazio quando nao informado', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(goal.accountIds).toEqual([]);
    });

    it('deve aceitar deadline null explicitamente', () => {
      const goal = FinancialGoal.create(buildValidProps({ deadline: null }));

      expect(goal.deadline).toBeNull();
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const goal = FinancialGoal.create(buildValidProps());
      const after = new Date();

      expect(goal.id).toBe('');
      expect(goal.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(goal.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(goal.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve rejeitar nome vazio', () => {
      expect(() =>
        FinancialGoal.create(buildValidProps({ name: '' })),
      ).toThrow(InvalidFinancialGoalNameError);
    });

    it('deve rejeitar nome com apenas espacos', () => {
      expect(() =>
        FinancialGoal.create(buildValidProps({ name: '   ' })),
      ).toThrow(InvalidFinancialGoalNameError);
    });

    it('deve rejeitar nome com mais de 200 caracteres', () => {
      const longName = 'a'.repeat(201);
      expect(() =>
        FinancialGoal.create(buildValidProps({ name: longName })),
      ).toThrow(InvalidFinancialGoalNameError);
    });

    it('deve aceitar nome com exatamente 200 caracteres', () => {
      const name = 'a'.repeat(200);
      const goal = FinancialGoal.create(buildValidProps({ name }));

      expect(goal.name).toBe(name);
    });

    it('deve fazer trim no nome', () => {
      const goal = FinancialGoal.create(buildValidProps({ name: '  Viagem  ' }));

      expect(goal.name).toBe('Viagem');
    });

    it('deve rejeitar targetAmount igual a zero', () => {
      expect(() =>
        FinancialGoal.create(buildValidProps({ targetAmount: 0 })),
      ).toThrow(InvalidFinancialGoalAmountError);
    });

    it('deve rejeitar targetAmount negativo', () => {
      expect(() =>
        FinancialGoal.create(buildValidProps({ targetAmount: -100 })),
      ).toThrow(InvalidFinancialGoalAmountError);
    });

    it('deve aceitar targetAmount com valor decimal', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 99.99 }));

      expect(goal.targetAmount).toBe(99.99);
    });
  });

  describe('updateName', () => {
    it('deve atualizar o nome', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.updateName('Viagem Europa');

      expect(goal.name).toBe('Viagem Europa');
    });

    it('deve fazer trim no nome ao atualizar', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.updateName('  Viagem  ');

      expect(goal.name).toBe('Viagem');
    });

    it('deve rejeitar nome vazio na atualizacao', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(() => goal.updateName('')).toThrow(InvalidFinancialGoalNameError);
    });

    it('deve rejeitar nome com mais de 200 caracteres na atualizacao', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(() => goal.updateName('a'.repeat(201))).toThrow(
        InvalidFinancialGoalNameError,
      );
    });

    it('deve atualizar updatedAt ao atualizar o nome', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.updateName('Viagem Europa');

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('updateTargetAmount', () => {
    it('deve atualizar o valor alvo', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.updateTargetAmount(20000);

      expect(goal.targetAmount).toBe(20000);
    });

    it('deve rejeitar valor alvo igual a zero', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(() => goal.updateTargetAmount(0)).toThrow(InvalidFinancialGoalAmountError);
    });

    it('deve rejeitar valor alvo negativo', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(() => goal.updateTargetAmount(-100)).toThrow(InvalidFinancialGoalAmountError);
    });

    it('deve atualizar updatedAt ao atualizar valor alvo', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.updateTargetAmount(20000);

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('updateDeadline', () => {
    it('deve atualizar o deadline', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.updateDeadline('2026-06-30');

      expect(goal.deadline).toBe('2026-06-30');
    });

    it('deve atualizar o deadline para null', () => {
      const goal = FinancialGoal.create(buildValidProps({ deadline: '2025-12-31' }));
      goal.updateDeadline(null);

      expect(goal.deadline).toBeNull();
    });

    it('deve atualizar updatedAt ao atualizar deadline', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.updateDeadline('2026-06-30');

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('addAccount', () => {
    it('deve adicionar uma conta', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.addAccount('acc-1');

      expect(goal.accountIds).toEqual(['acc-1']);
    });

    it('deve adicionar multiplas contas', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.addAccount('acc-1');
      goal.addAccount('acc-2');

      expect(goal.accountIds).toEqual(['acc-1', 'acc-2']);
    });

    it('nao deve adicionar conta duplicada', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.addAccount('acc-1');
      goal.addAccount('acc-1');

      expect(goal.accountIds).toEqual(['acc-1']);
    });

    it('deve atualizar updatedAt ao adicionar conta', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.addAccount('acc-1');

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('removeAccount', () => {
    it('deve remover uma conta', () => {
      const goal = FinancialGoal.create(buildValidProps({ accountIds: ['acc-1', 'acc-2'] }));
      goal.removeAccount('acc-1');

      expect(goal.accountIds).toEqual(['acc-2']);
    });

    it('nao deve lancar erro ao remover conta inexistente', () => {
      const goal = FinancialGoal.create(buildValidProps());

      expect(() => goal.removeAccount('acc-999')).not.toThrow();
    });

    it('deve atualizar updatedAt ao remover conta', () => {
      const goal = FinancialGoal.create(buildValidProps({ accountIds: ['acc-1'] }));
      const originalUpdatedAt = goal.updatedAt;

      goal.removeAccount('acc-1');

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('updateCurrentAmount', () => {
    it('deve atualizar o valor atual', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(5000);

      expect(goal.currentAmount).toBe(5000);
    });

    it('deve marcar como completed quando currentAmount >= targetAmount', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(10000);

      expect(goal.status).toBe('completed');
    });

    it('deve marcar como completed quando currentAmount excede targetAmount', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(15000);

      expect(goal.status).toBe('completed');
    });

    it('nao deve mudar status se currentAmount < targetAmount', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(5000);

      expect(goal.status).toBe('in_progress');
    });

    it('deve atualizar updatedAt ao atualizar valor atual', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.updateCurrentAmount(5000);

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('calculateProgress', () => {
    it('deve calcular progresso como porcentagem', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(5000);

      expect(goal.calculateProgress()).toBe(50);
    });

    it('deve retornar 0 quando currentAmount e 0', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));

      expect(goal.calculateProgress()).toBe(0);
    });

    it('deve retornar 100 quando currentAmount iguala targetAmount', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 10000 }));
      goal.updateCurrentAmount(10000);

      expect(goal.calculateProgress()).toBe(100);
    });

    it('deve limitar progresso a 100 quando currentAmount excede targetAmount', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 15000,
        deadline: null,
        accountIds: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      expect(goal.calculateProgress()).toBe(100);
    });

    it('deve calcular progresso com valores decimais', () => {
      const goal = FinancialGoal.create(buildValidProps({ targetAmount: 300 }));
      goal.updateCurrentAmount(100);

      const progress = goal.calculateProgress();
      expect(progress).toBeCloseTo(33.33, 1);
    });
  });

  describe('complete', () => {
    it('deve completar meta in_progress', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.complete();

      expect(goal.status).toBe('completed');
    });

    it('deve atualizar updatedAt ao completar', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.complete();

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve rejeitar complete quando status nao e in_progress', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 10000,
        deadline: null,
        accountIds: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => goal.complete()).toThrow(InvalidFinancialGoalStatusTransitionError);
    });

    it('deve rejeitar complete quando status e failed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: null,
        accountIds: [],
        status: 'failed',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => goal.complete()).toThrow(InvalidFinancialGoalStatusTransitionError);
    });
  });

  describe('markFailed', () => {
    it('deve marcar meta in_progress como failed', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.markFailed();

      expect(goal.status).toBe('failed');
    });

    it('deve atualizar updatedAt ao marcar como failed', () => {
      const goal = FinancialGoal.create(buildValidProps());
      const originalUpdatedAt = goal.updatedAt;

      goal.markFailed();

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve rejeitar markFailed quando status nao e in_progress', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 10000,
        deadline: null,
        accountIds: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => goal.markFailed()).toThrow(InvalidFinancialGoalStatusTransitionError);
    });

    it('deve rejeitar markFailed quando status e failed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: null,
        accountIds: [],
        status: 'failed',
        createdAt: now,
        updatedAt: now,
      });

      expect(() => goal.markFailed()).toThrow(InvalidFinancialGoalStatusTransitionError);
    });
  });

  describe('checkDeadline', () => {
    it('deve marcar como failed quando deadline esta no passado e status e in_progress', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: '2020-01-01',
        accountIds: [],
        status: 'in_progress',
        createdAt: now,
        updatedAt: now,
      });

      goal.checkDeadline();

      expect(goal.status).toBe('failed');
    });

    it('deve atualizar updatedAt ao mudar status por checkDeadline', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: '2020-01-01',
        accountIds: [],
        status: 'in_progress',
        createdAt: now,
        updatedAt: now,
      });

      const originalUpdatedAt = goal.updatedAt;
      goal.checkDeadline();

      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('nao deve alterar status quando deadline nao esta definido', () => {
      const goal = FinancialGoal.create(buildValidProps());
      goal.checkDeadline();

      expect(goal.status).toBe('in_progress');
    });

    it('nao deve alterar status quando deadline esta no futuro', () => {
      const goal = FinancialGoal.create(buildValidProps({ deadline: '2099-12-31' }));
      goal.checkDeadline();

      expect(goal.status).toBe('in_progress');
    });

    it('nao deve alterar status quando meta ja esta completed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 10000,
        deadline: '2020-01-01',
        accountIds: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      goal.checkDeadline();

      expect(goal.status).toBe('completed');
    });

    it('nao deve alterar status quando meta ja esta failed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Meta',
        targetAmount: 10000,
        currentAmount: 0,
        deadline: '2020-01-01',
        accountIds: [],
        status: 'failed',
        createdAt: now,
        updatedAt: now,
      });

      goal.checkDeadline();

      expect(goal.status).toBe('failed');
    });
  });

  describe('accountIds getter', () => {
    it('deve retornar copia do array de accountIds', () => {
      const goal = FinancialGoal.create(buildValidProps({ accountIds: ['acc-1'] }));

      const ids1 = goal.accountIds;
      const ids2 = goal.accountIds;

      expect(ids1).not.toBe(ids2);
      expect(ids1).toEqual(ids2);
    });
  });

  describe('restore', () => {
    it('deve restaurar uma meta a partir dos dados do banco', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-1',
        userId: 'user-1',
        name: 'Fundo de Emergencia',
        targetAmount: 10000,
        currentAmount: 5000,
        deadline: '2025-12-31',
        accountIds: ['acc-1', 'acc-2'],
        status: 'in_progress',
        createdAt: now,
        updatedAt: now,
      });

      expect(goal.id).toBe('goal-1');
      expect(goal.userId).toBe('user-1');
      expect(goal.name).toBe('Fundo de Emergencia');
      expect(goal.targetAmount).toBe(10000);
      expect(goal.currentAmount).toBe(5000);
      expect(goal.deadline).toBe('2025-12-31');
      expect(goal.accountIds).toEqual(['acc-1', 'acc-2']);
      expect(goal.status).toBe('in_progress');
      expect(goal.createdAt).toBe(now);
      expect(goal.updatedAt).toBe(now);
    });

    it('deve restaurar meta com status completed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-2',
        userId: 'user-1',
        name: 'Meta Completa',
        targetAmount: 5000,
        currentAmount: 5000,
        deadline: null,
        accountIds: [],
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });

      expect(goal.status).toBe('completed');
    });

    it('deve restaurar meta com status failed', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-3',
        userId: 'user-1',
        name: 'Meta Falha',
        targetAmount: 5000,
        currentAmount: 0,
        deadline: '2020-01-01',
        accountIds: [],
        status: 'failed',
        createdAt: now,
        updatedAt: now,
      });

      expect(goal.status).toBe('failed');
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      const goal = FinancialGoal.restore({
        id: 'goal-4',
        userId: 'user-1',
        name: '',
        targetAmount: -100,
        currentAmount: -50,
        deadline: null,
        accountIds: [],
        status: 'in_progress',
        createdAt: now,
        updatedAt: now,
      });

      expect(goal.name).toBe('');
      expect(goal.targetAmount).toBe(-100);
      expect(goal.currentAmount).toBe(-50);
    });
  });
});
