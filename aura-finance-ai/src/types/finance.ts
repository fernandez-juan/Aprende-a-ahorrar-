export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  monthlyIncome: number;
  currency: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  ticketImageUrl?: string;
  smartNotes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon: string;
}

export interface Investment {
  id?: string;
  userId: string;
  assetName: string;
  symbol: string;
  initialValue: number;
  currentValue: number;
  purchaseDate: string;
  type: string;
}

export interface FinancialInsight {
  type: 'prediction' | 'saving' | 'alert' | 'investment';
  title: string;
  message: string;
  impact: 'positive' | 'negative' | 'neutral';
  meta?: any;
}
