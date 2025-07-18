
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/features/toast';
import type { Project } from '../types';

// Mock progress for demonstration
const mockProgress = (project: Project): number => {
  if (project.status === 'Ολοκληρωμένο') return 100;
  if (project.status === 'Ακυρωμένο') return 0;
   if (project.status === 'Προσφορά') return 0;
  // create a stable random progress based on id
  const hash = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 85) + 15; // progress between 15 and 100
}

const mockCost = (project: Project): number => {
    const hash = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0) * 1.5, 0);
    return (hash % 20000) + 5000; // cost between 5000 and 25000
}


export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
        setError("Η σύνδεση με το Firebase απέτυχε.");
        setLoading(false);
        return;
    }

    setLoading(true);
    const projectsCollectionRef = collection(db, "tsia-projects");
    const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc) => {
          const data = doc.data();
          const projectBase = { id: doc.id, ...data } as Project;
          return {
            ...projectBase,
            progress: mockProgress(projectBase),
            cost: mockCost(projectBase),
          } as Project
      });

      setProjects(fetchedProjects);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      if (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions')) {
          setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας (Rules) του Firestore.");
        } else if (err.message.includes('firestore/unavailable')) {
             setError("Η υπηρεσία Firestore δεν είναι διαθέσιμη. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο και τις ρυθμίσεις του Firebase project.");
        } else if (err.message.includes('requires an index')) {
             setError("Η ταξινόμηση απαιτεί τη δημιουργία ενός σύνθετου index στο Firestore. Δοκιμάστε να το δημιουργήσετε από το σύνδεσμο στο μήνυμα σφάλματος στην κονσόλα του browser.");
        } else {
          setError("Αποτυχία φόρτωσης δεδομένων. Ελέγξτε τις ρυθμίσεις του Firebase και την κονσόλα του browser για περισσότερες λεπτομέρειες.");
        }
      setLoading(false);
    });

    return () => unsubscribe();
    
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    if (!db) {
        toast({ variant: "destructive", title: "Σφάλμα", description: "Η σύνδεση με τη βάση δεδομένων απέτυχε." });
        return;
    }
    try {
        await deleteDoc(doc(db, 'tsia-projects', projectId));
        toast({ title: "Επιτυχία", description: "Το έργο διαγράφηκε." });
    } catch (err) {
        console.error("Delete project error:", err);
        toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Αποτυχία διαγραφής του έργου.",
        });
    }
  }, [toast]);

  return { projects, loading, error, deleteProject };
}
