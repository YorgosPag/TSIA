
"use client";

import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { getApp, getApps } from 'firebase/app';

interface Entry {
  id: string;
  name: string;
  isEditing: boolean;
  editedName: string;
}

const isFirebaseConfigured = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const apps = getApps();
  if (!apps.length) {
    return false;
  }
  const config = getApp().options;
  return config && config.apiKey && !config.apiKey.startsWith("TODO:");
};


export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check configuration only on the client-side
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);

    if (configured) {
      const entriesCollectionRef = collection(db, "tsia-entries");
      const unsubscribe = onSnapshot(entriesCollectionRef, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          ...(doc.data() as { name: string }),
          id: doc.id,
          isEditing: false,
          editedName: doc.data().name,
        }));
        setEntries(fetchedEntries);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddClick = async () => {
    if (inputValue.trim() && db) {
      const entriesCollectionRef = collection(db, "tsia-entries");
      await addDoc(entriesCollectionRef, { name: inputValue });
      setInputValue('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleEditClick = (id: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, isEditing: true } : { ...entry, isEditing: false }
    ));
  };

  const handleSaveClick = async (id: string) => {
    const entryToUpdate = entries.find(entry => entry.id === id);
    if (!entryToUpdate || !entryToUpdate.editedName.trim() || !db) return;

    const entryDoc = doc(db, "tsia-entries", id);
    await updateDoc(entryDoc, { name: entryToUpdate.editedName });
    // The onSnapshot listener will automatically update the UI
  };

  const handleDeleteClick = async (id: string) => {
    if (!db) return;
    const entryDoc = doc(db, "tsia-entries", id);
    await deleteDoc(entryDoc);
  };

  const handleEditInputChange = (id: string, value: string) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, editedName: value } : entry
    ));
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === 'Enter') {
      handleSaveClick(id);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">Λίστα Ονομάτων</CardTitle>
          <CardDescription>
            Προσθέστε, επεξεργαστείτε και διαγράψτε ονόματα. Τα δεδομένα αποθηκεύονται στο Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured ? (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Η σύνδεση με το Firebase απέτυχε!</AlertTitle>
                <AlertDescription>
                  Παρακαλώ βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο{' '}
                  <code className="font-mono text-sm bg-red-100 p-1 rounded">src/lib/firebase.ts</code>.
                </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Όνομα</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    placeholder="Προσθέστε ένα νέο όνομα"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    disabled={!isConfigured}
                  />
                  <Button onClick={handleAddClick} disabled={!isConfigured}>Προσθήκη</Button>
                </div>
              </div>

              {entries.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Αποθηκευμένα Ονόματα</h3>
                  {entries.map((entry) => (
                    <div key={entry.id} className="rounded-lg bg-card border p-4 transition-all duration-300">
                      {entry.isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={entry.editedName}
                            onChange={(e) => handleEditInputChange(entry.id, e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, entry.id)}
                            className="bg-input"
                            autoFocus
                          />
                          <Button onClick={() => handleSaveClick(entry.id)}>Αποθήκευση</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xl font-medium">{entry.name}</p>
                          </div>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry.id)} aria-label={`Επεξεργασία ${entry.name}`}>
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry.id)} aria-label={`Διαγραφή ${entry.name}`}>
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
          )}
        </CardContent>
      </Card>
    </main>
  );
}
