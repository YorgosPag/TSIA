"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import type { Project } from "../types";

interface ProjectDetailsProps {
    project: Project | null;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
    if (!project) return null;

    return (
        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-2">
          <AccordionItem value="item-1" className="bg-card/50 rounded-lg px-4 border">
            <AccordionTrigger><h3 className="font-semibold text-base">Βασικές Πληροφορίες</h3></AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
              <div><Label className="text-muted-foreground">Περιγραφή</Label><p className="text-sm font-medium whitespace-pre-wrap">{project.description || '-'}</p></div>
              <div><Label className="text-muted-foreground">Αριθμός Αίτησης</Label><p className="text-sm font-medium">{project.applicationNumber || '-'}</p></div>
              <div><Label className="text-muted-foreground">Ιδιοκτήτης / Ωφελούμενος</Label><p className="text-sm font-medium">{project.ownerName || '-'}</p></div>
              <div><Label className="text-muted-foreground">Προθεσμία Ολοκλήρωσης</Label><p className="text-sm font-medium">{project.deadline ? format(project.deadline.toDate(), 'dd/MM/yyyy') : '-'}</p></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    );
}
