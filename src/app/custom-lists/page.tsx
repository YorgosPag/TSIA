
"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, List, Plus, Trash2, Search, ChevronsUpDown, ChevronUp, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface ListItem {
  id: string;
  value: string;
}

interface CustomList {
  id: string;
  title: string;
  description?: string;
  items: ListItem[];
}

const initialListsData = [
    { title: "Ρόλοι", description: "Λίστα με τους διαθέσιμους ρόλους για τις επαφές.", items: ["Πελάτης", "Συνεργάτης", "Προμηθευτής", "Λογιστήριο", "Δημόσιος Φορέας", "Εσωτερικός Χρήστης"] },
    { title: "Ειδικότητες", description: "Λίστα με τις διαθέσιμες ειδικότητες για τις επαφές.", items: ["Αρχιτέκτονας", "Μηχανικός", "Δικηγόρος", "Οικονομολόγος", "Υπάλληλος ΔΟΥ", "Υπάλληλος Πολεοδομίας", "Κατασκευαστής", "Λογιστής", "Ελεύθερος Επαγγελματίας"] },
    { title: "Κωδικός", description: "", items: ["1.A1", "1.B1", "1.C1", "1.D1", "1.E1", "1.Γ1", "1.Γ2"] },
    { title: "Κατηγορία Παρέμβασης", description: "", items: ["Κουφώματα", "Θερμομόνωση", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Λοιπές Παρεμβάσεις"] },
    { title: "Κατηγορία Δαπάνης", description: "", items: ["Κουφώματα (I)", "Θερμομόνωση (II)", "Συστήματα Θέρμανσης-Ψύξης (III)", "ΖΝΧ (IV)", "Λοιπές Παρεμβάσεις (V)"] },
    { title: "Υπο-Κατηγορία Παρέμβασης", description: "", items: ["Πλαίσιο PVC με υαλοπίνακα - Παράθυρο (U < 2,0)", "Πλαίσιο PVC με υαλοπίνακα - Εξωστόθυρα (U < 2,0)", "Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο)"] },
    { title: "info", description: "", items: ["Κουφώματα – Υαλοπίνακες – Συστήματα Σκίασης", "Θερμομόνωση", "Συστήματα Θέρμανσης - Ψύξης", "Συστήματα Παροχής Ζεστού Νερού Χρήσης (ΖΝΧ)", "Λοιπές Παρεμβάσεις Εξοικονόμησης Ενέργειας"] },
    { title: "Ενεργειακά Χαρακτηριστικά", description: "", items: ["U < 1.8", "Πάχος 10cm", "8kW < P ≤ 12kW", "200L"] },
    { title: "Τίτλοι Παρεμβάσεων", description: "", items: ["Αντικατάσταση Κουφωμάτων", "Εξωτερική Θερμομόνωση (Κέλυφος)", "Αντλία Θερμότητας", "Ηλιακός θερμοσίφωνας", "Φωτοβολταϊκό Σύστημα"] },
    { title: "Μονάδες Μέτρησης", description: "", items: ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση", "τεμ.", "m", "m³", "kWh"] },
    { title: "Στάδια Εξοικονομώ", description: "Τα επίσημα στάδια προόδου για έργα του προγράμματος \"Εξοικονομώ\".", items: ["0. Αρχική κατάσταση / Καταχώρηση", "1. Υποβολή αίτησης", "2. Αυτόματη βαθμολόγηση", "3. Προσωρινοί πίνακες", "4. Ενστάσεις & επικαιροποίηση", "5. Οριστικοί πίνακες"] },
];

export default function CustomListsPage() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [newListTitle, setNewListTitle] = useState('');
  const [newListItems, setNewListItems] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const [newItemValues, setNewItemValues] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [editingListDescription, setEditingListDescription] = useState('');

  const [itemToDelete, setItemToDelete] = useState<{ listId: string; itemId: string } | null>(null);

  useEffect(() => {
    if (!configIsValid() || !db) {
      setError("Η σύνδεση με το Firebase απέτυχε.");
      setLoading(false);
      return;
    }

    const checkAndSeedData = async () => {
      const listsCollectionRef = collection(db, "tsia-custom-lists");
      const snapshot = await getDocs(listsCollectionRef);
      if (snapshot.empty) {
        console.log("No custom lists found, seeding initial data...");
        const batch = writeBatch(db);
        initialListsData.forEach(listData => {
          const listDocRef = doc(collection(db, "tsia-custom-lists"));
          batch.set(listDocRef, { title: listData.title, description: listData.description, createdAt: new Date() });
          listData.items.forEach(itemValue => {
            const itemDocRef = doc(collection(listDocRef, 'items'));
            batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
          });
        });
        await batch.commit();
        console.log("Initial data seeded successfully.");
      }
    };
    
    checkAndSeedData().then(() => {
        const listsQuery = query(collection(db, 'tsia-custom-lists'), orderBy('title'));

        const unsubscribe = onSnapshot(listsQuery, async (querySnapshot) => {
          try {
            const listsData = await Promise.all(
              querySnapshot.docs.map(async (docSnapshot) => {
                const list: CustomList = {
                  id: docSnapshot.id,
                  title: docSnapshot.data().title,
                  description: docSnapshot.data().description,
                  items: [],
                };
                const itemsCollectionRef = collection(db, 'tsia-custom-lists', list.id, 'items');
                const itemsQuery = query(itemsCollectionRef, orderBy('value'));
                const itemsSnapshot = await getDocs(itemsQuery);
                list.items = itemsSnapshot.docs.map(itemDoc => ({
                  id: itemDoc.id,
                  value: itemDoc.data().value,
                }));
                return list;
              })
            );
            setLists(listsData);
          } catch (err: any) {
             setError(`Σφάλμα φόρτωσης αντικειμένων λίστας: ${err.message}`);
          } finally {
             setLoading(false);
          }
        }, (err) => {
          setError(`Σφάλμα φόρτωσης λιστών: ${err.message}`);
          setLoading(false);
        });
        return () => unsubscribe();
    }).catch(err => {
        setError(`Σφάλμα αρχικοποίησης δεδομένων: ${err.message}`);
        setLoading(false);
    });

  }, []);

  const handleCreateList = async () => {
    if (!db || !newListTitle.trim()) {
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Ο τίτλος της λίστας είναι υποχρεωτικός." });
      return;
    }

    try {
      const listDocRef = await addDoc(collection(db, 'tsia-custom-lists'), {
        title: newListTitle,
        description: newListDescription,
        createdAt: new Date(),
      });

      const itemsToAdd = newListItems.split(';').map(item => item.trim()).filter(Boolean);
      if (itemsToAdd.length > 0) {
        const batch = writeBatch(db);
        const itemsCollectionRef = collection(db, 'tsia-custom-lists', listDocRef.id, 'items');
        itemsToAdd.forEach(itemValue => {
          const itemDocRef = doc(itemsCollectionRef);
          batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
        });
        await batch.commit();
      }

      toast({ title: "Επιτυχία", description: `Η λίστα "${newListTitle}" δημιουργήθηκε.` });
      setNewListTitle('');
      setNewListItems('');
      setNewListDescription('');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία δημιουργίας λίστας." });
    }
  };

  const handleAddItem = async (listId: string) => {
    const value = newItemValues[listId]?.trim();
    if (!db || !value) return;

    try {
      const itemsCollectionRef = collection(db, 'tsia-custom-lists', listId, 'items');
      await addDoc(itemsCollectionRef, { value: value, createdAt: new Date() });
      setNewItemValues(prev => ({ ...prev, [listId]: '' }));
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία προσθήκης αντικειμένου." });
    }
  };

  const handleDeleteItem = async () => {
    if (!db || !itemToDelete) return;
    const { listId, itemId } = itemToDelete;
    try {
      await deleteDoc(doc(db, 'tsia-custom-lists', listId, 'items', itemId));
      toast({ title: "Επιτυχία", description: "Το αντικείμενο διαγράφηκε." });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία διαγραφής." });
    } finally {
      setItemToDelete(null);
    }
  };
  
  const handleStartEditingList = (list: CustomList) => {
    setEditingListId(list.id);
    setEditingListTitle(list.title);
    setEditingListDescription(list.description || '');
  }
  
  const handleCancelEditingList = () => {
    setEditingListId(null);
    setEditingListTitle('');
    setEditingListDescription('');
  }
  
  const handleUpdateList = async () => {
    if(!db || !editingListId || !editingListTitle.trim()) return;
    
    try {
        const listRef = doc(db, 'tsia-custom-lists', editingListId);
        await updateDoc(listRef, {
            title: editingListTitle,
            description: editingListDescription,
        });
        toast({ title: "Επιτυχία", description: "Η λίστα ενημερώθηκε." });
        handleCancelEditingList();
    } catch(err) {
        console.error(err);
        toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία ενημέρωσης λίστας." });
    }
  }


  const filteredLists = lists.filter(list =>
    list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.items.some(item => item.value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-3"><List />Προσαρμοσμένες Λίστες</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Διαχειριστείτε τις λίστες επιλογών που χρησιμοποιούνται σε όλη την εφαρμογή.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Σφάλμα</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Δημιουργία Νέας Λίστας</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newListTitle">Τίτλος Λίστας (π.χ. Τύποι Έργων)</Label>
            <Input id="newListTitle" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Ορατό όνομα λίστας" />
          </div>
          <div>
            <Label htmlFor="newListDescription">Περιγραφή (Προαιρετικό)</Label>
            <Input id="newListDescription" value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} placeholder="Μια σύντομη περιγραφή του σκοπού της λίστας." />
          </div>
          <div>
            <Label htmlFor="newListItems">Αντικείμενα Λίστας (Προαιρετικό)</Label>
            <Textarea id="newListItems" value={newListItems} onChange={(e) => setNewListItems(e.target.value)} placeholder="Προσθήκη αντικειμένων, χωρισμένα με ερωτηματικό (;) για μαζική καταχώρηση." />
          </div>
          <Button onClick={handleCreateList}><Plus className="mr-2 h-4 w-4" />Δημιουργία Λίστας</Button>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Υπάρχουσες Λίστες</CardTitle>
          </CardHeader>
           <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Αναζήτηση σε τίτλο, περιγραφή ή αντικείμενα λίστας..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
                </div>
               {loading ? (
                    <p>Φόρτωση λιστών...</p>
                ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                    {filteredLists.map((list) => (
                    <AccordionItem value={list.id} key={list.id} className="bg-card/50 rounded-lg px-4 border">
                        <AccordionTrigger>
                            <div className="flex items-center justify-between w-full">
                                {editingListId === list.id ? (
                                    <div className="flex-1 mr-4">
                                        <Input value={editingListTitle} onChange={e => setEditingListTitle(e.target.value)} className="h-8 mb-1" onClick={e => e.stopPropagation()} />
                                        <Input value={editingListDescription} onChange={e => setEditingListDescription(e.target.value)} className="h-8 text-xs" placeholder="Περιγραφή" onClick={e => e.stopPropagation()} />
                                    </div>
                                ) : (
                                    <div className="text-left">
                                        <h3 className="font-semibold text-base">{list.title}</h3>
                                        {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mr-2">
                                     {editingListId === list.id ? (
                                        <>
                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateList(); }}>Αποθήκευση</Button>
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleCancelEditingList(); }}>Ακύρωση</Button>
                                        </>
                                     ) : (
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleStartEditingList(list); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                     )}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Προσθήκη (μεμονωμένα ή με ';' για μαζική)..."
                                    value={newItemValues[list.id] || ''}
                                    onChange={(e) => setNewItemValues(prev => ({ ...prev, [list.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                                />
                                <Button onClick={() => handleAddItem(list.id)}><Plus/></Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto pr-2">
                                {list.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                        <span>{item.value}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setItemToDelete({ listId: list.id, itemId: item.id })}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {list.items.length === 0 && <p className="text-sm text-muted-foreground p-2">Δεν υπάρχουν αντικείμενα σε αυτή τη λίστα.</p>}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                )}
           </CardContent>
      </Card>
      
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Είστε βέβαιοι;</AlertDialogTitle>
            <AlertDialogDescription>
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Το αντικείμενο θα διαγραφεί οριστικά.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Άκυρο</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
