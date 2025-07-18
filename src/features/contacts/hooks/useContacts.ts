
'use client';

import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Contact } from "@/features/contacts/types";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
        setError("Η σύνδεση με το Firebase απέτυχε.");
        setLoading(false);
        return;
    }

    setLoading(true);
    const q = query(collection(db, "tsia-contacts"), orderBy("lastName", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
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

  const addContact = useCallback(async (data: Omit<Contact, 'id'>) => {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "tsia-contacts"), data);
    return docRef.id;
  }, []);

  const updateContact = useCallback(async (id: string, data: Partial<Omit<Contact, 'id' | 'createdAt'>>) => {
    if (!db) throw new Error("Firestore not initialized");
    await updateDoc(doc(db, "tsia-contacts", id), data);
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    if (!db) throw new Error("Firestore not initialized");
    await deleteDoc(doc(db, "tsia-contacts", id));
  }, []);

  return { contacts, loading, error, addContact, updateContact, deleteContact };
}
