"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Entry {
  id: string;
  name: string;
  createdAt: any;
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    try {
      const entriesCollectionRef = collection(db, "tsia-entries");
      const unsubscribe = onSnapshot(entriesCollectionRef, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Entry));
        fetchedEntries.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
        setEntries(fetchedEntries);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Firestore snapshot error:", err);
        if (err.message.includes('permission-denied')) {
          setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας (Rules) του Firestore.");
        } else {
          setError("Αποτυχία φόρτωσης δεδομένων.");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e: any) {
        console.error("Firebase initialization error:", e);
        setError(`Η σύνδεση με το Firebase απέτυχε! Βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο 'src/lib/firebase.ts'. Λεπτομέρειες: ${e.message}`);
        setLoading(false);
    }
  }, []);

  const handleAddClick = async () => {
    if (inputValue.trim()) {
      try {
        setError(null);
        const entriesCollectionRef = collection(db, "tsia-entries");
        await addDoc(entriesCollectionRef, { name: inputValue, createdAt: serverTimestamp() });
        setInputValue('');
      } catch (e) {
        console.error("Error adding document: ", e);
        setError("Αποτυχία προσθήκης στη βάση δεδομένων.");
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
    setEditingText(entry.name);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingText('');
  };

  const handleSaveClick = async (id: string) => {
    if (editingText.trim()) {
      try {
        setError(null);
        const entryDocRef = doc(db, "tsia-entries", id);
        await updateDoc(entryDocRef, { name: editingText });
        handleCancelEdit();
      } catch (e) {
        console.error("Error updating document: ", e);
        setError("Αποτυχία ενημέρωσης στη βάση δεδομένων.");
      }
    }
  };
  
  const handleDeleteClick = async (id: string) => {
    try {
      setError(null);
      const entryDocRef = doc(db, "tsia-entries", id);
      await deleteDoc(entryDocRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Αποτυχία διαγραφής από τη βάση δεδομένων.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="flex w-full items-center justify-between pb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold flex-grow text-center">Λίστα Επαφών</h1>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center tracking-wider">TSIA</CardTitle>
          <CardDescription className="text-center">
            Το πιο απλό app: Γράψε, διέγραψε, επεξεργάσου.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Πρόσθεσε ένα όνομα"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddKeyDown}
            />
            <Button onClick={handleAddClick} disabled={!inputValue.trim()}>
              Προσθήκη
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-center text-lg font-semibold">Ονόματα στη βάση</h3>
            {loading ? (
              <p className="text-center text-muted-foreground">Φόρτωση ονομάτων...</p>
            ) : error ? (
               <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Σφάλμα</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : entries.length === 0 ? (
              <p className="text-center text-muted-foreground italic">Δεν υπάρχει καμία επαφή.</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-md border p-2">
                    {editingEntryId === entry.id ? (
                      <>
                        <Input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveClick(entry.id)}
                          className="flex-grow"
                          autoFocus
                        />
                        <div className="flex items-center ml-2">
                            <Button variant="ghost" size="icon" onClick={() => handleSaveClick(entry.id)}><Save className="h-4 w-4 text-green-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleCancelEdit}><XCircle className="h-4 w-4 text-gray-500" /></Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="flex-grow">{entry.name}</span>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
