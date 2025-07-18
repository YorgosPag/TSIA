
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Edit, ExternalLink, MoreVertical, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { el } from 'date-fns/locale';
import type { Project } from "../types";

interface ProjectCardProps {
    project: Project;
    onDelete: () => void;
}

const statusStyles = {
    'Εντός Χρονοδιαγράμματος': { badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20', progress: 'bg-blue-500' },
    'Σε Καθυστέρηση': { badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', progress: 'bg-amber-500' },
    'Ολοκληρωμένο': { badge: 'bg-green-500/10 text-green-500 border-green-500/20', progress: 'bg-green-500' },
    'Προσφορά': { badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', progress: 'bg-yellow-500' },
    'Ακυρωμένο': { badge: 'bg-gray-500/10 text-gray-500 border-gray-500/20', progress: 'bg-gray-500' },
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
    const router = useRouter();
    const status = project.derivedStatus as keyof typeof statusStyles;

    const handleEdit = () => {
        router.push(`/projects/${project.id}/edit`);
    }
    
    return (
        <Card className="flex flex-col bg-card hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <div className="text-xs text-muted-foreground">
                        <p className="font-semibold text-card-foreground">{project.ownerName || 'Άγνωστος Ιδιοκτήτης'}</p>
                        <p>Αρ. Αίτησης: {project.applicationNumber || '-'}</p>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 text-muted-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}><Edit className="mr-2 h-4 w-4"/>Επεξεργασία</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Διαγραφή</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                <p className="font-bold text-base leading-tight mb-3">{project.title}</p>
                <div className="flex gap-2 mb-4">
                     <Badge variant="outline" className={`text-xs font-semibold ${statusStyles[status]?.badge || statusStyles['Ακυρωμένο'].badge}`}>{status}</Badge>
                    {status === 'Σε Καθυστέρηση' && <Badge variant="destructive" className="gap-1.5"><AlertTriangle className="h-3 w-3" />1 Ειδοποίηση</Badge>}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Πρόοδος</span>
                        <span className="text-xs font-bold">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" indicatorClassName={statusStyles[status]?.progress || statusStyles['Ακυρωμένο'].progress} />
                </div>
                 <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-3">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Προθεσμία: {project.deadline && project.deadline.toDate ? format(project.deadline.toDate(), 'dd/MM/yyyy', { locale: el }) : '-'}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 mt-auto">
                <span className="text-base font-bold">
                    {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(project.cost ?? 0)}
                </span>
                <Button variant="link" size="sm" className="text-primary hover:text-primary font-semibold p-0 h-auto" asChild>
                    <Link href={`/projects/${project.id}/edit`}>
                        Προβολή Έργου <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
