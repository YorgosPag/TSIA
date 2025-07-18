
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/features/toast';
import type { Project } from '../types';

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
      const fetchedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Project));

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
