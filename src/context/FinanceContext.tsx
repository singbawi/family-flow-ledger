
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Account, Transaction, TransactionData, TransferData, AccountType } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DbAccount, DbTransaction } from '@/types/supabase';

interface FinanceContextType {
  accounts: Account[];
  isLoading: boolean;
  addTransaction: (data: TransactionData) => void;
  transferMoney: (data: TransferData) => void;
  updateCreditCardBalance: (accountId: string, newBalance: number) => void;
  getTotalBalance: () => number;
  getTotalCreditDebt: () => number;
  addAccount: (name: string, type: AccountType, initialBalance: number) => void;
  deleteAccount: (accountId: string) => void;
  renameAccount: (accountId: string, newName: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch accounts and transactions from Supabase when auth status changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setAccounts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch all accounts for this user
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .order('created_at', { ascending: false });

        if (accountsError) throw accountsError;

        if (!accountsData || accountsData.length === 0) {
          // If no accounts exist, create default accounts
          const defaultAccounts = await createDefaultAccounts();
          setAccounts(defaultAccounts);
          setIsLoading(false);
          return;
        }

        // Fetch all transactions for this user's accounts
        const accountIds = accountsData.map((account) => account.id);
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .in('account_id', accountIds)
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Map transactions to accounts
        const accountsWithTransactions: Account[] = accountsData.map((account: DbAccount) => {
          const accountTransactions = transactionsData
            ? transactionsData
                .filter((tx: DbTransaction) => tx.account_id === account.id)
                .map(mapDbTransactionToTransaction)
            : [];

          return {
            id: account.id,
            name: account.name,
            type: account.type,
            balance: Number(account.balance),
            transactions: accountTransactions,
            ...(account.goal !== null && { goal: Number(account.goal) }),
          };
        });

        setAccounts(accountsWithTransactions);
      } catch (error: any) {
        toast({
          title: 'Error fetching data',
          description: error.message || 'Failed to load account data',
          variant: 'destructive',
        });
        
        // Fallback to empty accounts
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Helper function to create default accounts for new users
  const createDefaultAccounts = async (): Promise<Account[]> => {
    if (!user) return [];
    
    const defaultAccounts = [
      {
        name: 'Primary Checking',
        type: 'checking' as AccountType,
        balance: 2500,
      },
      {
        name: 'Family Savings',
        type: 'savings' as AccountType,
        balance: 10000,
      },
      {
        name: 'Credit Card',
        type: 'credit' as AccountType,
        balance: 1500,
        goal: 0,
      }
    ];
    
    const accountsWithIds: Account[] = [];
    
    for (const account of defaultAccounts) {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          goal: account.goal,
        })
        .select('*')
        .single();
      
      if (error) {
        toast({
          title: 'Error creating default account',
          description: error.message,
          variant: 'destructive',
        });
        continue;
      }
      
      accountsWithIds.push({
        id: data.id,
        name: data.name,
        type: data.type as AccountType,
        balance: Number(data.balance),
        transactions: [],
        ...(data.goal !== null && { goal: Number(data.goal) }),
      });
    }
    
    return accountsWithIds;
  };

  // Helper to map database transaction to app transaction
  const mapDbTransactionToTransaction = (dbTransaction: DbTransaction): Transaction => {
    return {
      id: dbTransaction.id,
      date: new Date(dbTransaction.date),
      amount: Number(dbTransaction.amount),
      description: dbTransaction.description,
      accountId: dbTransaction.account_id,
      category: dbTransaction.category || undefined,
    };
  };

  const addTransaction = async (data: TransactionData) => {
    const { accountId, amount, description, category } = data;
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    // Find account in local state
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    // Create the transaction
    const newTransaction: Transaction = {
      id: uuidv4(), // Temporary ID, will be replaced by Supabase
      date: new Date(),
      amount,
      description,
      accountId,
      category
    };
    
    // For credit accounts, positive amounts increase debt (opposite of checking/savings)
    const balanceChange = account.type === 'credit' ? -amount : amount;
    const newBalance = account.balance + balanceChange;
    
    try {
      // Insert transaction into Supabase
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          amount,
          description,
          category: category || null,
          date: newTransaction.date.toISOString(),
        })
        .select('*')
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update account balance in Supabase
      const { error: accountError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);
      
      if (accountError) throw accountError;
      
      // Update local state
      setAccounts(currentAccounts => {
        return currentAccounts.map(acc => {
          if (acc.id === accountId) {
            return {
              ...acc,
              balance: newBalance,
              transactions: [
                { ...newTransaction, id: transactionData.id }, // Use ID from Supabase
                ...acc.transactions
              ]
            };
          }
          return acc;
        });
      });
      
      toast({
        title: 'Transaction complete',
        description: `${amount < 0 ? 'Withdrawal' : 'Deposit'} of $${Math.abs(amount)} - ${description}`,
      });
    } catch (error: any) {
      toast({
        title: 'Transaction failed',
        description: error.message || 'An error occurred while processing your transaction',
        variant: 'destructive',
      });
    }
  };

  const transferMoney = async (data: TransferData) => {
    const { fromAccountId, toAccountId, amount, description } = data;
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: 'Transfer failed',
        description: 'Transfer amount must be greater than zero',
        variant: 'destructive'
      });
      return;
    }

    // Find accounts in local state
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);
    
    if (!fromAccount || !toAccount) {
      toast({
        title: 'Transfer failed',
        description: 'One or both accounts not found',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if from account has sufficient funds
    if (fromAccount.type !== 'credit' && fromAccount.balance < amount) {
      toast({
        title: 'Transfer failed',
        description: 'Insufficient funds for transfer',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Create transaction IDs
      const fromTransactionId = uuidv4();
      const toTransactionId = uuidv4();
      
      // For credit accounts, negative amount decreases debt
      const fromBalanceChange = fromAccount.type === 'credit' ? amount : -amount;
      const toBalanceChange = toAccount.type === 'credit' ? -amount : amount;
      
      const newFromBalance = fromAccount.balance + fromBalanceChange;
      const newToBalance = toAccount.balance + toBalanceChange;
      
      // Begin transaction with Supabase
      
      // 1. Create "from" transaction
      const { data: fromTransData, error: fromTransError } = await supabase
        .from('transactions')
        .insert({
          account_id: fromAccountId,
          amount: -amount,
          description: `Transfer to ${description}`,
          date: new Date().toISOString(),
        })
        .select('*')
        .single();
      
      if (fromTransError) throw fromTransError;
      
      // 2. Create "to" transaction
      const { data: toTransData, error: toTransError } = await supabase
        .from('transactions')
        .insert({
          account_id: toAccountId,
          amount: amount,
          description: `Transfer from ${description}`,
          date: new Date().toISOString(),
        })
        .select('*')
        .single();
      
      if (toTransError) throw toTransError;
      
      // 3. Update "from" account balance
      const { error: fromAccountError } = await supabase
        .from('accounts')
        .update({ balance: newFromBalance })
        .eq('id', fromAccountId);
      
      if (fromAccountError) throw fromAccountError;
      
      // 4. Update "to" account balance
      const { error: toAccountError } = await supabase
        .from('accounts')
        .update({ balance: newToBalance })
        .eq('id', toAccountId);
      
      if (toAccountError) throw toAccountError;
      
      // Update local state
      setAccounts(currentAccounts => {
        return currentAccounts.map(acc => {
          if (acc.id === fromAccountId) {
            const newFromTransaction: Transaction = {
              id: fromTransData.id,
              date: new Date(),
              amount: -amount,
              description: `Transfer to ${description}`,
              accountId: fromAccountId,
            };
            
            return {
              ...acc,
              balance: newFromBalance,
              transactions: [newFromTransaction, ...acc.transactions]
            };
          }
          
          if (acc.id === toAccountId) {
            const newToTransaction: Transaction = {
              id: toTransData.id,
              date: new Date(),
              amount: amount,
              description: `Transfer from ${description}`,
              accountId: toAccountId,
            };
            
            return {
              ...acc,
              balance: newToBalance,
              transactions: [newToTransaction, ...acc.transactions]
            };
          }
          
          return acc;
        });
      });
      
      toast({
        title: 'Transfer complete',
        description: `$${amount} transferred - ${description}`,
      });
    } catch (error: any) {
      toast({
        title: 'Transfer failed',
        description: error.message || 'An error occurred during the transfer',
        variant: 'destructive',
      });
    }
  };

  const updateCreditCardBalance = async (accountId: string, newBalance: number) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || account.type !== 'credit') return;
    
    // Calculate the adjustment amount for the transaction
    const adjustmentAmount = account.balance - newBalance;
    
    try {
      // Create adjustment transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          amount: adjustmentAmount,
          description: 'Weekly balance adjustment',
          date: new Date().toISOString(),
        })
        .select('*')
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update account balance
      const { error: accountError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);
      
      if (accountError) throw accountError;
      
      // Update local state
      setAccounts(currentAccounts => {
        return currentAccounts.map(acc => {
          if (acc.id === accountId) {
            const newTransaction: Transaction = {
              id: transactionData.id,
              date: new Date(),
              amount: adjustmentAmount,
              description: 'Weekly balance adjustment',
              accountId,
            };
            
            return {
              ...acc,
              balance: newBalance,
              transactions: [newTransaction, ...acc.transactions]
            };
          }
          return acc;
        });
      });
      
      toast({
        title: 'Credit card balance updated',
        description: `New balance: $${newBalance}`,
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'An error occurred while updating the balance',
        variant: 'destructive',
      });
    }
  };

  const addAccount = async (name: string, type: AccountType, initialBalance: number) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create account in Supabase
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name,
          type,
          balance: initialBalance,
          goal: type === 'credit' ? 0 : null,
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Create local account object
      const newAccount: Account = {
        id: data.id,
        name,
        type,
        balance: initialBalance,
        transactions: [],
        ...(type === 'credit' ? { goal: 0 } : {})
      };
      
      // Update state
      setAccounts(currentAccounts => [...currentAccounts, newAccount]);
      
      toast({
        title: 'Account created',
        description: `New ${type} account "${name}" has been added`,
      });
    } catch (error: any) {
      toast({
        title: 'Account creation failed',
        description: error.message || 'An error occurred while creating the account',
        variant: 'destructive',
      });
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    const accountToDelete = accounts.find(acc => acc.id === accountId);
    if (!accountToDelete) {
      toast({
        title: 'Deletion failed',
        description: 'Account not found',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Delete account in Supabase (this will cascade delete transactions)
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) throw error;
      
      // Update local state
      setAccounts(currentAccounts => currentAccounts.filter(acc => acc.id !== accountId));
      
      toast({
        title: 'Account deleted',
        description: `${accountToDelete.name} has been removed`,
      });
    } catch (error: any) {
      toast({
        title: 'Deletion failed',
        description: error.message || 'An error occurred while deleting the account',
        variant: 'destructive',
      });
    }
  };

  const renameAccount = async (accountId: string, newName: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to perform this action',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newName.trim()) {
      toast({
        title: 'Rename failed',
        description: 'Account name cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Update account name in Supabase
      const { error } = await supabase
        .from('accounts')
        .update({ name: newName })
        .eq('id', accountId);
      
      if (error) throw error;
      
      // Update local state
      setAccounts(currentAccounts => {
        return currentAccounts.map(account => {
          if (account.id === accountId) {
            toast({
              title: 'Account renamed',
              description: `"${account.name}" is now "${newName}"`,
            });
            
            return {
              ...account,
              name: newName
            };
          }
          return account;
        });
      });
    } catch (error: any) {
      toast({
        title: 'Rename failed',
        description: error.message || 'An error occurred while renaming the account',
        variant: 'destructive',
      });
    }
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
        isLoading,
        addTransaction,
        transferMoney,
        updateCreditCardBalance,
        getTotalBalance,
        getTotalCreditDebt,
        addAccount,
        deleteAccount,
        renameAccount,
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
