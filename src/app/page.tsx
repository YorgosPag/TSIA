
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Plus, Search, BookUser, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  role?: string; // e.g. Πελάτης, Συνεργάτης
  type?: string; // e.g. Λογιστήριο, Μηχανικός
  phone: string;
  email: string;
  address?: string;
  city?: string;
  vatNumber?: string;
  taxOffice?: string;
  socialMedia?: { platform: string; url: string }[];
  notes?: string;
  createdAt: any;
}

export default function Home() {
  const [entries, setEntries] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!configIsValid() || !db) {
        setError("Η σύνδεση με το Firebase απέτυχε! Βεβαιωθείτε ότι έχετε ρυθμίσει σωστά τα στοιχεία σας στο αρχείο '.env.local'.");
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const entriesCollectionRef = collection(db, "tsia-contacts");
      const q = query(entriesCollectionRef, orderBy("lastName", "asc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Contact));

        setEntries(fetchedEntries);
        
        // Update selected contact if it still exists
        if (selectedContact) {
            const updatedSelected = fetchedEntries.find(c => c.id === selectedContact.id);
            if(updatedSelected) {
                setSelectedContact(updatedSelected);
            } else {
                setSelectedContact(fetchedEntries.length > 0 ? fetchedEntries[0] : null);
            }
        } else if (fetchedEntries.length > 0) {
             setSelectedContact(fetchedEntries[0]);
        }
        
        if (fetchedEntries.length === 0) {
            setSelectedContact(null);
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
  }, [selectedContact?.id]);

  const handleOpenDialog = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleSaveContact = async (formData: FormData) => {
    if (!db) return;
    const fullName = formData.get('name') as string;
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const contactData = {
      firstName: firstName || '',
      lastName: lastName || '',
      companyName: formData.get('companyName') as string,
      role: formData.get('role') as string,
      type: formData.get('type') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      vatNumber: formData.get('vatNumber') as string,
      taxOffice: formData.get('taxOffice') as string,
      notes: formData.get('notes') as string,
    };

    if (!contactData.firstName && !contactData.lastName && !contactData.companyName) {
        toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Το πεδίο 'Όνομα/Εταιρεία' είναι υποχρεωτικό.",
        });
        return;
    }

    try {
        if (editingContact) {
            const contactRef = doc(db, 'tsia-contacts', editingContact.id);
            await updateDoc(contactRef, contactData);
            toast({ title: "Επιτυχία", description: "Η επαφή ενημερώθηκε." });
        } else {
            const newContactRef = await addDoc(collection(db, 'tsia-contacts'), { ...contactData, createdAt: serverTimestamp() });
            toast({ title: "Επιτυχία", description: "Η επαφή δημιουργήθηκε." });
            const newContactData = { id: newContactRef.id, ...contactData, createdAt: new Date() };
            setSelectedContact(newContactData);
        }
        setIsDialogOpen(false);
        setEditingContact(null);
    } catch (err) {
        console.error("Save contact error:", err);
        toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Αποτυχία αποθήκευσης της επαφής.",
        });
    }
  };

  const handleOpenDeleteAlert = (id: string) => {
    setDeletingContactId(id);
    setIsAlertOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!db || !deletingContactId) return;
    try {
        const currentlySelectedId = selectedContact?.id;
        const contactIndex = entries.findIndex(e => e.id === deletingContactId);

        await deleteDoc(doc(db, 'tsia-contacts', deletingContactId));
        toast({ title: "Επιτυχία", description: "Η επαφή διαγράφηκε." });
        
        if(currentlySelectedId === deletingContactId){
            const newEntries = entries.filter(e => e.id !== deletingContactId);
            if (newEntries.length > 0) {
                 setSelectedContact(newEntries[Math.min(contactIndex, newEntries.length - 1)]);
            } else {
                setSelectedContact(null);
            }
        }
    } catch (err) {
        console.error("Delete contact error:", err);
        toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Αποτυχία διαγραφής της επαφής.",
        });
    } finally {
        setIsAlertOpen(false);
        setDeletingContactId(null);
    }
  };

  const getInitials = (contact: Contact) => {
    if (contact.firstName && contact.lastName) return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    if (contact.firstName) return contact.firstName[0].toUpperCase();
    if (contact.companyName) return contact.companyName[0].toUpperCase();
    return 'Κ';
  }
  
  const getFullName = (contact: Contact) => {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  }

  const getDisplayName = (contact: Contact) => {
    const fullName = getFullName(contact);
    return fullName || contact.companyName;
  }
  
  return (
    <main className="flex flex-1 bg-background">
        <div className="w-1/3 border-r bg-card/50 overflow-y-auto">
             <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-semibold flex items-center gap-3"><BookUser/>Λίστα Επαφών</h1>
                        <p className="text-sm text-muted-foreground">Διαχειριστείτε τις επαφές σας.</p>
                    </div>
                    <Button size="sm" onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4"/>Νέα</Button>
                </div>

                <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Αναζήτηση επαφής..." className="pl-10 w-full bg-card" />
                </div>
             </div>

             { error && (
               <Alert variant="destructive" className="m-4">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Σφάλμα</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
           )}

            {loading ? (
                <div className="p-4 text-center text-muted-foreground">Φόρτωση επαφών...</div>
            ) : (
                <nav className="flex flex-col gap-1 px-2">
                    {entries.map(entry => (
                        <Button
                            key={entry.id}
                            variant={selectedContact?.id === entry.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto py-2"
                            onClick={() => setSelectedContact(entry)}
                        >
                             <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                    {getInitials(entry)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{getDisplayName(entry)}</span>
                                <span className="text-xs text-muted-foreground">{entry.role}</span>
                            </div>
                        </Button>
                    ))}
                </nav>
            )}
        </div>

        <div className="w-2/3 overflow-y-auto p-6">
            {selectedContact ? (
                <>
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16 text-2xl">
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {getInitials(selectedContact)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{getDisplayName(selectedContact)}</h2>
                            <p className="text-muted-foreground">{selectedContact.role}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleOpenDialog(selectedContact)}><Edit className="mr-2 h-4 w-4"/>Επεξεργασία</Button>
                        <Button variant="outline" color="destructive" onClick={() => handleOpenDeleteAlert(selectedContact.id)}><Trash2 className="mr-2 h-4 w-4"/>Διαγραφή</Button>
                    </div>
                </div>

                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7']} className="w-full space-y-2">
                  <AccordionItem value="item-1" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Επικοινωνίας</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">Email</Label><p className="text-sm font-medium">{selectedContact.email || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Τηλέφωνο</Label><p className="text-sm font-medium">{selectedContact.phone || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Προσωπικά Στοιχεία</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">Όνομα</Label><p className="text-sm font-medium">{selectedContact.firstName || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Επώνυμο</Label><p className="text-sm font-medium">{selectedContact.lastName || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Επαγγελματικά Στοιχεία</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">Εταιρεία</Label><p className="text-sm font-medium">{selectedContact.companyName || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Ρόλος</Label><p className="text-sm font-medium">{selectedContact.role || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Είδος</Label><p className="text-sm font-medium">{selectedContact.type || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Διεύθυνσης</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">Διεύθυνση</Label><p className="text-sm font-medium">{selectedContact.address || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Πόλη</Label><p className="text-sm font-medium">{selectedContact.city || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-5" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Ταυτότητας & ΑΦΜ</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">ΑΦΜ</Label><p className="text-sm font-medium">{selectedContact.vatNumber || '-'}</p></div>
                      <div><Label className="text-muted-foreground">ΔΟΥ</Label><p className="text-sm font-medium">{selectedContact.taxOffice || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-6" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Κοινωνικά Δίκτυα</h3></AccordionTrigger>
                     <AccordionContent className="pt-2 pb-4">
                        <p className="text-sm text-muted-foreground italic">Δεν υπάρχουν καταχωρημένα κοινωνικά δίκτυα.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-7" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Λοιπά</h3></AccordionTrigger>
                     <AccordionContent className="pt-2 pb-4">
                         <div><Label className="text-muted-foreground">Σημειώσεις</Label><p className="text-sm font-medium whitespace-pre-wrap">{selectedContact.notes || '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                </>
            ) : (
                 !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <BookUser className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">{ entries.length > 0 ? "Δεν επιλέχθηκε επαφή" : "Δεν υπάρχουν επαφές"}</h2>
                        <p>{ entries.length > 0 ? "Επιλέξτε μια επαφή από τη λίστα για να δείτε τις λεπτομέρειες." : "Πατήστε 'Νέα' για να προσθέσετε την πρώτη σας επαφή."}</p>
                    </div>
                )
            )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <form action={handleSaveContact}>
              <DialogHeader>
                <DialogTitle>{editingContact ? 'Επεξεργασία Επαφής' : 'Νέα Επαφή'}</DialogTitle>
                <DialogDescription>
                  {editingContact ? 'Επεξεργαστείτε τα στοιχεία της επαφής.' : 'Συμπληρώστε τα στοιχεία για τη νέα επαφή.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Όνομα/Επώνυμο</Label>
                  <Input id="name" name="name" defaultValue={editingContact ? getFullName(editingContact) : ''} className="col-span-3" required/>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="companyName" className="text-right">Εταιρεία</Label>
                  <Input id="companyName" name="companyName" defaultValue={editingContact?.companyName} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Ρόλος</Label>
                  <Input id="role" name="role" defaultValue={editingContact?.role} placeholder="π.χ. Πελάτης, Συνεργάτης" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Είδος</Label>
                  <Input id="type" name="type" defaultValue={editingContact?.type} placeholder="π.χ. Μηχανικός, Λογιστήριο" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingContact?.email} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Τηλέφωνο</Label>
                  <Input id="phone" name="phone" defaultValue={editingContact?.phone} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Διεύθυνση</Label>
                  <Input id="address" name="address" defaultValue={editingContact?.address} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right">Πόλη</Label>
                  <Input id="city" name="city" defaultValue={editingContact?.city} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vatNumber" className="text-right">ΑΦΜ</Label>
                  <Input id="vatNumber" name="vatNumber" defaultValue={editingContact?.vatNumber} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="taxOffice" className="text-right">ΔΟΥ</Label>
                  <Input id="taxOffice" name="taxOffice" defaultValue={editingContact?.taxOffice} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right pt-2">Σημειώσεις</Label>
                  <Textarea id="notes" name="notes" defaultValue={editingContact?.notes} className="col-span-3" />
                </div>
              </div>
              <DialogFooter className="pt-4 border-t mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Ακύρωση</Button>
                <Button type="submit">Αποθήκευση</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Είστε βέβαιοι;</AlertDialogTitle>
                    <AlertDialogDescription>
                        Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Η επαφή θα διαγραφεί οριστικά από τη βάση δεδομένων.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Διαγραφή
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </main>
  );
}
