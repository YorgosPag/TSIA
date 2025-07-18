
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Trash2, Edit, Save, XCircle, UserPlus, BookUser, Home, Phone, Mail, Filter, Search, Plus, UserRound } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Contact {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  avatarUrl?: string;
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
    
    if (!db) {
        setError("Η βάση δεδομένων Firestore δεν είναι διαθέσιμη.");
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
        if (!selectedEntry && fetchedEntries.length > 0) {
            setSelectedEntry(fetchedEntries[0]);
        }
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
    if (newContact.name.trim() && db) {
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
    if (editingEntry && editingEntry.name.trim() && db) {
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
    if (!db) return;
    try {
      setError(null);
      if(selectedEntry?.id === id) {
        const currentIndex = entries.findIndex(e => e.id === id);
        if (entries.length > 1) {
            const nextIndex = (currentIndex + 1) % entries.length;
            setSelectedEntry(entries[nextIndex]);
        } else {
            setSelectedEntry(null);
        }
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

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <main className="flex h-screen bg-background text-foreground">
        <div className="flex flex-1">
            {/* Left Column: Add Contact */}
            <div className="w-[350px] bg-card p-4 flex flex-col border-r border-border">
                <Card className="flex-1 flex flex-col bg-transparent border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserPlus />
                            Νέα Επαφή
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
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
                            <Plus className="mr-2 h-4 w-4"/>
                            Προσθήκη Επαφής
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column: Contacts List */}
            <div className="w-[400px] p-4 flex flex-col border-r border-border">
                <div className="flex items-center justify-between mb-4">
                     <SidebarTrigger className="md:hidden" />
                    <h2 className="text-xl font-semibold">Λίστα Επαφών</h2>
                    <Button variant="ghost" size="icon"><Plus /></Button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Αναζήτηση επαφής..." className="pl-10" />
                </div>
                <div className="mb-4">
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4"/> Φίλτρα</Button>
                </div>
                { error && (
                   <Alert variant="destructive" className="mb-4">
                      <TriangleAlert className="h-4 w-4" />
                      <AlertTitle>Σφάλμα</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
               )}
                <ScrollArea className="flex-1 -mx-4">
                    <div className="px-4">
                    {loading ? (
                    <p className="text-center text-muted-foreground">Φόρτωση επαφών...</p>
                    ) : entries.length === 0 ? (
                    <p className="text-center text-muted-foreground italic">{ error ? 'Η σύνδεση απέτυχε.' : 'Δεν υπάρχει καμία επαφή.'}</p>
                    ) : (
                    <ul className="space-y-2">
                        {entries.map((entry) => (
                        <li key={entry.id} className={`rounded-lg p-3 transition-colors cursor-pointer flex items-center gap-4 ${selectedEntry?.id === entry.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                            onClick={() => handleSelectEntry(entry)}
                        >
                            <Avatar>
                                <AvatarImage src={entry.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback className={`${selectedEntry?.id === entry.id ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {getInitials(entry.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 truncate">
                                <h3 className="font-semibold truncate">{entry.name}</h3>
                                <p className={`text-sm truncate ${selectedEntry?.id === entry.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{entry.email}</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column: Contact Details */}
            <div className="flex-1 p-6">
                {selectedEntry ? (
                     <ScrollArea className="h-full">
                        <div className="space-y-8 pr-4">
                            <div className="flex items-start gap-6">
                                <Avatar className="w-24 h-24 border-4 border-accent">
                                    <AvatarImage src={selectedEntry.avatarUrl} data-ai-hint="person" />
                                    <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                                        {getInitials(selectedEntry.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-bold">{selectedEntry.name}</h2>
                                        <div>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(selectedEntry)}><Edit className="h-5 w-5"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(selectedEntry.id)}><Trash2 className="h-5 w-5 text-destructive"/></Button>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">Φυσικό Πρόσωπο</p>
                                </div>
                            </div>

                            {editingEntry?.id === selectedEntry.id ? (
                                <Card>
                                    <CardHeader><CardTitle>Επεξεργασία Επαφής</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-name-${editingEntry.id}`}>Ονοματεπώνυμο</Label>
                                            <Input id={`edit-name-${editingEntry.id}`} name="name" value={editingEntry.name} onChange={handleEditingContactChange} autoFocus/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-address-${editingEntry.id}`}>Διεύθυνση</Label>
                                            <Textarea id={`edit-address-${editingEntry.id}`} name="address" value={editingEntry.address} onChange={handleEditingContactChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-phone-${editingEntry.id}`}>Τηλέφωνο</Label>
                                            <Input id={`edit-phone-${editingEntry.id}`} name="phone" value={editingEntry.phone} onChange={handleEditingContactChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`edit-email-${editingEntry.id}`}>Email</Label>
                                            <Input id={`edit-email-${editingEntry.id}`} name="email" value={editingEntry.email} onChange={handleEditingContactChange} />
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" onClick={handleCancelEdit}>Ακύρωση</Button>
                                            <Button onClick={() => handleSaveClick(editingEntry.id)}><Save className="mr-2 h-4 w-4"/> Αποθήκευση</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Στοιχεία Επικοινωνίας</h3>
                                <div className="space-y-4">
                                     {selectedEntry.email && (
                                        <div className="flex items-center gap-4">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <a href={`mailto:${selectedEntry.email}`} className="text-base hover:underline">{selectedEntry.email}</a>
                                        </div>
                                    )}
                                    {selectedEntry.phone && (
                                        <div className="flex items-center gap-4">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-base">{selectedEntry.phone}</span>
                                        </div>
                                    )}
                                    {selectedEntry.address && (
                                        <div className="flex items-start gap-4">
                                            <Home className="h-5 w-5 text-muted-foreground mt-1" />
                                            <p className="text-base whitespace-pre-wrap">{selectedEntry.address}</p>
                                        </div>
                                    )}
                                    {!selectedEntry.email && !selectedEntry.phone && !selectedEntry.address && (
                                        <p className="text-muted-foreground italic">Δεν υπάρχουν καταχωρημένα στοιχεία επικοινωνίας.</p>
                                    )}
                                </div>
                            </div>
                           )}

                           <div>
                                <h3 className="text-lg font-semibold mb-4">Σημειώσεις</h3>
                                <div className="bg-card border rounded-lg p-4">
                                     <p className="text-muted-foreground text-center py-8">Η λειτουργία σημειώσεων δεν έχει υλοποιηθεί.</p>
                                </div>
                           </div>
                        </div>
                     </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-12 border-2 border-dashed rounded-lg border-border">
                        <UserRound className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Δεν έχει επιλεγεί επαφή</h3>
                        <p className="text-muted-foreground">{ error ? 'Ρυθμίστε το Firebase για να συνεχίσετε.' : 'Επιλέξτε μια επαφή από τη λίστα για να δείτε τα στοιχεία της.'}</p>
                    </div>
                )}
            </div>
        </div>
    </main>
  );
}
