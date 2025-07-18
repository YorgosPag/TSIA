"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Project } from "../types";

interface ProjectHeaderProps {
    project: Project | null;
    onEdit: () => void;
    onDelete: () => void;
}

export function ProjectHeader({ project, onEdit, onDelete }: ProjectHeaderProps) {
    if (!project) return null;

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{project.title}</h2>
                    <p className="text-muted-foreground">{project.status}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onEdit}><Edit className="mr-2 h-4 w-4"/>Επεξεργασία</Button>
                <Button variant="destructive" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4"/>Διαγραφή</Button>
            </div>
        </div>
    );
}
