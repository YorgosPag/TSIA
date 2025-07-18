
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, limit, startAfter, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Contact } from "@/features/contacts/types";

const PAGE_SIZE = 20;

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<DocumentData | null>(null);
  const initialLoadDone = useRef(false);

  const fetchContacts = useCallback(async (loadMore = false) => {
    if (!db) {
      setError("Η σύνδεση με το Firebase απέτυχε.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let q;
      if (loadMore && lastDocRef.current) {
        q = query(collection(db, "tsia-contacts"), orderBy("lastName", "asc"), startAfter(lastDocRef.current), limit(PAGE_SIZE));
      } else {
        q = query(collection(db, "tsia-contacts"), orderBy("lastName", "asc"), limit(PAGE_SIZE));
      }

      const documentSnapshots = await getDocs(q);

      const newContacts = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
      
      setContacts(prevContacts => loadMore ? [...prevContacts, ...newContacts] : newContacts);
      
      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      lastDocRef.current = lastVisible;

      if (documentSnapshots.docs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setError(null);

    } catch (err: any) {
        console.error("Firestore snapshot error:", err);
        if (err.message.includes('permission-denied')) {
          setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας του Firestore.");
        } else if (err.message.includes('requires an index')) {
          setError("Η ταξινόμηση απαιτεί τη δημιουργία ενός σύνθετου index στο Firestore.");
        } else {
          setError("Αποτυχία φόρτωσης δεδομένων.");
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) {
        fetchContacts();
        initialLoadDone.current = true;
    }
  }, [fetchContacts]);

  const addContact = useCallback(async (data: Omit<Contact, 'id'>): Promise<Contact> => {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "tsia-contacts"), data);
    const newContact = { id: docRef.id, ...data } as Contact;
    
    // Optimistically update UI
    setContacts(prev => [newContact, ...prev].sort((a, b) => a.lastName.localeCompare(b.lastName)));
    
    return newContact;
  }, []);

  const updateContact = useCallback(async (id: string, data: Partial<Omit<Contact, 'id' | 'createdAt'>>) => {
    if (!db) throw new Error("Firestore not initialized");
    await updateDoc(doc(db, "tsia-contacts", id), data);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    if (!db) throw new Error("Firestore not initialized");
    await deleteDoc(doc(db, "tsia-contacts", id));
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);
  
  const fetchMoreContacts = () => {
      if(hasMore && !loading){
          fetchContacts(true);
      }
  }

  return { contacts, loading, error, addContact, updateContact, deleteContact, fetchMoreContacts, hasMore };
}
