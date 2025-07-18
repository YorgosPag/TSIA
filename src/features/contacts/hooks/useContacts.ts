
'use client';

import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";
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
    const contactsCollectionRef = collection(db, "tsia-contacts");
    const q = query(contactsCollectionRef, orderBy("lastName", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedContacts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp)?.toDate() || new Date()
          } as Contact;
      });
      setContacts(fetchedContacts);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      if (err.message.includes('permission-denied')) {
        setError("Η πρόσβαση στη βάση δεδομένων απορρίφθηκε. Ελέγξτε τους κανόνες ασφαλείας του Firestore.");
      } else if (err.message.includes('requires an index')) {
        setError("Η ταξινόμηση απαιτεί τη δημιουργία ενός σύνθετου index στο Firestore.");
      } else {
        setError("Αποτυχία φόρτωσης δεδομένων.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addContact = useCallback(async (data: Omit<Contact, 'id'>): Promise<Contact> => {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "tsia-contacts"), data);
    const newContact = { id: docRef.id, ...data } as Contact;
    return newContact;
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
