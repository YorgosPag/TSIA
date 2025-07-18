
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/features/toast";
import { cn } from "@/lib/utils";


interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

const getDisplayName = (contact: Contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return fullName || contact.companyName;
};

export default function NewProjectPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [applicationNumber, setApplicationNumber] = useState('');
    const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            if(!db) return;
            setLoadingContacts(true);
            try {
                const contactsCollectionRef = collection(db, "tsia-contacts");
                const q = query(contactsCollectionRef, orderBy("lastName", "asc"));
                const snapshot = await getDocs(q);
                const fetchedContacts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Contact));
                setContacts(fetchedContacts);
            } catch (error) {
                console.error("Error fetching contacts: ", error);
                toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία φόρτωσης λίστας επαφών." });
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContacts();
    }, [toast]);


    const handleCreateProject = async () => {
        if (!db || !title.trim()) {
            toast({ variant: 'destructive', title: "Σφάλμα", description: "Ο τίτλος του έργου είναι υποχρεωτικός." });
            return;
        }

        const selectedContact = contacts.find(c => c.id === ownerId);

        try {
            await addDoc(collection(db, 'tsia-projects'), {
                title,
                description,
                applicationNumber,
                ownerId: ownerId || null,
                ownerName: selectedContact ? getDisplayName(selectedContact) : null,
                deadline: deadline || null,
                status: 'Προσφορά',
                createdAt: new Date(),
            });

            toast({ title: "Επιτυχία", description: `Το έργο "${title}" δημιουργήθηκε.` });
            router.push('/projects');

        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία δημιουργίας έργου." });
        }
    };


    return (
        <main className="flex-1 p-6 bg-background flex justify-center items-start">
            <div className="w-full max-w-2xl space-y-4">
                <Button variant="ghost" asChild className="mb-4">
                   <Link href="/projects"><ChevronLeft className="mr-2 h-4 w-4" />Επιστροφή στη Λίστα Έργων</Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Plus/>Δημιουργία Νέου Έργου / Προσφοράς</CardTitle>
                        <CardDescription>Συμπληρώστε τις παρακάτω πληροφορίες. Το νέο έργο θα δημιουργηθεί αρχικά σε κατάσταση "Προσφοράς".</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Τίτλος Έργου</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="π.χ., Ανακαίνιση κατοικίας Παπαδόπουλου" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Περιγραφή</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Μια σύντομη περιγραφή των στόχων και του αντικειμένου του έργου." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="applicationNumber">Αριθμός Αίτησης (Προαιρετικό)</Label>
                            <Input id="applicationNumber" value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} placeholder="π.χ., ΕΞ-2024-123" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="owner">Ιδιοκτήτης / Ωφελούμενος</Label>
                             <Select onValueChange={setOwnerId} value={ownerId}>
                                <SelectTrigger id="owner">
                                    <SelectValue placeholder={loadingContacts ? "Φόρτωση επαφών..." : "Επιλέξτε από τη λίστα επαφών..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map(contact => (
                                        <SelectItem key={contact.id} value={contact.id}>
                                            {getDisplayName(contact)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Προθεσμία Ολοκλήρωσης Έργου (Προαιρετικό)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !deadline && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {deadline ? format(deadline, "PPP") : <span>Επιλέξτε ημερομηνία</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={deadline}
                                    onSelect={setDeadline}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        <Button onClick={handleCreateProject} size="lg" className="w-full">Δημιουργία Έργου</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

    