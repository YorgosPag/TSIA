
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/features/toast';
import { Plus } from 'lucide-react';
import type { CustomList } from '../types';

interface CustomListFormProps {
  onSave: (data: Omit<CustomList, 'id' | 'items'>, items: string[]) => Promise<void>;
}

export function CustomListForm({ onSave }: CustomListFormProps) {
  const { toast } = useToast();
  const [newListTitle, setNewListTitle] = useState('');
  const [newListItems, setNewListItems] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const handleCreateList = async () => {
    if (!newListTitle.trim()) {
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Ο τίτλος της λίστας είναι υποχρεωτικός." });
      return;
    }

    try {
      const itemsToAdd = newListItems.split(';').map(item => item.trim()).filter(Boolean);
      await onSave(
        { title: newListTitle, description: newListDescription },
        itemsToAdd
      );

      toast({ title: "Επιτυχία", description: `Η λίστα "${newListTitle}" δημιουργήθηκε.` });
      setNewListTitle('');
      setNewListItems('');
      setNewListDescription('');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία δημιουργίας λίστας." });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Δημιουργία Νέας Λίστας</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="newListTitle">Τίτλος Λίστας (π.χ. Τύποι Έργων)</Label>
          <Input id="newListTitle" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Ορατό όνομα λίστας" />
        </div>
        <div>
          <Label htmlFor="newListDescription">Περιγραφή (Προαιρετικό)</Label>
          <Input id="newListDescription" value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} placeholder="Μια σύντομη περιγραφή του σκοπού της λίστας." />
        </div>
        <div>
          <Label htmlFor="newListItems">Αντικείμενα Λίστας (Προαιρετικό)</Label>
          <Textarea id="newListItems" value={newListItems} onChange={(e) => setNewListItems(e.target.value)} placeholder="Προσθήκη αντικειμένων, χωρισμένα με ερωτηματικό (;) για μαζική καταχώρηση." />
        </div>
        <Button onClick={handleCreateList}><Plus className="mr-2 h-4 w-4" />Δημιουργία Λίστας</Button>
      </CardContent>
    </Card>
  );
}
