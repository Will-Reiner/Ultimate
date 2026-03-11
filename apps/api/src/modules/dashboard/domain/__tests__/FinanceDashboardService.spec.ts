import { FinanceDashboardService } from '../services/FinanceDashboardService';
import {
  AccountInput,
  TransactionInput,
  BudgetInput,
  FinancialGoalInput,
} from '../inputs/FinanceInput';

function buildAccount(overrides: Partial<AccountInput> = {}): AccountInput {
  return { id: 'a1', name: 'Account', balance: 1000, ...overrides };
}

function buildTransaction(
  overrides: Partial<TransactionInput> = {},
): TransactionInput {
  return {
    id: 't1',
    type: 'expense',
    amount: 100,
    categoryName: 'Food',
    date: new Date(2026, 0, 15),
    ...overrides,
  };
}

function buildBudget(overrides: Partial<BudgetInput> = {}): BudgetInput {
  return {
    id: 'b1',
    month: 1,
    year: 2026,
    totalLimit: 5000,
    categoryLimits: [{ categoryName: 'Food', limit: 1000 }],
    ...overrides,
  };
}

function buildGoal(
  overrides: Partial<FinancialGoalInput> = {},
): FinancialGoalInput {
  return {
    id: 'g1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 2500,
    deadline: new Date(2026, 11, 31),
    ...overrides,
  };
}

describe('FinanceDashboardService', () => {
  // ---- computeNetBalance ----
  describe('computeNetBalance', () => {
    it('deve somar os saldos de todas as contas', () => {
      const accounts = [
        buildAccount({ balance: 1000 }),
        buildAccount({ id: 'a2', balance: 2500 }),
        buildAccount({ id: 'a3', balance: -300 }),
      ];

      const result = FinanceDashboardService.computeNetBalance(accounts);

      expect(result).toBe(3200);
    });

    it('deve retornar 0 quando não há contas', () => {
      const result = FinanceDashboardService.computeNetBalance([]);

      expect(result).toBe(0);
    });

    it('deve retornar o saldo de uma única conta', () => {
      const result = FinanceDashboardService.computeNetBalance([
        buildAccount({ balance: 500 }),
      ]);

      expect(result).toBe(500);
    });
  });

  // ---- computeIncomeVsExpense ----
  describe('computeIncomeVsExpense', () => {
    it('deve calcular receita, despesa e líquido para o mês/ano', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'income',
          amount: 5000,
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 1200,
          date: new Date(2026, 0, 15),
        }),
        buildTransaction({
          id: 't3',
          type: 'expense',
          amount: 800,
          date: new Date(2026, 0, 20),
        }),
      ];

      const result = FinanceDashboardService.computeIncomeVsExpense(
        transactions,
        1,
        2026,
      );

      expect(result.income).toBe(5000);
      expect(result.expense).toBe(2000);
      expect(result.net).toBe(3000);
    });

    it('deve filtrar transações pelo mês e ano corretos', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'income',
          amount: 3000,
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'income',
          amount: 1000,
          date: new Date(2026, 1, 10),
        }),
        buildTransaction({
          id: 't3',
          type: 'expense',
          amount: 500,
          date: new Date(2025, 0, 10),
        }),
      ];

      const result = FinanceDashboardService.computeIncomeVsExpense(
        transactions,
        1,
        2026,
      );

      expect(result.income).toBe(3000);
      expect(result.expense).toBe(0);
      expect(result.net).toBe(3000);
    });

    it('deve retornar zeros quando não há transações no período', () => {
      const result = FinanceDashboardService.computeIncomeVsExpense([], 1, 2026);

      expect(result.income).toBe(0);
      expect(result.expense).toBe(0);
      expect(result.net).toBe(0);
    });

    it('deve calcular net negativo quando despesas superam receitas', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'income',
          amount: 1000,
          date: new Date(2026, 2, 5),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 3000,
          date: new Date(2026, 2, 10),
        }),
      ];

      const result = FinanceDashboardService.computeIncomeVsExpense(
        transactions,
        3,
        2026,
      );

      expect(result.net).toBe(-2000);
    });
  });

  // ---- computeExpenseByCategory ----
  describe('computeExpenseByCategory', () => {
    it('deve agrupar despesas por categoria e ordenar por total decrescente', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 500,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 300,
          categoryName: 'Transport',
          date: new Date(2026, 0, 12),
        }),
        buildTransaction({
          id: 't3',
          type: 'expense',
          amount: 200,
          categoryName: 'Food',
          date: new Date(2026, 0, 20),
        }),
        buildTransaction({
          id: 't4',
          type: 'expense',
          amount: 1000,
          categoryName: 'Rent',
          date: new Date(2026, 0, 1),
        }),
      ];

      const result = FinanceDashboardService.computeExpenseByCategory(
        transactions,
        1,
        2026,
      );

      expect(result).toEqual([
        { categoryName: 'Rent', total: 1000 },
        { categoryName: 'Food', total: 700 },
        { categoryName: 'Transport', total: 300 },
      ]);
    });

    it('deve ignorar transações de receita', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'income',
          amount: 5000,
          categoryName: 'Salary',
          date: new Date(2026, 0, 5),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 200,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
      ];

      const result = FinanceDashboardService.computeExpenseByCategory(
        transactions,
        1,
        2026,
      );

      expect(result).toEqual([{ categoryName: 'Food', total: 200 }]);
    });

    it('deve filtrar pelo mês e ano corretos', () => {
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 100,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 200,
          categoryName: 'Food',
          date: new Date(2026, 1, 10),
        }),
      ];

      const result = FinanceDashboardService.computeExpenseByCategory(
        transactions,
        1,
        2026,
      );

      expect(result).toEqual([{ categoryName: 'Food', total: 100 }]);
    });

    it('deve retornar array vazio quando não há despesas no período', () => {
      const result = FinanceDashboardService.computeExpenseByCategory(
        [],
        1,
        2026,
      );

      expect(result).toEqual([]);
    });
  });

  // ---- computeBudgetUsage ----
  describe('computeBudgetUsage', () => {
    it('deve calcular gasto e porcentagem por categoria do orçamento', () => {
      const budget = buildBudget({
        month: 1,
        year: 2026,
        categoryLimits: [
          { categoryName: 'Food', limit: 1000 },
          { categoryName: 'Transport', limit: 500 },
        ],
      });
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 400,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'expense',
          amount: 300,
          categoryName: 'Food',
          date: new Date(2026, 0, 20),
        }),
        buildTransaction({
          id: 't3',
          type: 'expense',
          amount: 150,
          categoryName: 'Transport',
          date: new Date(2026, 0, 15),
        }),
      ];

      const result = FinanceDashboardService.computeBudgetUsage(
        budget,
        transactions,
      );

      expect(result).toEqual([
        { categoryName: 'Food', limit: 1000, spent: 700, percentage: 70 },
        { categoryName: 'Transport', limit: 500, spent: 150, percentage: 30 },
      ]);
    });

    it('deve retornar 0 de gasto quando não há transações para a categoria', () => {
      const budget = buildBudget({
        month: 1,
        year: 2026,
        categoryLimits: [{ categoryName: 'Entertainment', limit: 300 }],
      });

      const result = FinanceDashboardService.computeBudgetUsage(budget, []);

      expect(result).toEqual([
        {
          categoryName: 'Entertainment',
          limit: 300,
          spent: 0,
          percentage: 0,
        },
      ]);
    });

    it('deve retornar porcentagem 0 quando o limite é 0', () => {
      const budget = buildBudget({
        month: 1,
        year: 2026,
        categoryLimits: [{ categoryName: 'Food', limit: 0 }],
      });
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 100,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
      ];

      const result = FinanceDashboardService.computeBudgetUsage(
        budget,
        transactions,
      );

      expect(result).toEqual([
        { categoryName: 'Food', limit: 0, spent: 100, percentage: 0 },
      ]);
    });

    it('deve filtrar apenas transações de despesa do mês/ano do orçamento', () => {
      const budget = buildBudget({
        month: 1,
        year: 2026,
        categoryLimits: [{ categoryName: 'Food', limit: 1000 }],
      });
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 200,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
        buildTransaction({
          id: 't2',
          type: 'income',
          amount: 500,
          categoryName: 'Food',
          date: new Date(2026, 0, 15),
        }),
        buildTransaction({
          id: 't3',
          type: 'expense',
          amount: 300,
          categoryName: 'Food',
          date: new Date(2026, 1, 10),
        }),
      ];

      const result = FinanceDashboardService.computeBudgetUsage(
        budget,
        transactions,
      );

      expect(result).toEqual([
        { categoryName: 'Food', limit: 1000, spent: 200, percentage: 20 },
      ]);
    });

    it('deve permitir porcentagem acima de 100 quando ultrapassar o limite', () => {
      const budget = buildBudget({
        month: 1,
        year: 2026,
        categoryLimits: [{ categoryName: 'Food', limit: 100 }],
      });
      const transactions = [
        buildTransaction({
          id: 't1',
          type: 'expense',
          amount: 150,
          categoryName: 'Food',
          date: new Date(2026, 0, 10),
        }),
      ];

      const result = FinanceDashboardService.computeBudgetUsage(
        budget,
        transactions,
      );

      expect(result).toEqual([
        { categoryName: 'Food', limit: 100, spent: 150, percentage: 150 },
      ]);
    });
  });

  // ---- computeGoalProgress ----
  describe('computeGoalProgress', () => {
    it('deve calcular porcentagem e valor restante para cada meta', () => {
      const goals = [
        buildGoal({
          id: 'g1',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 2500,
          deadline: new Date(2026, 11, 31),
        }),
        buildGoal({
          id: 'g2',
          name: 'Vacation',
          targetAmount: 5000,
          currentAmount: 5000,
          deadline: null,
        }),
      ];

      const result = FinanceDashboardService.computeGoalProgress(goals);

      expect(result).toEqual([
        {
          goalId: 'g1',
          name: 'Emergency Fund',
          percentage: 25,
          remaining: 7500,
          deadline: new Date(2026, 11, 31),
        },
        {
          goalId: 'g2',
          name: 'Vacation',
          percentage: 100,
          remaining: 0,
          deadline: null,
        },
      ]);
    });

    it('deve retornar porcentagem 0 quando targetAmount é 0', () => {
      const goals = [
        buildGoal({ targetAmount: 0, currentAmount: 0 }),
      ];

      const result = FinanceDashboardService.computeGoalProgress(goals);

      expect(result[0].percentage).toBe(0);
      expect(result[0].remaining).toBe(0);
    });

    it('deve limitar remaining a 0 quando currentAmount excede targetAmount', () => {
      const goals = [
        buildGoal({ targetAmount: 1000, currentAmount: 1500 }),
      ];

      const result = FinanceDashboardService.computeGoalProgress(goals);

      expect(result[0].remaining).toBe(0);
      expect(result[0].percentage).toBe(150);
    });

    it('deve retornar array vazio quando não há metas', () => {
      const result = FinanceDashboardService.computeGoalProgress([]);

      expect(result).toEqual([]);
    });

    it('deve preservar deadline null', () => {
      const goals = [buildGoal({ deadline: null })];

      const result = FinanceDashboardService.computeGoalProgress(goals);

      expect(result[0].deadline).toBeNull();
    });
  });
});
