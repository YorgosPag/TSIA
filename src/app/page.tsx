"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [name, setName] = useState('');

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">TSIA</CardTitle>
          <CardDescription>
            Type your name in the field below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="What should we call you?"
                value={name}
                onChange={handleNameChange}
                autoComplete="off"
              />
            </div>
            {name && (
              <div className="mt-6 rounded-lg bg-accent p-6 text-center text-accent-foreground transition-all duration-300">
                <p className="text-lg">Welcome,</p>
                <p className="text-4xl font-bold">{name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
