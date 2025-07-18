
"use client";

import { useState } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomListItem } from './CustomListItem';
import { CustomListItemForm } from './CustomListItemForm';
import type { CustomList, ListItem } from '../types';

interface CustomListAccordionProps {
  list: CustomList;
  onUpdateList: (id: string, data: Partial<CustomList>) => Promise<void>;
  onDeleteList: (list: CustomList) => void;
  onAddItem: (listId: string, value: string) => Promise<void>;
  onDeleteItem: (item: ListItem) => void;
}

export function CustomListAccordion({ list, onUpdateList, onDeleteList, onAddItem, onDeleteItem }: CustomListAccordionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(list.title);
  const [editingDescription, setEditingDescription] = useState(list.description || '');

  const handleUpdate = async () => {
    if (!editingTitle.trim()) {
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Ο τίτλος δεν μπορεί να είναι κενός." });
      return;
    }
    try {
      await onUpdateList(list.id, { title: editingTitle, description: editingDescription });
      toast({ title: "Επιτυχία", description: "Η λίστα ενημερώθηκε." });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία ενημέρωσης λίστας." });
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingTitle(list.title);
    setEditingDescription(list.description || '');
  };

  return (
    <AccordionItem value={list.id} className="bg-card/50 rounded-lg border">
      <div className="flex items-center justify-between w-full px-4 py-1">
        {isEditing ? (
          <div className="flex-1 mr-4 py-3">
            <Input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} className="h-8 mb-1" />
            <Input value={editingDescription} onChange={e => setEditingDescription(e.target.value)} className="h-8 text-xs" placeholder="Περιγραφή" />
          </div>
        ) : (
          <AccordionTrigger className="flex-1 text-left py-3">
            <div>
              <h3 className="font-semibold text-base">{list.title}</h3>
              {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
            </div>
          </AccordionTrigger>
        )}
        <div className="flex items-center gap-2 pl-4">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleUpdate}>Αποθήκευση</Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEditing}>Ακύρωση</Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDeleteList(list)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <AccordionContent className="pt-2 pb-4 px-4">
        <CustomListItemForm listId={list.id} onAddItem={onAddItem} />
        <div className="max-h-60 overflow-y-auto pr-2">
          {list.items.map(item => (
            <CustomListItem key={item.id} item={item} onDelete={() => onDeleteItem(item)} />
          ))}
          {list.items.length === 0 && <p className="text-sm text-muted-foreground p-2">Δεν υπάρχουν αντικείμενα σε αυτή τη λίστα.</p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
