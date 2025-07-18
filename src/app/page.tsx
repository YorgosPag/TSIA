
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
} from "@/components/ui/dropdown-menu"

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
            <Button><Plus className="mr-2"/>Νέα Επαφή</Button>
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
                        ) : entries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-48 text-muted-foreground italic">
                                   { error ? 'Η σύνδεση απέτυχε.' : 'Δεν υπάρχει καμία επαφή.'}
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
                                          <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Επεξεργασία</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive">
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
    </main>
  );
}
