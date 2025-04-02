
import React, { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import AccountCard from '@/components/AccountCard';
import AccountDetail from '@/components/AccountDetail';
import DashboardSummary from '@/components/DashboardSummary';
import TransferForm from '@/components/TransferForm';

const Dashboard = () => {
  const { accounts } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  const selectedAccount = selectedAccountId 
    ? accounts.find(acc => acc.id === selectedAccountId) 
    : null;
    
  const checkingAccounts = accounts.filter(acc => acc.type === 'checking');
  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const creditAccounts = accounts.filter(acc => acc.type === 'credit');

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleBack = () => {
    setSelectedAccountId(null);
  };

  return (
    <div className="container py-6">
      {selectedAccount ? (
        <AccountDetail 
          account={selectedAccount}
          onBack={handleBack}
        />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">Family Flow Ledger</h1>
          
          <div className="mb-6">
            <DashboardSummary />
          </div>
          
          <div className="flex justify-end mb-4">
            <TransferForm />
          </div>
          
          <div className="space-y-6">
            {checkingAccounts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Checking Accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkingAccounts.map(account => (
                    <AccountCard 
                      key={account.id} 
                      account={account}
                      onSelect={handleAccountSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {savingsAccounts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Savings Accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savingsAccounts.map(account => (
                    <AccountCard 
                      key={account.id} 
                      account={account}
                      onSelect={handleAccountSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {creditAccounts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Credit Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditAccounts.map(account => (
                    <AccountCard 
                      key={account.id} 
                      account={account}
                      onSelect={handleAccountSelect}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  );
};

export default Index;
