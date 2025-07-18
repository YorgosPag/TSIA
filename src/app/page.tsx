
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
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    // This check runs only on the client-side, avoiding hydration errors.
    const checkFirebaseConfig = () => {
      try {
        const apps = getApps();
        if (apps.length > 0) {
          const config = getApp().options;
          // A simple check to see if the default placeholder config is still being used.
          if (config && config.apiKey && !config.apiKey.startsWith("AIzaSyC3c-3X8P0o")) {
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    };

    const configured = checkFirebaseConfig();
    setIsConfigured(configured);

    if (configured) {
      const entriesCollectionRef = collection(db, "tsia-entries");
      const unsubscribe = onSnapshot(entriesCollectionRef, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Entry));
        setEntries(fetchedEntries);
      });
      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleAddClick = async () => {
    if (inputValue.trim() && isConfigured) {
      const entriesCollectionRef = collection(db, "tsia-entries");
      try {
        await addDoc(entriesCollectionRef, { name: inputValue });
        setInputValue(''); // Clear input after successful add
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleAddKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddClick();
    }
  };

  const handleEditClick = (entry: Entry) => {
    setEditingEntryId(entry.id);
    setEditingName(entry.name);
  };
  
  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingName('');
  }

  const handleSaveClick = async (id: string) => {
    if (!editingName.trim() || !isConfigured) return;

    const entryDocRef = doc(db, "tsia-entries", id);
    try {
      await updateDoc(entryDocRef, { name: editingName });
      handleCancelEdit(); // Exit editing mode on successful save
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!isConfigured) return;
    const entryDocRef = doc(db, "tsia-entries", id);
    try {
      await deleteDoc(entryDocRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (event.key === 'Enter') {
      handleSaveClick(id);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
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
                    onKeyDown={handleAddKeyDown}
                    autoComplete="off"
                    disabled={!isConfigured}
                  />
                  <Button onClick={handleAddClick} disabled={!isConfigured || !inputValue.trim()}>Προσθήκη</Button>
                </div>
              </div>

              {entries.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-center">Αποθηκευμένα Ονόματα</h3>
                  {entries.map((entry) => (
                    <div key={entry.id} className="rounded-lg bg-card border p-4 transition-all duration-300">
                      {editingEntryId === entry.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, entry.id)}
                            className="bg-input"
                            autoFocus
                          />
                          <Button onClick={() => handleSaveClick(entry.id)} disabled={!editingName.trim()}>Αποθήκευση</Button>
                          <Button variant="ghost" onClick={handleCancelEdit}>Ακύρωση</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xl font-medium">{entry.name}</p>
                          <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)} aria-label={`Επεξεργασία ${entry.name}`}>
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
