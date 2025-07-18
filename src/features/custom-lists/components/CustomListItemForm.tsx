
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/features/toast';

interface CustomListItemFormProps {
  listId: string;
  onAddItem: (listId: string, value: string) => Promise<void>;
}

export function CustomListItemForm({ listId, onAddItem }: CustomListItemFormProps) {
  const { toast } = useToast();
  const [newItemValue, setNewItemValue] = useState('');

  const handleAddItem = async () => {
    const value = newItemValue.trim();
    if (!value) return;

    try {
      await onAddItem(listId, value);
      setNewItemValue('');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία προσθήκης αντικειμένου." });
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Προσθήκη (μεμονωμένα ή με ';' για μαζική)..."
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
      />
      <Button onClick={handleAddItem}><Plus /></Button>
    </div>
  );
}
