
"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Trash2, Edit, Save, XCircle, UserPlus, BookUser, Home, Phone, Mail } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Contact {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: any;
}

const initialContactState = {
    name: '',
    address: '',
    phone: '',
    email: '',
};

export default function Home() {
  const [newContact, setNewContact] = useState(initialContactState);
  const [entries, setEntries] = useState<Contact[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Contact | null>(null);

  useEffect(() => {
    if (!configIsValid()) {
        setError("Η σύνδεση με το Firebase απέτυχε! Βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο '.env.local'.");
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const entriesCollectionRef = collection(db, "tsia-contacts");
      const q = query(entriesCollectionRef, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Contact));

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
        } else {
          setError("Αποτυχία φόρτωσης δεδομένων. Ελέγξτε τις ρυθμίσεις του Firebase και την κονσόλα του browser για περισσότερες λεπτομέρειες.");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e: any) {
      console.error("Error setting up Firestore listener:", e);
      setError(`Προέκυψε ένα σφάλμα: ${e.message}`);
      setLoading(false);
    }
  }, [selectedEntry?.id]);

  const handleNewContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = async () => {
    if (newContact.name.trim()) {
      try {
        setError(null);
        const entriesCollectionRef = collection(db, "tsia-contacts");
        await addDoc(entriesCollectionRef, { 
          ...newContact,
          createdAt: serverTimestamp() 
        });
        setNewContact(initialContactState);
      } catch (e) {
        console.error("Error adding document: ", e);
        setError("Αποτυχία προσθήκης στη βάση δεδομένων.");
      }
    }
  };

  const handleEditClick = (entry: Contact) => {
    setEditingEntry({ ...entry });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };
  
  const handleEditingContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (editingEntry) {
        const { name, value } = e.target;
        setEditingEntry(prev => prev ? ({ ...prev, [name]: value }) : null);
      }
  };

  const handleSaveClick = async (id: string) => {
    if (editingEntry && editingEntry.name.trim()) {
      try {
        setError(null);
        const { id: entryId, createdAt, ...dataToUpdate } = editingEntry;
        const entryDocRef = doc(db, "tsia-contacts", id);
        await updateDoc(entryDocRef, dataToUpdate);
        setEditingEntry(null);
      } catch (e) {
        console.error("Error updating document: ", e);
        setError("Αποτυχία ενημέρωσης στη βάση δεδομένων.");
      }
    }
  };
  
  const handleDeleteClick = async (id: string) => {
    try {
      setError(null);
      if(selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      const entryDocRef = doc(db, "tsia-contacts", id);
      await deleteDoc(entryDocRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Αποτυχία διαγραφής από τη βάση δεδομένων.");
    }
  };

  const handleSelectEntry = (entry: Contact) => {
    if(editingEntry?.id !== entry.id) {
        setSelectedEntry(entry);
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="flex w-full items-center justify-between pb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold flex-grow text-center">Επαφές</h1>
      </div>
       { error && (
           <Alert variant="destructive" className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Σφάλμα</AlertTitle>
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
                        Νέα Επαφή
                    </CardTitle>
                    <CardDescription>Προσθέστε μια νέα επαφή με τα στοιχεία της.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Ονοματεπώνυμο</Label>
                        <Input id="name" name="name" placeholder="π.χ. Γιάννης Παπαδόπουλος" value={newContact.name} onChange={handleNewContactChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Διεύθυνση</Label>
                        <Textarea id="address" name="address" placeholder="π.χ. Αριστοτέλους 1, Αθήνα" value={newContact.address} onChange={handleNewContactChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Τηλέφωνο</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="π.χ. 2101234567" value={newContact.phone} onChange={handleNewContactChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="π.χ. y.papadopoulos@email.com" value={newContact.email} onChange={handleNewContactChange} />
                    </div>
                    <Button onClick={handleAddClick} disabled={!newContact.name.trim()} className="w-full">
                        Προσθήκη Επαφής
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Οι Επαφές μου</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                    <p className="text-center text-muted-foreground">Φόρτωση επαφών...</p>
                    ) : entries.length === 0 ? (
                    <p className="text-center text-muted-foreground italic">{ error ? 'Η σύνδεση απέτυχε. Ελέγξτε τις ρυθμίσεις.' : 'Δεν υπάρχει καμία επαφή.'}</p>
                    ) : (
                    <ul className="space-y-2">
                        {entries.map((entry) => (
                        <li key={entry.id} className={`rounded-md border p-3 transition-colors cursor-pointer hover:bg-muted ${selectedEntry?.id === entry.id && !editingEntry ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() => handleSelectEntry(entry)}
                        >
                            {editingEntry?.id === entry.id ? (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg mb-2">Επεξεργασία Επαφής</h3>
                                <div className="space-y-2">
                                    <Label htmlFor={`edit-name-${entry.id}`}>Ονοματεπώνυμο</Label>
                                    <Input id={`edit-name-${entry.id}`} name="name" value={editingEntry.name} onChange={handleEditingContactChange} autoFocus/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`edit-address-${entry.id}`}>Διεύθυνση</Label>
                                    <Textarea id={`edit-address-${entry.id}`} name="address" value={editingEntry.address} onChange={handleEditingContactChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`edit-phone-${entry.id}`}>Τηλέφωνο</Label>
                                    <Input id={`edit-phone-${entry.id}`} name="phone" value={editingEntry.phone} onChange={handleEditingContactChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`edit-email-${entry.id}`}>Email</Label>
                                    <Input id={`edit-email-${entry.id}`} name="email" value={editingEntry.email} onChange={handleEditingContactChange} />
                                </div>
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
                         Στοιχεία Επαφής
                    </CardTitle>
                    <CardDescription>Επιλέξτε μια επαφή από τη λίστα για να δείτε τα στοιχεία της εδώ.</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedEntry ? (
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-primary">{selectedEntry.name}</h3>
                            </div>
                            <div className="space-y-4">
                                {selectedEntry.address && (
                                    <div className="flex items-start gap-3">
                                        <Home className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Διεύθυνση</h4>
                                            <p className="text-base whitespace-pre-wrap">{selectedEntry.address}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedEntry.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Τηλέφωνο</h4>
                                            <p className="text-base">{selectedEntry.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedEntry.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                                            <p className="text-base">{selectedEntry.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                             <div className="pt-4 border-t mt-4">
                                <h3 className="text-sm font-medium text-muted-foreground">ID Εγγραφής</h3>
                                <p className="text-xs text-muted-foreground">{selectedEntry.id}</p>
                            </div>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">{ error ? 'Ρυθμίστε το Firebase για να συνεχίσετε.' : 'Δεν έχει επιλεγεί επαφή'}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
