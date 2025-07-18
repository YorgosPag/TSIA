
'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const initialListsData = [
    { title: "Ρόλοι", description: "Λίστα με τους διαθέσιμους ρόλους για τις επαφές.", items: ["Πελάτης", "Συνεργάτης", "Προμηθευτής", "Λογιστήριο", "Δημόσιος Φορέας", "Εσωτερικός Χρήστης"] },
    { title: "Ειδικότητες", description: "Λίστα με τις διαθέσιμες ειδικότητες για τις επαφές.", items: ["Αρχιτέκτονας", "Μηχανικός", "Δικηγόρος", "Οικονομολόγος", "Υπάλληλος ΔΟΥ", "Υπάλληλος Πολεοδομίας", "Κατασκευαστής", "Λογιστής", "Ελεύθερος Επαγγελματίας"] },
    { title: "Κωδικός", description: "", items: ["1.A1", "1.B1", "1.C1", "1.D1", "1.E1", "1.Γ1", "1.Γ2"] },
    { title: "Κατηγορία Παρέμβασης", description: "", items: ["Κουφώματα", "Θερμομόνωση", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Λοιπές Παρεμβάσεις"] },
    { title: "Κατηγορία Δαπάνης", description: "", items: ["Κουφώματα (I)", "Θερμομόνωση (II)", "Συστήματα Θέρμανσης-Ψύξης (III)", "ΖΝΧ (IV)", "Λοιπές Παρεμβάσεις (V)"] },
    { title: "Υπο-Κατηγορία Παρέμβασης", description: "", items: ["Πλαίσιο PVC με υαλοπίνακα - Παράθυρο (U < 2,0)", "Πλαίσιο PVC με υαλοπίνακα - Εξωστόθυρα (U < 2,0)", "Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο)"] },
    { title: "info", description: "", items: ["Κουφώματα – Υαλοπίνακες – Συστήματα Σκίασης", "Θερμομόνωση", "Συστήματα Θέρμανσης - Ψύξης", "Συστήματα Παροχής Ζεστού Νερού Χρήσης (ΖΝΧ)", "Λοιπές Παρεμβάσεις Εξοικονόμησης Ενέργειας"] },
    { title: "Ενεργειακά Χαρακτηριστικά", description: "", items: ["U < 1.8", "Πάχος 10cm", "8kW < P ≤ 12kW", "200L"] },
    { title: "Τίτλοι Παρεμβάσεων", description: "", items: ["Αντικατάσταση Κουφωμάτων", "Εξωτερική Θερμομόνωση (Κέλυφος)", "Αντλία Θερμότητας", "Ηλιακός θερμοσίφωνας", "Φωτοβολταϊκό Σύστημα"] },
    { title: "Μονάδες Μέτρησης", description: "", items: ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση", "τεμ.", "m", "m³", "kWh"] },
    { title: "Στάδια Εξοικονομώ", description: "Τα επίσημα στάδια προόδου για έργα του προγράμματος \"Εξοικονομώ\".", items: ["0. Αρχική κατάσταση / Καταχώρηση", "1. Υποβολή αίτησης", "2. Αυτόματη βαθμολόγηση", "3. Προσωρινοί πίνακες", "4. Ενστάσεις & επικαιροποίηση", "5. Οριστικοί πίνακες"] },
];

// This hook runs only once on mount to check and seed initial data if the collection is empty.
export function useSeedCustomLists() {
    const [seeding, setSeeding] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAndSeedData = async () => {
            if (!db) {
                setError("Firebase not initialized");
                setSeeding(false);
                return;
            }
            try {
                const listsCollectionRef = collection(db, "tsia-custom-lists");
                const snapshot = await getDocs(listsCollectionRef);
                
                if (snapshot.empty) {
                    console.log("No custom lists found, seeding initial data...");
                    const batch = writeBatch(db);
                    initialListsData.forEach(listData => {
                        const listDocRef = doc(collection(db, "tsia-custom-lists"));
                        batch.set(listDocRef, { title: listData.title, description: listData.description, createdAt: new Date() });
                        listData.items.forEach(itemValue => {
                            const itemDocRef = doc(collection(listDocRef, 'items'));
                            batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
                        });
                    });
                    await batch.commit();
                    console.log("Initial data seeded successfully.");
                }
            } catch (err: any) {
                console.error("Error seeding data:", err);
                setError(err.message);
            } finally {
                setSeeding(false);
            }
        };

        checkAndSeedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures this runs only once.

    return { seeding, error };
}
