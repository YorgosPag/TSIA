
"use client";

import { useState } from 'react';
import { useToast } from '@/features/toast';
import { useSeedCustomLists } from '@/features/custom-lists/hooks/useSeedCustomLists';
import { useCustomLists } from '@/features/custom-lists/hooks/useCustomLists';
import { CustomListForm } from '@/features/custom-lists/components/CustomListForm';
import { CustomListAccordion } from '@/features/custom-lists/components/CustomListAccordion';
import { DeleteDialog } from '@/features/custom-lists/components/DeleteDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { TriangleAlert, List, Search } from 'lucide-react';
import type { CustomList } from '@/features/custom-lists/types';

export default function CustomListsPage() {
  useSeedCustomLists(); // Ensures data is seeded on first load
  const { 
    lists, 
    loading, 
    error, 
    createList, 
    updateList, 
    deleteList, 
    addItem, 
    deleteItem 
  } = useCustomLists();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ listId: string; itemId: string; itemName: string; } | null>(null);
  const [listToDelete, setListToDelete] = useState<CustomList | null>(null);

  const handleDeleteListConfirm = async () => {
    if (!listToDelete) return;
    try {
      await deleteList(listToDelete.id);
      toast({ title: "Επιτυχία", description: `Η λίστα "${listToDelete.title}" διαγράφηκε.` });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία διαγραφής της λίστας." });
    } finally {
      setListToDelete(null);
    }
  };

  const handleDeleteItemConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete.listId, itemToDelete.itemId);
      toast({ title: "Επιτυχία", description: "Το αντικείμενο διαγράφηκε." });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία διαγραφής." });
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredLists = lists.filter(list =>
    list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.items.some(item => item.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-3"><List />Προσαρμοσμένες Λίστες</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Διαχειριστείτε τις λίστες επιλογών που χρησιμοποιούνται σε όλη την εφαρμογή.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Σφάλμα</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CustomListForm onSave={createList} />
      
      <Card>
          <CardHeader>
              <CardTitle>Υπάρχουσες Λίστες</CardTitle>
          </CardHeader>
           <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Αναζήτηση σε τίτλο, περιγραφή ή αντικείμενα λίστας..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
                </div>
               {loading ? (
                    <p>Φόρτωση λιστών...</p>
                ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                    {filteredLists.map((list) => (
                      <CustomListAccordion
                        key={list.id}
                        list={list}
                        onUpdateList={updateList}
                        onDeleteList={setListToDelete}
                        onAddItem={addItem}
                        onDeleteItem={(item) => setItemToDelete({listId: list.id, itemId: item.id, itemName: item.value})}
                      />
                    ))}
                </Accordion>
                )}
           </CardContent>
      </Card>
      
      <DeleteDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItemConfirm}
        title="Είστε βέβαιοι για τη διαγραφή;"
        description={`Το αντικείμενο "${itemToDelete?.itemName}" θα διαγραφεί οριστικά. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`}
      />
      
      <DeleteDialog
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={handleDeleteListConfirm}
        title={`Είστε βέβαιοι για τη διαγραφή της λίστας "${listToDelete?.title}"?`}
        description="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Θα διαγραφεί οριστικά ολόκληρη η λίστα μαζί με όλα τα περιεχόμενά της. Βεβαιωθείτε ότι αυτή η λίστα δεν χρησιμοποιείται πουθενά αλλού στην εφαρμογή."
      />
    </main>
  );
}
