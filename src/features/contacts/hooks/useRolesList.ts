
'use client';

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ListItem } from "@/features/contacts/types";

export function useRolesList() {
    const [rolesList, setRolesList] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db) {
            setError("Η σύνδεση με το Firebase απέτυχε.");
            setLoading(false);
            return;
        }

        const fetchRoles = async () => {
            setLoading(true);
            try {
                const listsQuery = query(collection(db, 'tsia-custom-lists'), where('title', '==', 'Ρόλοι'));
                const querySnapshot = await getDocs(listsQuery);
                if (!querySnapshot.empty) {
                    const rolesListDoc = querySnapshot.docs[0];
                    const itemsCollectionRef = collection(db, 'tsia-custom-lists', rolesListDoc.id, 'items');
                    const itemsQuery = query(itemsCollectionRef, orderBy('value'));
                    const itemsSnapshot = await getDocs(itemsQuery);
                    const roles = itemsSnapshot.docs.map(doc => ({ id: doc.id, value: doc.data().value }));
                    setRolesList(roles);
                }
            } catch (err: any) {
                console.error("Error fetching roles:", err);
                setError("Αποτυχία φόρτωσης λίστας ρόλων.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { rolesList, loading, error };
}
