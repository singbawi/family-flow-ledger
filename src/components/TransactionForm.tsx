
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/context/FinanceContext';
import { Account } from '@/types/finance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TransactionFormProps {
  selectedAccount: Account;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ selectedAccount }) => {
  const { addTransaction } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>(selectedAccount.type === 'credit' ? 'payment' : 'deposit');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return; // Invalid amount
    }
    
    // For deposits/withdrawals, set the correct sign based on transaction type
    let finalAmount: number;
    if (selectedAccount.type === 'credit') {
      // For credit cards, payment decreases the balance (debt), purchase increases it
      finalAmount = transactionType === 'payment' ? numAmount : -numAmount;
    } else {
      // For checking/savings, deposit increases balance, withdrawal decreases it
      finalAmount = transactionType === 'deposit' ? numAmount : -numAmount;
    }
    
    addTransaction({
      accountId: selectedAccount.id,
      amount: finalAmount,
      description: description || `${transactionType} transaction`,
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add Transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction for {selectedAccount.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {selectedAccount.type === 'credit' ? (
                  <>
                    <SelectItem value="payment">Payment (Reduce Balance)</SelectItem>
                    <SelectItem value="purchase">Purchase (Increase Balance)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${transactionType} description`}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Submit Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
