
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/types/finance';
import { formatCurrency } from '@/lib/utils';
import { ArrowUp, ArrowDown, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onSelect: (accountId: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onSelect }) => {
  const isCredit = account.type === 'credit';
  const iconSize = 18;

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200",
        isCredit ? "border-l-4 border-l-finance-purple" : 
          account.type === 'checking' ? "border-l-4 border-l-finance-blue" : 
          "border-l-4 border-l-finance-positive"
      )}
      onClick={() => onSelect(account.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            {account.name}
          </CardTitle>
          <div className="rounded-full p-2 bg-gray-50">
            {isCredit ? (
              <CreditCard size={iconSize} className="text-finance-purple" />
            ) : account.type === 'checking' ? (
              <ArrowDown size={iconSize} className="text-finance-blue" />
            ) : (
              <ArrowUp size={iconSize} className="text-finance-positive" />
            )}
          </div>
        </div>
        <CardDescription>
          {isCredit ? 'Credit Card' : account.type === 'checking' ? 'Checking Account' : 'Savings Account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-2xl font-bold">
            {formatCurrency(account.balance)}
          </div>
          {isCredit && account.goal !== undefined && (
            <div className="text-sm text-gray-500 mt-1">
              Goal: Pay down to {formatCurrency(account.goal)}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500">
        {account.transactions.length > 0 ? (
          <>Last transaction: {new Date(account.transactions[0].date).toLocaleDateString()}</>
        ) : (
          <>No recent transactions</>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccountCard;
