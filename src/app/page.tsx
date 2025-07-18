"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddClick = () => {
    setSubmittedName(inputValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddClick();
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
              <div className="mt-6 rounded-lg bg-accent p-6 text-center text-accent-foreground transition-all duration-300">
                <p className="text-lg">Welcome,</p>
                <p className="text-4xl font-bold">{submittedName}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
