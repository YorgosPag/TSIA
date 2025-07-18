"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from 'next/link';
import { doc, getDoc, updateDoc, collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronLeft, Edit } from "lucide-react";
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

interface Project {
  title: string;
  description: string;
  applicationNumber: string;
  ownerId?: string;
  deadline?: Date;
  status: 'Προσφορά' | 'Ενεργό' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
}

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;
    const { toast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    const fetchProjectData = useCallback(async () => {
        if (!db || !projectId) return;
        setLoading(true);
        try {
            const projectDocRef = doc(db, 'tsia-projects', projectId);
            const docSnap = await getDoc(projectDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setProject({
                    title: data.title,
                    description: data.description || '',
                    applicationNumber: data.applicationNumber || '',
                    ownerId: data.ownerId || undefined,
                    status: data.status || 'Προσφορά',
                    deadline: data.deadline ? (data.deadline as Timestamp).toDate() : undefined
                });
            } else {
                 toast({ variant: 'destructive', title: "Σφάλμα", description: "Το έργο δεν βρέθηκε." });
                 router.push('/projects');
            }
        } catch (error) {
            console.error("Error fetching project: ", error);
            toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία φόρτωσης δεδομένων του έργου." });
        } finally {
            setLoading(false);
        }
    }, [projectId, router, toast]);

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
        fetchProjectData();
    }, [toast, fetchProjectData]);
    
    const handleUpdateField = (field: keyof Project, value: any) => {
        setProject(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleUpdateProject = async () => {
        if (!db || !project || !project.title.trim()) {
            toast({ variant: 'destructive', title: "Σφάλμα", description: "Ο τίτλος του έργου είναι υποχρεωτικός." });
            return;
        }

        const selectedContact = contacts.find(c => c.id === project.ownerId);

        try {
            const projectDocRef = doc(db, 'tsia-projects', projectId);
            await updateDoc(projectDocRef, {
                ...project,
                ownerName: selectedContact ? getDisplayName(selectedContact) : null,
            });

            toast({ title: "Επιτυχία", description: `Το έργο "${project.title}" ενημερώθηκε.` });
            router.push('/projects');

        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: "Σφάλμα", description: "Αποτυχία ενημέρωσης του έργου." });
        }
    };
    
    if (loading || !project) {
        return (
            <main className="flex-1 p-6 bg-background flex justify-center items-start">
                <p>Φόρτωση έργου...</p>
            </main>
        )
    }


    return (
        <main className="flex-1 p-6 bg-background flex justify-center items-start">
            <div className="w-full max-w-2xl space-y-4">
                <Button variant="ghost" asChild className="mb-4">
                   <Link href="/projects"><ChevronLeft className="mr-2 h-4 w-4" />Επιστροφή στη Λίστα Έργων</Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Edit/>Επεξεργασία Έργου</CardTitle>
                        <CardDescription>Ενημερώστε τις πληροφορίες του έργου.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Τίτλος Έργου</Label>
                            <Input id="title" value={project.title} onChange={(e) => handleUpdateField('title', e.target.value)} placeholder="π.χ., Ανακαίνιση κατοικίας Παπαδόπουλου" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Περιγραφή</Label>
                            <Textarea id="description" value={project.description} onChange={(e) => handleUpdateField('description', e.target.value)} placeholder="Μια σύντομη περιγραφή των στόχων και του αντικειμένου του έργου." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="status">Κατάσταση Έργου</Label>
                             <Select onValueChange={(value) => handleUpdateField('status', value)} value={project.status}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Επιλέξτε κατάσταση..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Προσφορά">Προσφορά</SelectItem>
                                    <SelectItem value="Ενεργό">Ενεργό</SelectItem>
                                    <SelectItem value="Ολοκληρωμένο">Ολοκληρωμένο</SelectItem>
                                    <SelectItem value="Ακυρωμένο">Ακυρωμένο</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="applicationNumber">Αριθμός Αίτησης (Προαιρετικό)</Label>
                            <Input id="applicationNumber" value={project.applicationNumber} onChange={(e) => handleUpdateField('applicationNumber', e.target.value)} placeholder="π.χ., ΕΞ-2024-123" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="owner">Ιδιοκτήτης / Ωφελούμενος</Label>
                             <Select onValueChange={(value) => handleUpdateField('ownerId', value)} value={project.ownerId}>
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
                                        !project.deadline && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {project.deadline ? format(project.deadline, "PPP") : <span>Επιλέξτε ημερομηνία</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={project.deadline}
                                    onSelect={(date) => handleUpdateField('deadline', date)}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        <Button onClick={handleUpdateProject} size="lg" className="w-full">Αποθήκευση Αλλαγών</Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
