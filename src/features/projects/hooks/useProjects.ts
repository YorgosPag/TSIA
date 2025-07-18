"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, configIsValid } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!configIsValid() || !db) {
        setError("Η σύνδεση με το Firebase απέτυχε!");
        setLoading(false);
        return;
    }

    setLoading(true);
    const projectsCollectionRef = collection(db, "tsia-projects");
    const q = query(projectsCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Project));

      setProjects(fetchedProjects);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      setError("Αποτυχία φόρτωσης δεδομένων. Ελέγξτε τις ρυθμίσεις του Firebase και την κονσόλα του browser.");
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
