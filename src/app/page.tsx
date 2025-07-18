
"use client";

import { useState, useEffect, type KeyboardEvent } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Trash2, Edit, Save, XCircle, UserPlus, UserSquare } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: any;
}

export default function Home() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingFirstName, setEditingFirstName] = useState('');
  const [editingLastName, setEditingLastName] = useState('');

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const contactsCollectionRef = collection(db, "tsia-contacts");
      const q = query(contactsCollectionRef, orderBy("createdAt", "desc"));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedContacts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Contact));
        setContacts(fetchedContacts);
        if (selectedContact) {
            const updatedSelected = fetchedContacts.find(c => c.id === selectedContact.id) || null;
            setSelectedContact(updatedSelected);
        }
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Firestore snapshot error:", err);
        if (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions')) {
          setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας (Rules) του Firestore.");
        } else {
          setError("Αποτυχία φόρτωσης δεδομένων.");
        }
        setLoading(false);
      });

    } catch (e: any) {
        console.error("Firebase initialization error:", e);
        setError(`Η σύνδεση με το Firebase απέτυχε! Βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο 'src/lib/firebase.ts'. Λεπτομέρειες: ${e.message}`);
        setLoading(false);
    }
    
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [selectedContact?.id]);

  const handleAddClick = async () => {
    if (firstName.trim() && lastName.trim()) {
      try {
        setError(null);
        const contactsCollectionRef = collection(db, "tsia-contacts");
        await addDoc(contactsCollectionRef, { 
          firstName: firstName, 
          lastName: lastName,
          createdAt: serverTimestamp() 
        });
        setFirstName('');
        setLastName('');
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

  const handleEditClick = (contact: Contact) => {
    setEditingContactId(contact.id);
    setEditingFirstName(contact.firstName);
    setEditingLastName(contact.lastName);
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditingFirstName('');
    setEditingLastName('');
  };

  const handleSaveClick = async (id: string) => {
    if (editingFirstName.trim() && editingLastName.trim()) {
      try {
        setError(null);
        const contactDocRef = doc(db, "tsia-contacts", id);
        await updateDoc(contactDocRef, { 
            firstName: editingFirstName,
            lastName: editingLastName
        });
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
      if(selectedContact?.id === id) {
        setSelectedContact(null);
      }
      const contactDocRef = doc(db, "tsia-contacts", id);
      await deleteDoc(contactDocRef);
    } catch (e) {
      console.error("Error deleting document: ", e);
      setError("Αποτυχία διαγραφής από τη βάση δεδομένων.");
    }
  };

  const handleSelectContact = (contact: Contact) => {
    if(editingContactId !== contact.id) {
        setSelectedContact(contact);
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="flex w-full items-center justify-between pb-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold flex-grow text-center">Λίστα Επαφών</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus />
                        Νέα Επαφή
                    </CardTitle>
                    <CardDescription>Προσθέστε όνομα και επώνυμο.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Όνομα"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                    />
                    <Input
                        type="text"
                        placeholder="Επώνυμο"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                    />
                    <Button onClick={handleAddClick} disabled={!firstName.trim() || !lastName.trim()} className="w-full">
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
                    ) : error ? (
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Σφάλμα</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    ) : contacts.length === 0 ? (
                    <p className="text-center text-muted-foreground italic">Δεν υπάρχει καμία επαφή.</p>
                    ) : (
                    <ul className="space-y-2">
                        {contacts.map((contact) => (
                        <li key={contact.id} className={`rounded-md border p-2 transition-colors cursor-pointer hover:bg-muted ${selectedContact?.id === contact.id ? 'bg-accent text-accent-foreground' : ''}`}
                            onClick={() => handleSelectContact(contact)}
                        >
                            {editingContactId === contact.id ? (
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    value={editingFirstName}
                                    onChange={(e) => setEditingFirstName(e.target.value)}
                                    className="flex-grow"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Input
                                    type="text"
                                    value={editingLastName}
                                    onChange={(e) => setEditingLastName(e.target.value)}
                                    className="flex-grow"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveClick(contact.id)}
                                />
                                <div className="flex items-center justify-end">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSaveClick(contact.id);}}><Save className="h-4 w-4 text-green-600" /></Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCancelEdit();}}><XCircle className="h-4 w-4 text-gray-500" /></Button>
                                </div>
                            </div>
                            ) : (
                            <div className="flex items-center justify-between">
                                <span className="flex-grow font-medium">{contact.firstName} {contact.lastName}</span>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(contact);}}><Edit className="h-4 w-4 text-blue-600" /></Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteClick(contact.id);}}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
                        <UserSquare />
                         Στοιχεία Επαφής
                    </CardTitle>
                    <CardDescription>Επιλέξτε μια επαφή από τη λίστα για να δείτε τα στοιχεία της εδώ.</CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedContact ? (
                         <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Όνομα</h3>
                                <p className="text-xl font-semibold">{selectedContact.firstName}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Επώνυμο</h3>
                                <p className="text-xl font-semibold">{selectedContact.lastName}</p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium text-muted-foreground">ID Επαφής</h3>
                                <p className="text-xs text-muted-foreground">{selectedContact.id}</p>
                            </div>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Δεν έχει επιλεγεί επαφή</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
