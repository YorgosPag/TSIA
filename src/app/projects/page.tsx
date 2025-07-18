
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Plus, Search, GanttChart, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from "date-fns";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';


interface Project {
  id: string;
  title: string;
  description?: string;
  applicationNumber?: string;
  ownerId?: string;
  ownerName?: string;
  deadline?: any;
  status: 'Προσφορά' | 'Ενεργό' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
  createdAt: any;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  useEffect(() => {
    if (!configIsValid() || !db) {
        setError("Η σύνδεση με το Firebase απέτυχε!");
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const projectsCollectionRef = collection(db, "tsia-projects");
      const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Project));

        setProjects(fetchedProjects);
        
        if (selectedProject) {
            const updatedSelected = fetchedProjects.find(p => p.id === selectedProject.id);
            if(updatedSelected) {
                setSelectedProject(updatedSelected);
            } else {
                setSelectedProject(fetchedProjects.length > 0 ? fetchedProjects[0] : null);
            }
        } else if (fetchedProjects.length > 0) {
             setSelectedProject(fetchedProjects[0]);
        }
        
        if (fetchedProjects.length === 0) {
            setSelectedProject(null);
        }

        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Firestore snapshot error:", err);
        setError("Αποτυχία φόρτωσης δεδομένων. Ελέγξτε τις ρυθμίσεις του Firebase και την κονσόλα του browser.");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e: any) {
      console.error("Error setting up Firestore listener:", e);
      setError(`Προέκυψε ένα σφάλμα: ${e.message}`);
      setLoading(false);
    }
  }, [selectedProject]);

  const handleDeleteProject = async () => {
    if (!db || !projectToDelete) return;

    try {
        const currentlySelectedId = selectedProject?.id;
        const projectIndex = projects.findIndex(p => p.id === projectToDelete.id);

        await deleteDoc(doc(db, 'tsia-projects', projectToDelete.id));
        toast({ title: "Επιτυχία", description: `Το έργο "${projectToDelete.title}" διαγράφηκε.` });

        if(currentlySelectedId === projectToDelete.id) {
            const newProjects = projects.filter(p => p.id !== projectToDelete.id);
            if (newProjects.length > 0) {
                setSelectedProject(newProjects[Math.min(projectIndex, newProjects.length - 1)]);
            } else {
                setSelectedProject(null);
            }
        }
    } catch (err) {
        console.error("Delete project error:", err);
        toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Αποτυχία διαγραφής του έργου.",
        });
    } finally {
        setProjectToDelete(null);
    }
  };

  const handleEditClick = () => {
    if(selectedProject) {
      router.push(`/projects/${selectedProject.id}/edit`);
    }
  }
  
  return (
    <main className="flex flex-1 bg-background">
        <div className="w-1/3 border-r bg-card/50 overflow-y-auto">
             <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-semibold flex items-center gap-3"><GanttChart/>Λίστα Έργων</h1>
                        <p className="text-sm text-muted-foreground">Διαχειριστείτε τα έργα σας.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/projects/new"><Plus className="mr-2 h-4 w-4"/>Νέο</Link>
                    </Button>
                </div>

                <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Αναζήτηση έργου..." className="pl-10 w-full bg-card" />
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
                <div className="p-4 text-center text-muted-foreground">Φόρτωση έργων...</div>
            ) : (
                <nav className="flex flex-col gap-1 px-2">
                    {projects.map(project => (
                        <Button
                            key={project.id}
                            variant={selectedProject?.id === project.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto py-2"
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{project.title}</span>
                                <span className="text-xs text-muted-foreground">{project.status}</span>
                            </div>
                        </Button>
                    ))}
                </nav>
            )}
        </div>

        <div className="w-2/3 overflow-y-auto p-6">
            {selectedProject ? (
                <>
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                            <p className="text-muted-foreground">{selectedProject.status}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEditClick}><Edit className="mr-2 h-4 w-4"/>Επεξεργασία</Button>
                        <Button variant="outline" color="destructive" onClick={() => setProjectToDelete(selectedProject)}><Trash2 className="mr-2 h-4 w-4"/>Διαγραφή</Button>
                    </div>
                </div>

                <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-2">
                  <AccordionItem value="item-1" className="bg-card/50 rounded-lg px-4 border">
                    <AccordionTrigger><h3 className="font-semibold text-base">Βασικές Πληροφορίες</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                      <div><Label className="text-muted-foreground">Περιγραφή</Label><p className="text-sm font-medium whitespace-pre-wrap">{selectedProject.description || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Αριθμός Αίτησης</Label><p className="text-sm font-medium">{selectedProject.applicationNumber || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Ιδιοκτήτης / Ωφελούμενος</Label><p className="text-sm font-medium">{selectedProject.ownerName || '-'}</p></div>
                      <div><Label className="text-muted-foreground">Προθεσμία Ολοκλήρωσης</Label><p className="text-sm font-medium">{selectedProject.deadline ? format(selectedProject.deadline.toDate(), 'dd/MM/yyyy') : '-'}</p></div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                </>
            ) : (
                 !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <GanttChart className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">{ projects.length > 0 ? "Δεν επιλέχθηκε έργο" : "Δεν υπάρχουν έργα"}</h2>
                        <p>{ projects.length > 0 ? "Επιλέξτε ένα έργο από τη λίστα για να δείτε τις λεπτομέρειες." : "Πατήστε 'Νέο' για να προσθέσετε το πρώτο σας έργο."}</p>
                    </div>
                )
            )}
        </div>

        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Είστε βέβαιοι για τη διαγραφή του έργου "{projectToDelete?.title}" ;</AlertDialogTitle>
                    <AlertDialogDescription>
                        Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Το έργο θα διαγραφεί οριστικά.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Άκυρο</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Διαγραφή
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </main>
  );
}
