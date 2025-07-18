"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      setSubmittedName(inputValue);
      setEditedName(inputValue); // Sync editedName with the new submission
      setInputValue(''); // Clear the main input
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setSubmittedName(editedName);
    setIsEditing(false);
  };

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveClick();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">TSIA</CardTitle>
          <CardDescription>
            Type your name and click "Add" to see the message.
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
            {submittedName && (
              <div className="mt-6 rounded-lg bg-accent p-6 text-accent-foreground transition-all duration-300">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="text-foreground"
                      autoFocus
                    />
                    <Button onClick={handleSaveClick}>Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-lg">Welcome,</p>
                      <p className="text-4xl font-bold">{submittedName}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleEditClick}>
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
