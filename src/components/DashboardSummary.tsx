
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';

const DashboardSummary = () => {
  const { getTotalBalance, getTotalCreditDebt } = useFinance();
  
  const totalBalance = getTotalBalance();
  const totalCreditDebt = getTotalCreditDebt();
  const netWorth = totalBalance - totalCreditDebt;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md text-gray-600">Total Cash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-finance-positive">
            {formatCurrency(totalBalance)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md text-gray-600">Credit Card Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-finance-negative">
            {formatCurrency(totalCreditDebt)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md text-gray-600">Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-finance-positive' : 'text-finance-negative'}`}>
            {formatCurrency(netWorth)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
