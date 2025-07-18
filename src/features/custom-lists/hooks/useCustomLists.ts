
'use client';

import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CustomList, ListItem } from '../types';

export function useCustomLists() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
        setError("Η σύνδεση με το Firebase απέτυχε.");
        setLoading(false);
        return;
    }

    const listsQuery = query(collection(db, 'tsia-custom-lists'), orderBy('title'));

    const unsubscribe = onSnapshot(listsQuery, async (querySnapshot) => {
      setLoading(true);
      try {
        const listsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const listData = docSnapshot.data();
            const list: CustomList = {
              id: docSnapshot.id,
              title: listData.title,
              description: listData.description,
              items: [],
            };
            const itemsCollectionRef = collection(db, 'tsia-custom-lists', list.id, 'items');
            const itemsQuery = query(itemsCollectionRef, orderBy('value'));
            const itemsSnapshot = await getDocs(itemsQuery);
            list.items = itemsSnapshot.docs.map(itemDoc => ({
              id: itemDoc.id,
              value: itemDoc.data().value,
            }));
            return list;
          })
        );
        setLists(listsData);
        setError(null);
      } catch (err: any) {
         setError(`Σφάλμα φόρτωσης αντικειμένων λίστας: ${err.message}`);
      } finally {
         setLoading(false);
      }
    }, (err) => {
      setError(`Σφάλμα φόρτωσης λιστών: ${err.message}`);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createList = useCallback(async (data: Omit<CustomList, 'id' | 'items'>, items: string[]) => {
    if (!db) throw new Error("Firestore not initialized");

    const listDocRef = await addDoc(collection(db, 'tsia-custom-lists'), {
      ...data,
      createdAt: new Date(),
    });

    if (items.length > 0) {
      const batch = writeBatch(db);
      const itemsCollectionRef = collection(db, 'tsia-custom-lists', listDocRef.id, 'items');
      items.forEach(itemValue => {
        const itemDocRef = doc(itemsCollectionRef);
        batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
      });
      await batch.commit();
    }
  }, []);

  const updateList = useCallback(async (id: string, data: Partial<CustomList>) => {
    if (!db) throw new Error("Firestore not initialized");
    const listRef = doc(db, 'tsia-custom-lists', id);
    await updateDoc(listRef, data);
  }, []);

  const deleteList = useCallback(async (id: string) => {
    if (!db) throw new Error("Firestore not initialized");
    const batch = writeBatch(db);
    
    // Delete all items in the subcollection first
    const itemsCollectionRef = collection(db, 'tsia-custom-lists', id, 'items');
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    itemsSnapshot.docs.forEach(itemDoc => {
      batch.delete(itemDoc.ref);
    });

    // Then delete the list document itself
    const listDocRef = doc(db, 'tsia-custom-lists', id);
    batch.delete(listDocRef);
    
    await batch.commit();
  }, []);
  
  const addItem = useCallback(async (listId: string, value: string) => {
      if (!db) throw new Error("Firestore not initialized");
      const itemsToAdd = value.split(';').map(item => item.trim()).filter(Boolean);
      
      const batch = writeBatch(db);
      const itemsCollectionRef = collection(db, 'tsia-custom-lists', listId, 'items');
      itemsToAdd.forEach(itemValue => {
          const itemDocRef = doc(itemsCollectionRef);
          batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
      });
      await batch.commit();
  }, []);

  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    if (!db) throw new Error("Firestore not initialized");
    await deleteDoc(doc(db, 'tsia-custom-lists', listId, 'items', itemId));
  }, []);

  return { lists, loading, error, createList, updateList, deleteList, addItem, deleteItem };
}
