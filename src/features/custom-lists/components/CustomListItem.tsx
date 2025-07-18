
"use client";

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { ListItem } from '../types';

interface CustomListItemProps {
  item: ListItem;
  onDelete: () => void;
}

export function CustomListItem({ item, onDelete }: CustomListItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
      <span>{item.value}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
