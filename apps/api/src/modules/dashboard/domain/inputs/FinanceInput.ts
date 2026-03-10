export interface AccountInput {
  id: string;
  name: string;
  balance: number;
}

export interface TransactionInput {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryName: string;
  date: Date;
}

export interface BudgetInput {
  id: string;
  month: number;
  year: number;
  totalLimit: number;
  categoryLimits: { categoryName: string; limit: number }[];
}

export interface FinancialGoalInput {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
}
