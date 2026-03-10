import { Budget } from '../entities/Budget';
import { CategoryLimit } from '../value-objects/CategoryLimit';
import {
  InvalidBudgetLimitError,
  InvalidBudgetMonthError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    month: '2025-03',
    ...overrides,
  };
}

describe('Budget', () => {
  describe('criacao', () => {
    it('deve criar um orcamento com campos obrigatorios', () => {
      const budget = Budget.create(buildValidProps());

      expect(budget.id).toBe('');
      expect(budget.userId).toBe('user-1');
      expect(budget.month).toBe('2025-03');
      expect(budget.generalLimit).toBeNull();
      expect(budget.categoryLimits).toEqual([]);
      expect(budget.createdAt).toBeInstanceOf(Date);
      expect(budget.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar orcamento com generalLimit informado', () => {
      const budget = Budget.create(buildValidProps({ generalLimit: 5000 }));

      expect(budget.generalLimit).toBe(5000);
    });

    it('deve criar orcamento com categoryLimits informados', () => {
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 200 });
      const budget = Budget.create(buildValidProps({ categoryLimits: [cl] }));

      expect(budget.categoryLimits).toHaveLength(1);
      expect(budget.categoryLimits[0].categoryId).toBe('cat-1');
      expect(budget.categoryLimits[0].limit).toBe(200);
    });

    it('deve definir generalLimit como null quando nao informado', () => {
      const budget = Budget.create(buildValidProps());

      expect(budget.generalLimit).toBeNull();
    });

    it('deve definir categoryLimits como array vazio quando nao informado', () => {
      const budget = Budget.create(buildValidProps());

      expect(budget.categoryLimits).toEqual([]);
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const budget = Budget.create(buildValidProps());
      const after = new Date();

      expect(budget.id).toBe('');
      expect(budget.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(budget.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(budget.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(budget.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve aceitar mes no formato valido YYYY-MM', () => {
      const budget = Budget.create(buildValidProps({ month: '2024-01' }));

      expect(budget.month).toBe('2024-01');
    });

    it('deve aceitar mes com dezembro', () => {
      const budget = Budget.create(buildValidProps({ month: '2024-12' }));

      expect(budget.month).toBe('2024-12');
    });

    it('deve rejeitar mes com formato invalido (apenas um digito)', () => {
      expect(() =>
        Budget.create(buildValidProps({ month: '2024-1' })),
      ).toThrow(InvalidBudgetMonthError);
    });

    it('deve rejeitar mes com formato invalido (ano com dois digitos)', () => {
      expect(() =>
        Budget.create(buildValidProps({ month: '24-01' })),
      ).toThrow(InvalidBudgetMonthError);
    });

    it('deve rejeitar mes com formato invalido (texto)', () => {
      expect(() =>
        Budget.create(buildValidProps({ month: 'abc' })),
      ).toThrow(InvalidBudgetMonthError);
    });

    it('deve rejeitar mes com formato invalido (vazio)', () => {
      expect(() =>
        Budget.create(buildValidProps({ month: '' })),
      ).toThrow(InvalidBudgetMonthError);
    });

    it('deve rejeitar mes com formato invalido (data completa)', () => {
      expect(() =>
        Budget.create(buildValidProps({ month: '2024-01-15' })),
      ).toThrow(InvalidBudgetMonthError);
    });

    it('deve rejeitar generalLimit igual a zero', () => {
      expect(() =>
        Budget.create(buildValidProps({ generalLimit: 0 })),
      ).toThrow(InvalidBudgetLimitError);
    });

    it('deve rejeitar generalLimit negativo', () => {
      expect(() =>
        Budget.create(buildValidProps({ generalLimit: -100 })),
      ).toThrow(InvalidBudgetLimitError);
    });

    it('deve aceitar generalLimit com valor decimal', () => {
      const budget = Budget.create(buildValidProps({ generalLimit: 99.99 }));

      expect(budget.generalLimit).toBe(99.99);
    });

    it('deve aceitar generalLimit null explicitamente', () => {
      const budget = Budget.create(buildValidProps({ generalLimit: null }));

      expect(budget.generalLimit).toBeNull();
    });
  });

  describe('updateGeneralLimit', () => {
    it('deve atualizar o limite geral', () => {
      const budget = Budget.create(buildValidProps());
      budget.updateGeneralLimit(3000);

      expect(budget.generalLimit).toBe(3000);
    });

    it('deve atualizar o limite geral para null', () => {
      const budget = Budget.create(buildValidProps({ generalLimit: 5000 }));
      budget.updateGeneralLimit(null);

      expect(budget.generalLimit).toBeNull();
    });

    it('deve rejeitar limite geral igual a zero', () => {
      const budget = Budget.create(buildValidProps());

      expect(() => budget.updateGeneralLimit(0)).toThrow(InvalidBudgetLimitError);
    });

    it('deve rejeitar limite geral negativo', () => {
      const budget = Budget.create(buildValidProps());

      expect(() => budget.updateGeneralLimit(-100)).toThrow(InvalidBudgetLimitError);
    });

    it('deve atualizar updatedAt ao atualizar limite geral', () => {
      const budget = Budget.create(buildValidProps());
      const originalUpdatedAt = budget.updatedAt;

      budget.updateGeneralLimit(3000);

      expect(budget.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('addCategoryLimit', () => {
    it('deve adicionar um limite por categoria', () => {
      const budget = Budget.create(buildValidProps());
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });

      budget.addCategoryLimit(cl);

      expect(budget.categoryLimits).toHaveLength(1);
      expect(budget.categoryLimits[0].categoryId).toBe('cat-1');
      expect(budget.categoryLimits[0].limit).toBe(500);
    });

    it('deve adicionar multiplos limites por categoria', () => {
      const budget = Budget.create(buildValidProps());
      const cl1 = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      const cl2 = CategoryLimit.create({ categoryId: 'cat-2', limit: 300 });

      budget.addCategoryLimit(cl1);
      budget.addCategoryLimit(cl2);

      expect(budget.categoryLimits).toHaveLength(2);
    });

    it('deve substituir limite existente para mesma categoria', () => {
      const budget = Budget.create(buildValidProps());
      const cl1 = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      const cl2 = CategoryLimit.create({ categoryId: 'cat-1', limit: 800 });

      budget.addCategoryLimit(cl1);
      budget.addCategoryLimit(cl2);

      expect(budget.categoryLimits).toHaveLength(1);
      expect(budget.categoryLimits[0].limit).toBe(800);
    });

    it('deve atualizar updatedAt ao adicionar limite por categoria', () => {
      const budget = Budget.create(buildValidProps());
      const originalUpdatedAt = budget.updatedAt;
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });

      budget.addCategoryLimit(cl);

      expect(budget.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('removeCategoryLimit', () => {
    it('deve remover limite por categoria existente', () => {
      const budget = Budget.create(buildValidProps());
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      budget.addCategoryLimit(cl);

      budget.removeCategoryLimit('cat-1');

      expect(budget.categoryLimits).toHaveLength(0);
    });

    it('nao deve lancar erro ao remover limite inexistente', () => {
      const budget = Budget.create(buildValidProps());

      expect(() => budget.removeCategoryLimit('cat-999')).not.toThrow();
    });

    it('deve atualizar updatedAt ao remover limite por categoria', () => {
      const budget = Budget.create(buildValidProps());
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      budget.addCategoryLimit(cl);
      const originalUpdatedAt = budget.updatedAt;

      budget.removeCategoryLimit('cat-1');

      expect(budget.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('getCategoryLimit', () => {
    it('deve retornar limite por categoria existente', () => {
      const budget = Budget.create(buildValidProps());
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      budget.addCategoryLimit(cl);

      const found = budget.getCategoryLimit('cat-1');

      expect(found).toBeDefined();
      expect(found!.categoryId).toBe('cat-1');
      expect(found!.limit).toBe(500);
    });

    it('deve retornar undefined para categoria inexistente', () => {
      const budget = Budget.create(buildValidProps());

      const found = budget.getCategoryLimit('cat-999');

      expect(found).toBeUndefined();
    });
  });

  describe('categoryLimits getter', () => {
    it('deve retornar copia do array de categoryLimits', () => {
      const budget = Budget.create(buildValidProps());
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 500 });
      budget.addCategoryLimit(cl);

      const limits1 = budget.categoryLimits;
      const limits2 = budget.categoryLimits;

      expect(limits1).not.toBe(limits2);
      expect(limits1).toEqual(limits2);
    });
  });

  describe('restore', () => {
    it('deve restaurar um orcamento a partir dos dados do banco', () => {
      const now = new Date();
      const cl = CategoryLimit.restore({ categoryId: 'cat-1', limit: 500 });
      const budget = Budget.restore({
        id: 'budget-1',
        userId: 'user-1',
        month: '2025-03',
        generalLimit: 5000,
        categoryLimits: [cl],
        createdAt: now,
        updatedAt: now,
      });

      expect(budget.id).toBe('budget-1');
      expect(budget.userId).toBe('user-1');
      expect(budget.month).toBe('2025-03');
      expect(budget.generalLimit).toBe(5000);
      expect(budget.categoryLimits).toHaveLength(1);
      expect(budget.createdAt).toBe(now);
      expect(budget.updatedAt).toBe(now);
    });

    it('deve restaurar orcamento com generalLimit null', () => {
      const now = new Date();
      const budget = Budget.restore({
        id: 'budget-2',
        userId: 'user-1',
        month: '2025-03',
        generalLimit: null,
        categoryLimits: [],
        createdAt: now,
        updatedAt: now,
      });

      expect(budget.generalLimit).toBeNull();
      expect(budget.categoryLimits).toEqual([]);
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      const budget = Budget.restore({
        id: 'budget-3',
        userId: 'user-1',
        month: 'invalid-month',
        generalLimit: -100,
        categoryLimits: [],
        createdAt: now,
        updatedAt: now,
      });

      expect(budget.month).toBe('invalid-month');
      expect(budget.generalLimit).toBe(-100);
    });
  });
});
