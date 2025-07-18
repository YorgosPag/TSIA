"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert, Plus, Search, GanttChart } from 'lucide-react';
import type { Project } from '../types';

interface ProjectListProps {
    projects: Project[];
    loading: boolean;
    error: string | null;
    selectedProjectId?: string;
    onSelectProject: (project: Project) => void;
}

export function ProjectList({
    projects,
    loading,
    error,
    selectedProjectId,
    onSelectProject
}: ProjectListProps) {

    // TODO: Implement search functionality
    // const [searchTerm, setSearchTerm] = useState('');

    return (
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
                            variant={selectedProjectId === project.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto py-2"
                            onClick={() => onSelectProject(project)}
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
    );
}
