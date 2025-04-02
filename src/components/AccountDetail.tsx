
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/types/finance';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import CreditCardUpdate from './CreditCardUpdate';
import RenameAccountForm from './RenameAccountForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AccountDetailProps {
  account: Account;
  onBack: () => void;
}

const AccountDetail: React.FC<AccountDetailProps> = ({ account, onBack }) => {
  const isCredit = account.type === 'credit';

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-semibold flex items-center">
          {account.name}
          <span className="ml-2">
            <RenameAccountForm 
              accountId={account.id} 
              currentName={account.name} 
            />
          </span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Current Balance</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(account.balance)}
                </div>
              </div>
              
              {isCredit && account.goal !== undefined && (
                <div>
                  <div className="text-sm text-gray-500">Payoff Goal</div>
                  <div className="text-xl font-medium">
                    {formatCurrency(account.goal)}
                  </div>
                </div>
              )}
              
              <div>
                <TransactionForm selectedAccount={account} />
              </div>
              
              {isCredit && (
                <div>
                  <CreditCardUpdate creditAccount={account} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={account.transactions} 
              account={account}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountDetail;
