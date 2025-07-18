
"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Entry {
  id: number;
  name: string;
  isEditing: boolean;
  editedName: string;
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nextId, setNextId] = useState(1);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      const newEntry: Entry = {
        id: nextId,
        name: inputValue,
        isEditing: false,
        editedName: inputValue,
      };
      setEntries([...entries, newEntry]);
      setNextId(nextId + 1);
      setInputValue('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleEditClick = (id: number) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, isEditing: true } : entry
    ));
  };

  const handleSaveClick = (id: number) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, name: entry.editedName, isEditing: false } : entry
    ));
  };
  
  const handleDeleteClick = (id: number) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEditInputChange = (id: number, value: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, editedName: value } : entry
    ));
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>, id: number) => {
    if (event.key === 'Enter') {
      handleSaveClick(id);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">TSIA</CardTitle>
          <CardDescription>
            Type a name and click "Add" to add it to the list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  placeholder="What should we call you?"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                <Button onClick={handleAddClick}>Add</Button>
              </div>
            </div>

            {entries.length > 0 && (
              <div className="mt-6 space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-lg bg-accent p-4 text-accent-foreground transition-all duration-300">
                    {entry.isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={entry.editedName}
                          onChange={(e) => handleEditInputChange(entry.id, e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, entry.id)}
                          className="text-foreground"
                          autoFocus
                        />
                        <Button onClick={() => handleSaveClick(entry.id)}>Save</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                           <p className="text-xl font-bold">{entry.name}</p>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry.id)}>
                            <Pencil className="h-5 w-5" />
                          </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry.id)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
