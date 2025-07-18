
"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Trash2, Edit, Save, XCircle, UserPlus, BookUser } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Entry {
  id: string;
  name: string;
  createdAt: any;
}

export default function Home() {
  const [name, setName] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);

  useEffect(() => {
    const checkConfig = () => {
      const configured = configIsValid();
      setIsFirebaseConfigured(configured);

      if (!configured) {
          setError("Η σύνδεση με το Firebase απέτυχε! Βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο '.env.local'.");
          setLoading(false);
          return;
      }

      setLoading(true);
      const entriesCollectionRef = collection(db, "tsia-contatti");
      const q = query(entriesCollectionRef);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Entry));
        
        fetchedEntries.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        setEntries(fetchedEntries);
        if (selectedEntry) {
            const updatedSelected = fetchedEntries.find(c => c.id === selectedEntry.id) || null;
            setSelectedEntry(updatedSelected);
        }
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Firestore snapshot error:", err);
        if (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions')) {
          setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας (Rules) του Firestore.");
        } else if (err.message.includes('firestore/unavailable')) {
             setError("Η υπηρεσία Firestore δεν είναι διαθέσιμη. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο και τις ρυθμίσεις του Firebase project.");
        } else if (err.message.includes('requires an index')) {
             setError("Η ταξινόμηση απαιτεί τη δημιουργία ενός σύνθετου index στο Firestore. Δοκιμάστε να το δημιουργήσετε από το σύνδεσμο στο μήνυμα σφάλματος στην κονσόλα του browser.");
        }
        else {
          setError("Αποτυχία φόρτωσης δεδομένων.");
        }
        setLoading(false);
      });

      return () => {
          unsubscribe();
      };
    };
    checkConfig();
  }, [selectedEntry?.id]);

  const handleAddClick = async () => {
    if (name.trim() && isFirebaseConfigured) {
      try {
        setError(null);
        const entriesCollectionRef = collection(db, "tsia-contatti");
        await addDoc(entriesCollectionRef, { 
          name: name,
          createdAt: serverTimestamp() 
        });
        setName('');
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
    setEditingName(entry.name);
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditingName('');
  };

  const handleSaveClick = async (id: string) => {
    if (editingName.trim() && isFirebaseConfigured) {
      try {
        setError(null);
        const entryDocRef = doc(db, "tsia-contatti", id);
        await updateDoc(entryDocRef, { 
            name: editingName
        });
        handleCancelEdit();
      } catch (e) {
        console.error("Error updating document: ", e);
        setError("Αποτυχία ενημέρωσης στη βάση δεδομένων.");
      }
    }
  };
  
  const handleDeleteClick = async (id: string) => {
    if (!isFirebaseConfigured) return;
    try {
      setError(null);
      if(selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      const entryDocRef = doc(db, "tsia-contatti", id);
      await deleteDoc(entryDocRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Αποτυχία διαγραφής από τη βάση δεδομένων.");
    }
  };

  const handleSelectEntry = (entry: Entry) => {
    if(editingEntryId !== entry.id) {
        setSelectedEntry(entry);
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="flex w-full items-center justify-between pb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold flex-grow text-center">Καταχωρήσεις</h1>
      </div>
       { !isFirebaseConfigured && (
           <Alert variant="destructive" className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Σφάλμα Ρύθμισης Firebase</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
       )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus />
                        Νέα Καταχώρηση
                    </CardTitle>
                    <CardDescription>Προσθέστε μια νέα καταχώρηση.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Όνομα καταχώρησης"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                        disabled={!isFirebaseConfigured}
                    />
                    <Button onClick={handleAddClick} disabled={!name.trim() || !isFirebaseConfigured} className="w-full">
                        Προσθήκη Καταχώρησης
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Οι Καταχωρήσεις μου</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                    <p className="text-center text-muted-foreground">Φόρτωση καταχωρήσεων...</p>
                    ) : error && isFirebaseConfigured ? (
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Σφάλμα</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    ) : !isFirebaseConfigured ? (
                     <p className="text-center text-muted-foreground italic">Ρυθμίστε το Firebase για να δείτε τις καταχωρήσεις.</p>
                    ) : entries.length === 0 ? (
                    <p className="text-center text-muted-foreground italic">Δεν υπάρχει καμία καταχώρηση.</p>
                    ) : (
                    <ul className="space-y-2">
                        {entries.map((entry) => (
                        <li key={entry.id} className={`rounded-md border p-2 transition-colors cursor-pointer hover:bg-muted ${selectedEntry?.id === entry.id ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() => handleSelectEntry(entry)}
                        >
                            {editingEntryId === entry.id ? (
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-grow"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveClick(entry.id)}
                                />
                                <div className="flex items-center justify-end">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSaveClick(entry.id);}}><Save className="h-4 w-4 text-green-600" /></Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCancelEdit();}}><XCircle className="h-4 w-4 text-gray-500" /></Button>
                                </div>
                            </div>
                            ) : (
                            <div className="flex items-center justify-between">
                                <span className="flex-grow font-medium">{entry.name}</span>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(entry);}}><Edit className="h-4 w-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteClick(entry.id);}}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                </div>
                            </div>
                            )}
                        </li>
                        ))}
                    </ul>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <BookUser />
                         Στοιχεία Καταχώρησης
                    </CardTitle>
                    <CardDescription>Επιλέξτε μια καταχώρηση από τη λίστα για να δείτε τα στοιχεία της εδώ.</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedEntry ? (
                         <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Όνομα</h3>
                                <p className="text-xl font-semibold">{selectedEntry.name}</p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium text-muted-foreground">ID Εγγραφής</h3>
                                <p className="text-xs text-muted-foreground">{selectedEntry.id}</p>
                            </div>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">{!isFirebaseConfigured ? 'Ρυθμίστε το Firebase για να συνεχίσετε.' : 'Δεν έχει επιλεγεί καταχώρηση'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
