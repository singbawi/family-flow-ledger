
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/context/FinanceContext';
import { Account } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

interface CreditCardUpdateProps {
  creditAccount: Account;
}

const CreditCardUpdate: React.FC<CreditCardUpdateProps> = ({ creditAccount }) => {
  const { updateCreditCardBalance } = useFinance();
  const [newBalance, setNewBalance] = useState<string>(creditAccount.balance.toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numBalance = parseFloat(newBalance);
    if (isNaN(numBalance) || numBalance < 0) {
      return; // Invalid amount
    }
    
    updateCreditCardBalance(creditAccount.id, numBalance);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Credit Balance</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Credit Card Balance</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="text-sm text-gray-500">
            Current Balance: {formatCurrency(creditAccount.balance)}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newBalance">New Balance ($)</Label>
            <Input
              id="newBalance"
              type="number"
              min="0"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Update Balance
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardUpdate;
