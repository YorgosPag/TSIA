
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TriangleAlert, Plus, Search, BookUser, Mail, Phone, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Contact {
  id: string;
  name: string;
  role?: string; // e.g. Πελάτης, Συνεργάτης
  type?: string; // e.g. Λογιστήριο, Μηχανικός
  phone: string;
  email: string;
  notes?: string;
  createdAt: any;
}

export default function Home() {
  const [entries, setEntries] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const { toast } = useToast();

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
  }, []);

  const handleOpenDialog = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleSaveContact = async (formData: FormData) => {
    if (!db) return;
    const contactData = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      type: formData.get('type') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      notes: formData.get('notes') as string,
    };

    if (!contactData.name) {
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
            await addDoc(collection(db, 'tsia-contacts'), { ...contactData, createdAt: serverTimestamp() });
            toast({ title: "Επιτυχία", description: "Η επαφή δημιουργήθηκε." });
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
        await deleteDoc(doc(db, 'tsia-contacts', deletingContactId));
        toast({ title: "Επιτυχία", description: "Η επαφή διαγράφηκε." });
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

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const getBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case 'Λογιστήριο': return 'default';
      case 'Πελάτης': return 'secondary';
      case 'Συνεργάτης': return 'outline';
      case 'Προμηθευτής': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <main className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-semibold flex items-center gap-3"><BookUser/>Λίστα Επαφών</h1>
                <p className="text-muted-foreground">Διαχειριστείτε όλες τις επαφές σας από ένα κεντρικό σημείο.</p>
            </div>
            <Button onClick={() => handleOpenDialog()}><Plus className="mr-2"/>Νέα Επαφή</Button>
        </div>

        <div className="relative mb-6">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Αναζήτηση επαφής..." className="pl-10 w-full md:w-1/3 bg-card" />
        </div>

         { error && (
           <Alert variant="destructive" className="mb-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Σφάλμα</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
       )}

        <Card className="flex-1">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">ΟΝΟΜΑ/ΕΤΑΙΡΕΙΑ</TableHead>
                            <TableHead className="w-[30%]">ΕΠΙΚΟΙΝΩΝΙΑ</TableHead>
                            <TableHead>ΣΗΜΕΙΩΣΕΙΣ</TableHead>
                            <TableHead className="w-[5%] text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-48 text-muted-foreground">
                                    Φόρτωση επαφών...
                                </TableCell>
                            </TableRow>
                        ) : entries.length === 0 && !error ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-48 text-muted-foreground italic">
                                   Δεν υπάρχει καμία επαφή.
                                </TableCell>
                            </TableRow>
                        ) : (
                            entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                             <Avatar className="h-10 w-10">
                                                <AvatarImage src={undefined} />
                                                <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                                                    {getInitials(entry.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{entry.name}</div>
                                                <div className="flex gap-2 mt-1">
                                                    {entry.role && <Badge variant={getBadgeVariant(entry.role)}>{entry.role}</Badge>}
                                                    {entry.type && <Badge variant="outline">{entry.type}</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         {entry.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span>{entry.email}</span>
                                            </div>
                                        )}
                                        {entry.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Phone className="h-4 w-4" />
                                                <span>{entry.phone}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{entry.notes}</TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleOpenDialog(entry)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Επεξεργασία</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleOpenDeleteAlert(entry.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Διαγραφή</span>
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form action={handleSaveContact}>
              <DialogHeader>
                <DialogTitle>{editingContact ? 'Επεξεργασία Επαφής' : 'Νέα Επαφή'}</DialogTitle>
                <DialogDescription>
                  {editingContact ? 'Επεξεργαστείτε τα στοιχεία της επαφής.' : 'Συμπληρώστε τα στοιχεία για τη νέα επαφή.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Όνομα/Εταιρεία</Label>
                  <Input id="name" name="name" defaultValue={editingContact?.name} className="col-span-3" required/>
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
                 <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right pt-2">Σημειώσεις</Label>
                  <Textarea id="notes" name="notes" defaultValue={editingContact?.notes} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
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
