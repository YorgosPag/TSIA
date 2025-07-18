
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { ProjectDetails } from '@/features/projects/components/ProjectDetails';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { ProjectDeleteDialog } from '@/features/projects/components/ProjectDeleteDialog';
import { GanttChart } from 'lucide-react';
import type { Project } from '@/features/projects/types';

export default function ProjectsPage() {
  const { projects, loading, error, deleteProject } = useProjects();
  const router = useRouter();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    } else if (selectedProject) {
      const stillExists = projects.some(p => p.id === selectedProject.id);
      if (!stillExists) {
        setSelectedProject(projects.length > 0 ? projects[0] : null);
      }
    }
  }, [projects, selectedProject]);


  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };

  const handleEdit = () => {
    if (selectedProject) {
      router.push(`/projects/${selectedProject.id}/edit`);
    }
  };
  
  return (
    <main className="flex flex-1 bg-background">
      <ProjectList 
        projects={projects}
        loading={loading}
        error={error}
        selectedProjectId={selectedProject?.id}
        onSelectProject={setSelectedProject}
      />
      <div className="w-2/3 overflow-y-auto p-6">
        {selectedProject ? (
          <>
            <ProjectHeader
              project={selectedProject}
              onEdit={handleEdit}
              onDelete={() => setProjectToDelete(selectedProject)}
            />
            <ProjectDetails project={selectedProject} />
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

      <ProjectDeleteDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        project={projectToDelete}
      />
    </main>
  );
}
