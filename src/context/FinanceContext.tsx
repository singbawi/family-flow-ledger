import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Account, Transaction, TransactionData, TransferData, AccountType } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

interface FinanceContextType {
  accounts: Account[];
  addTransaction: (data: TransactionData) => void;
  transferMoney: (data: TransferData) => void;
  updateCreditCardBalance: (accountId: string, newBalance: number) => void;
  getTotalBalance: () => number;
  getTotalCreditDebt: () => number;
  addAccount: (name: string, type: AccountType, initialBalance: number) => void;
  deleteAccount: (accountId: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial sample accounts
const initialAccounts: Account[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 2500,
    transactions: [],
  },
  {
    id: '2',
    name: 'Family Savings',
    type: 'savings',
    balance: 10000,
    transactions: [],
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: 1500, // For credit cards, balance represents debt
    transactions: [],
    goal: 0, // Goal for credit card is to reach 0
  },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    // Try to load from localStorage first
    const savedAccounts = localStorage.getItem('familyAccounts');
    return savedAccounts ? JSON.parse(savedAccounts) : initialAccounts;
  });
  
  const { toast } = useToast();

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('familyAccounts', JSON.stringify(accounts));
  }, [accounts]);

  const addTransaction = (data: TransactionData) => {
    const { accountId, amount, description, category } = data;
    
    setAccounts(currentAccounts => {
      const updatedAccounts = currentAccounts.map(account => {
        if (account.id === accountId) {
          const newTransaction: Transaction = {
            id: uuidv4(),
            date: new Date(),
            amount,
            description,
            accountId,
            category
          };
          
          // For credit accounts, positive amounts increase debt (opposite of checking/savings)
          const balanceChange = account.type === 'credit' ? -amount : amount;
          
          return {
            ...account,
            balance: account.balance + balanceChange,
            transactions: [newTransaction, ...account.transactions]
          };
        }
        return account;
      });
      
      return updatedAccounts;
    });

    toast({
      title: "Transaction complete",
      description: `${amount < 0 ? 'Withdrawal' : 'Deposit'} of $${Math.abs(amount)} - ${description}`,
    });
  };

  const transferMoney = (data: TransferData) => {
    const { fromAccountId, toAccountId, amount, description } = data;
    
    if (amount <= 0) {
      toast({
        title: "Transfer failed",
        description: "Transfer amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    setAccounts(currentAccounts => {
      const fromAccount = currentAccounts.find(acc => acc.id === fromAccountId);
      
      // Check if from account has sufficient funds
      if (fromAccount && fromAccount.type !== 'credit' && fromAccount.balance < amount) {
        toast({
          title: "Transfer failed",
          description: "Insufficient funds for transfer",
          variant: "destructive"
        });
        return currentAccounts;
      }
      
      return currentAccounts.map(account => {
        if (account.id === fromAccountId) {
          const newFromTransaction: Transaction = {
            id: uuidv4(),
            date: new Date(),
            amount: -amount,
            description: `Transfer to ${description}`,
            accountId: fromAccountId,
          };
          
          // For credit accounts, negative amount decreases debt
          const balanceChange = account.type === 'credit' ? amount : -amount;
          
          return {
            ...account,
            balance: account.balance + balanceChange,
            transactions: [newFromTransaction, ...account.transactions]
          };
        }
        
        if (account.id === toAccountId) {
          const newToTransaction: Transaction = {
            id: uuidv4(),
            date: new Date(),
            amount: amount,
            description: `Transfer from ${description}`,
            accountId: toAccountId,
          };
          
          // For credit accounts, positive amount increases debt
          const balanceChange = account.type === 'credit' ? -amount : amount;
          
          return {
            ...account,
            balance: account.balance + balanceChange,
            transactions: [newToTransaction, ...account.transactions]
          };
        }
        
        return account;
      });
    });

    toast({
      title: "Transfer complete",
      description: `$${amount} transferred - ${description}`,
    });
  };

  const updateCreditCardBalance = (accountId: string, newBalance: number) => {
    setAccounts(currentAccounts => {
      return currentAccounts.map(account => {
        if (account.id === accountId && account.type === 'credit') {
          // Calculate the adjustment amount for the transaction
          const adjustmentAmount = account.balance - newBalance;
          
          const newTransaction: Transaction = {
            id: uuidv4(),
            date: new Date(),
            amount: adjustmentAmount,
            description: "Weekly balance adjustment",
            accountId,
          };
          
          return {
            ...account,
            balance: newBalance,
            transactions: [newTransaction, ...account.transactions]
          };
        }
        return account;
      });
    });

    toast({
      title: "Credit card balance updated",
      description: `New balance: $${newBalance}`,
    });
  };

  const addAccount = (name: string, type: AccountType, initialBalance: number) => {
    const newAccount: Account = {
      id: uuidv4(),
      name,
      type,
      balance: initialBalance,
      transactions: [],
      ...(type === 'credit' ? { goal: 0 } : {})
    };

    setAccounts(currentAccounts => [...currentAccounts, newAccount]);

    toast({
      title: "Account created",
      description: `New ${type} account "${name}" has been added`,
    });
  };

  const deleteAccount = (accountId: string) => {
    setAccounts(currentAccounts => {
      const accountToDelete = currentAccounts.find(acc => acc.id === accountId);
      
      if (!accountToDelete) {
        toast({
          title: "Deletion failed",
          description: "Account not found",
          variant: "destructive"
        });
        return currentAccounts;
      }

      const updatedAccounts = currentAccounts.filter(acc => acc.id !== accountId);
      
      toast({
        title: "Account deleted",
        description: `${accountToDelete.name} has been removed`,
      });
      
      return updatedAccounts;
    });
  };

  const getTotalBalance = () => {
    return accounts
      .filter(account => account.type !== 'credit')
      .reduce((sum, account) => sum + account.balance, 0);
  };

  const getTotalCreditDebt = () => {
    return accounts
      .filter(account => account.type === 'credit')
      .reduce((sum, account) => sum + account.balance, 0);
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        addTransaction,
        transferMoney,
        updateCreditCardBalance,
        getTotalBalance,
        getTotalCreditDebt,
        addAccount,
        deleteAccount,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
