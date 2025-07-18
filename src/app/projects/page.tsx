
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectDeleteDialog } from '@/features/projects/components/ProjectDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart, Plus, Search, TriangleAlert } from 'lucide-react';
import type { Project } from '@/features/projects/types';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type Status = 'Όλα' | 'Προσφορά' | 'Εντός Χρονοδιαγράμματος' | 'Σε Καθυστέρηση' | 'Ολοκληρωμένο' | 'Ακυρωμένο';

const STATUS_TABS: Status[] = ['Όλα', 'Προσφορά', 'Εντός Χρονοδιαγράμματος', 'Σε Καθυστέρηση', 'Ολοκληρωμένο', 'Ακυρωμένο'];

const getProjectStatus = (project: Project): Status => {
    if (project.status === 'Ακυρωμένο') return 'Ακυρωμένο';
    if (project.status === 'Ολοκληρωμένο') return 'Ολοκληρωμένο';
    if (project.status === 'Προσφορά') return 'Προσφορά';
    
    // Check for delay only if there is a deadline
    if (project.deadline && project.deadline.toDate() < new Date() && project.status !== 'Ολοκληρωμένο') {
        return 'Σε Καθυστέρηση';
    }

    return 'Εντός Χρονοδιαγράμματος';
}

export default function ProjectsPage() {
  const { projects, loading, error, deleteProject } = useProjects();
  
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<Status>('Όλα');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const augmentedProjects = useMemo(() => {
    return projects.map(p => ({...p, derivedStatus: getProjectStatus(p)}));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let projs = augmentedProjects;

    if (activeTab === 'Εντός Χρονοδιαγράμματος') {
        projs = projs.filter(p => p.derivedStatus === 'Εντός Χρονοδιαγράμματος');
    } else if (activeTab !== 'Όλα') {
        projs = projs.filter(p => p.derivedStatus === activeTab);
    }
    
    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      projs = projs.filter(p =>
        p.title.toLowerCase().includes(lowercasedTerm) ||
        p.ownerName?.toLowerCase().includes(lowercasedTerm) ||
        p.applicationNumber?.toLowerCase().includes(lowercasedTerm)
      );
    }
    return projs;
  }, [augmentedProjects, activeTab, debouncedSearchTerm]);

  const statusCounts = useMemo(() => {
     const counts: Record<Status, number> = {
        'Όλα': projects.length,
        'Προσφορά': 0,
        'Εντός Χρονοδιαγράμματος': 0,
        'Σε Καθυστέρηση': 0,
        'Ολοκληρωμένο': 0,
        'Ακυρωμένο': 0,
    };
    augmentedProjects.forEach(p => {
        if(counts[p.derivedStatus] !== undefined) {
           counts[p.derivedStatus]++;
        }
    });
    
    return counts;
  }, [projects.length, augmentedProjects]);


  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };
  
  const tabDisplayName = (tab: Status) => {
    if(tab === 'Εντός Χρονοδιαγράμματος') return 'Ενεργά';
    return tab;
  }

  const getTabCount = (tab: Status): number => {
    if (tab === 'Όλα') return projects.length;
    if (tab === 'Εντός Χρονοδιαγράμματος') return statusCounts['Εντός Χρονοδιαγράμματος'];
    return statusCounts[tab];
  }
  
  return (
    <main className="flex-1 p-6 bg-background">
       <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                 <GanttChart className="h-6 w-6"/>
                <div>
                  <h1 className="text-2xl font-semibold">Λίστα Έργων & Προσφορών</h1>
                  <p className="text-sm text-muted-foreground">Δείτε και διαχειριστείτε όλες τις προσφορές, τα ενεργά και τα ολοκληρωμένα έργα.</p>
                </div>
            </div>
            <Button asChild>
                <Link href="/projects/new"><Plus className="mr-2 h-4 w-4"/>Δημιουργία Έργου/Προσφοράς</Link>
            </Button>
        </div>

        <div className="mb-6">
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                    placeholder="Αναζήτηση έργου, αίτησης, ή ιδιοκτήτη..." 
                    className="pl-10 w-full bg-card"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Status)}>
            <TabsList className="bg-transparent p-0 border-b border-border rounded-none">
                {STATUS_TABS.map(tab => (
                   (tab === 'Όλα' || getTabCount(tab) > 0) && (
                     <TabsTrigger 
                        key={tab} 
                        value={tab}
                        className="bg-transparent shadow-none rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary data-[state=active]:text-primary"
                    >
                        {tabDisplayName(tab)} ({getTabCount(tab)})
                    </TabsTrigger>
                   )
                ))}
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Σφάλμα</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                 {loading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[290px] rounded-lg" />)}
                    </div>
                ) : filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProjects.map(project => (
                            <ProjectCard 
                                key={project.id} 
                                project={project}
                                onDelete={() => setProjectToDelete(project)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <GanttChart className="h-16 w-16 mb-4 text-muted-foreground"/>
                        <h2 className="text-xl font-semibold text-muted-foreground">Δεν βρέθηκαν έργα</h2>
                        <p className="text-muted-foreground">Δεν υπάρχουν έργα που να ταιριάζουν με τα επιλεγμένα φίλτρα.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
      

      <ProjectDeleteDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        project={projectToDelete}
      />
    </main>
  );
}

    