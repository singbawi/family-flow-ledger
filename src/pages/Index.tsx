
import React, { useState } from 'react';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import AccountCard from '@/components/AccountCard';
import AccountDetail from '@/components/AccountDetail';
import DashboardSummary from '@/components/DashboardSummary';
import TransferForm from '@/components/TransferForm';
import AddAccountForm from '@/components/AddAccountForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { accounts, deleteAccount } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  
  const selectedAccount = selectedAccountId 
    ? accounts.find(acc => acc.id === selectedAccountId) 
    : null;
    
  const checkingAccounts = accounts.filter(acc => acc.type === 'checking');
  const savingsAccounts = accounts.filter(acc => acc.type === 'savings');
  const creditAccounts = accounts.filter(acc => acc.type === 'credit');

  const handleAccountSelect = (accountId: string) => {
    if (!showDeleteButtons) {
      setSelectedAccountId(accountId);
    }
  };

  const handleBack = () => {
    setSelectedAccountId(null);
  };
  
  const toggleDeleteMode = () => {
    setShowDeleteButtons(!showDeleteButtons);
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
          
          <div className="flex justify-end mb-4 gap-2">
            <Button 
              variant={showDeleteButtons ? "destructive" : "outline"}
              size="sm"
              onClick={toggleDeleteMode}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {showDeleteButtons ? 'Cancel' : 'Manage Accounts'}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <AddAccountForm onClose={() => {}} />
            </Dialog>
            
            <TransferForm />
          </div>
          
          <div className="space-y-6">
            {checkingAccounts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Checking Accounts</h2>
                  {!showDeleteButtons && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                          <span className="ml-1">Add Checking</span>
                        </Button>
                      </DialogTrigger>
                      <AddAccountForm onClose={() => {}} />
                    </Dialog>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkingAccounts.map(account => (
                    <div key={account.id} className="relative">
                      {showDeleteButtons && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="destructive" 
                              className="absolute top-2 right-2 z-10 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the {account.name} account and all its transactions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAccount(account.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      <AccountCard 
                        account={account}
                        onSelect={handleAccountSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {savingsAccounts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Savings Accounts</h2>
                  {!showDeleteButtons && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                          <span className="ml-1">Add Savings</span>
                        </Button>
                      </DialogTrigger>
                      <AddAccountForm onClose={() => {}} />
                    </Dialog>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savingsAccounts.map(account => (
                    <div key={account.id} className="relative">
                      {showDeleteButtons && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="destructive" 
                              className="absolute top-2 right-2 z-10 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the {account.name} account and all its transactions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAccount(account.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      <AccountCard 
                        account={account}
                        onSelect={handleAccountSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {creditAccounts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Credit Cards</h2>
                  {!showDeleteButtons && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                          <span className="ml-1">Add Credit Card</span>
                        </Button>
                      </DialogTrigger>
                      <AddAccountForm onClose={() => {}} />
                    </Dialog>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creditAccounts.map(account => (
                    <div key={account.id} className="relative">
                      {showDeleteButtons && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="destructive" 
                              className="absolute top-2 right-2 z-10 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the {account.name} account and all its transactions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteAccount(account.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      
                      <AccountCard 
                        account={account}
                        onSelect={handleAccountSelect}
                      />
                    </div>
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
