import {
  AccountInput,
  TransactionInput,
  BudgetInput,
  FinancialGoalInput,
} from '../inputs/FinanceInput';

export class FinanceDashboardService {
  static computeNetBalance(accounts: AccountInput[]): number {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  static computeIncomeVsExpense(
    transactions: TransactionInput[],
    month: number,
    year: number,
  ): { income: number; expense: number; net: number } {
    const filtered = transactions.filter(
      (t) => t.date.getMonth() + 1 === month && t.date.getFullYear() === year,
    );

    let income = 0;
    let expense = 0;

    for (const t of filtered) {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }

    return { income, expense, net: income - expense };
  }

  static computeExpenseByCategory(
    transactions: TransactionInput[],
    month: number,
    year: number,
  ): { categoryName: string; total: number }[] {
    const filtered = transactions.filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getMonth() + 1 === month &&
        t.date.getFullYear() === year,
    );

    const categoryTotals: Record<string, number> = {};

    for (const t of filtered) {
      categoryTotals[t.categoryName] =
        (categoryTotals[t.categoryName] || 0) + t.amount;
    }

    return Object.entries(categoryTotals)
      .map(([categoryName, total]) => ({ categoryName, total }))
      .sort((a, b) => b.total - a.total);
  }

  static computeBudgetUsage(
    budget: BudgetInput,
    transactions: TransactionInput[],
  ): {
    categoryName: string;
    limit: number;
    spent: number;
    percentage: number;
  }[] {
    const expensesInPeriod = transactions.filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getMonth() + 1 === budget.month &&
        t.date.getFullYear() === budget.year,
    );

    return budget.categoryLimits.map((cat) => {
      const spent = expensesInPeriod
        .filter((t) => t.categoryName === cat.categoryName)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = cat.limit === 0 ? 0 : (spent / cat.limit) * 100;

      return {
        categoryName: cat.categoryName,
        limit: cat.limit,
        spent,
        percentage,
      };
    });
  }

  static computeGoalProgress(
    goals: FinancialGoalInput[],
  ): {
    goalId: string;
    name: string;
    percentage: number;
    remaining: number;
    deadline: Date | null;
  }[] {
    return goals.map((goal) => {
      const percentage =
        goal.targetAmount === 0
          ? 0
          : (goal.currentAmount / goal.targetAmount) * 100;

      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

      return {
        goalId: goal.id,
        name: goal.name,
        percentage,
        remaining,
        deadline: goal.deadline,
      };
    });
  }
}
