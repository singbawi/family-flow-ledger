
import React from 'react';
import { Transaction, Account } from '@/types/finance';
import { formatCurrency } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  account: Account;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, account }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No transactions found
      </div>
    );
  }

  const isCredit = account.type === 'credit';

  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto">
      {transactions.map((transaction) => {
        // For credit accounts, negative is a purchase, positive is a payment
        // For regular accounts, positive is deposit, negative is withdrawal
        let isPositive = transaction.amount > 0;
        if (isCredit) isPositive = !isPositive;

        return (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className={`rounded-full p-1 mr-3 ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPositive ? (
                  <ArrowUp className="h-4 w-4 text-finance-positive" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-finance-negative" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {transaction.description}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div 
              className={`font-semibold ${
                isPositive 
                  ? 'text-finance-positive' 
                  : 'text-finance-negative'
              }`}
            >
              {formatCurrency(Math.abs(transaction.amount))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
