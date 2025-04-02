
export type AccountType = 'checking' | 'savings' | 'credit';

export interface Transaction {
  id: string;
  date: Date;
  amount: number; // Positive for deposits, negative for withdrawals
  description: string;
  accountId: string;
  category?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  transactions: Transaction[];
  goal?: number; // For credit cards - goal is to pay off
}

export interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

export interface TransactionData {
  accountId: string;
  amount: number;
  description: string;
  category?: string;
}
