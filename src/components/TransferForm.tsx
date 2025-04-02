
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinance } from '@/context/FinanceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const TransferForm = () => {
  const { accounts, transferMoney } = useFinance();
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter accounts for the from dropdown (can transfer from any account)
  const fromAccounts = accounts;
  
  // Filter accounts for the to dropdown (exclude the currently selected 'from' account)
  const toAccounts = accounts.filter(acc => acc.id !== fromAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccountId || !toAccountId) {
      return; // Need both accounts
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return; // Invalid amount
    }
    
    // Get account names for the description
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);
    
    transferMoney({
      fromAccountId,
      toAccountId,
      amount: numAmount,
      description: description || `Transfer from ${fromAccount?.name} to ${toAccount?.name}`,
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Transfer Money</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fromAccount">From Account</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger id="fromAccount">
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {fromAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type === 'credit' ? 'pay credit' : account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toAccount">To Account</Label>
            <Select 
              value={toAccountId} 
              onValueChange={setToAccountId}
              disabled={!fromAccountId}
            >
              <SelectTrigger id="toAccount">
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {toAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type === 'credit' ? 'pay credit' : account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transferAmount">Amount ($)</Label>
            <Input
              id="transferAmount"
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
            <Label htmlFor="transferDescription">Description (Optional)</Label>
            <Input
              id="transferDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transfer description"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!fromAccountId || !toAccountId || !amount}
          >
            Complete Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferForm;
