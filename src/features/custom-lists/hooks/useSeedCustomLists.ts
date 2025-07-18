
'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Ρεαλιστικά Δεδομένα για Επαφές (Contacts) - Provided by User ---
const contactsData = [
  {
    "firstName": "Άγγελος",
    "lastName": "Κωνσταντινίδης",
    "companyName": "",
    "role": "Πελάτης",
    "type": "Ιδιώτης",
    "phone": "6981234567",
    "email": "angelos.konst@gmail.com",
    "address": "Μελά Παύλου 30",
    "city": "Θεσσαλονίκη",
    "vatNumber": "012345678",
    "taxOffice": "Α' Θεσσαλονίκης",
    "notes": "Ζητάει προσφορά για ανακαίνιση.",
    "createdAt": new Date("2024-07-01T10:24:00.000Z")
  },
  {
    "firstName": "",
    "lastName": "",
    "companyName": "MONOPROSOPI PRIMASUN I.K.E.",
    "role": "Προμηθευτής",
    "type": "Εταιρεία",
    "phone": "2310999999",
    "email": "info@primasun.gr",
    "address": "Βασιλίσσης Όλγας 80",
    "city": "Θεσσαλονίκη",
    "vatNumber": "099912345",
    "taxOffice": "Δ' Θεσσαλονίκης",
    "notes": "Ειδίκευση σε θερμομονώσεις.",
    "createdAt": new Date("2024-07-10T14:10:00.000Z")
  },
  {
    "firstName": "Δέσποινα",
    "lastName": "Καψίδου",
    "companyName": "",
    "role": "Πελάτης",
    "type": "Ιδιώτης",
    "phone": "",
    "email": "despoina.k@gmail.com",
    "address": "Ναυαρίνου 12",
    "city": "Καβάλα",
    "vatNumber": "",
    "taxOffice": "",
    "notes": "Έργο ολοκληρωμένο.",
    "createdAt": new Date("2023-11-19T12:30:00.000Z")
  },
  {
    "firstName": "Γεώργιος",
    "lastName": "Κυριελίδης",
    "companyName": "",
    "role": "Συνεργάτης",
    "type": "Μηχανικός",
    "phone": "6974123456",
    "email": "gkyrielidis@engmail.com",
    "address": "Στρατηγού Καλλάρη 19",
    "city": "Δράμα",
    "vatNumber": "112233445",
    "taxOffice": "Δράμας",
    "notes": "",
    "createdAt": new Date("2024-06-18T16:20:00.000Z")
  },
  {
    "firstName": "",
    "lastName": "",
    "companyName": "Ανατολή Εύα Καραγιάννη",
    "role": "Πελάτης",
    "type": "",
    "phone": "",
    "email": "karagianni.anatoli@gmail.com",
    "address": "Μαρτίου 40",
    "city": "Αλεξανδρούπολη",
    "vatNumber": "113355779",
    "taxOffice": "Αλεξανδρούπολης",
    "notes": "Έχει αιτηθεί για Εξοικονομώ.",
    "createdAt": new Date("2024-07-10T08:00:00.000Z")
  }
];

// --- Ρεαλιστικά Δεδομένα για Προσαρμοσμένες Λίστες ---
const initialListsData = [
    { title: "Ρόλοι", description: "Λίστα με τους διαθέσιμους ρόλους για τις επαφές.", items: ["Πελάτης", "Συνεργάτης", "Προμηθευτής", "Λογιστήριο", "Δημόσιος Υπάλληλος", "Εσωτερικός Χρήστης"] },
    { title: "Ειδικότητες", description: "Λίστα με τις διαθέσιμες ειδικότητες.", items: ["Ιδιώτης", "Αρχιτέκτονας", "Πολιτικός Μηχανικός", "Δικηγόρος", "Οικονομολόγος", "Υπάλληλος Πολεοδομίας", "Υπάλληλος ΔΟΥ", "Κατασκευαστής", "Λογιστής", "Ελεύθερος Επαγγελματίας"] },
    { title: "Είδη Προμηθευτών", description: "Κατηγορίες υλικών και υπηρεσιών από προμηθευτές.", items: ["Κουφώματα", "Δομικά Υλικά", "Συστήματα Θέρμανσης-Ψύξης", "Ηλεκτρολογικό Υλικό", "Υδραυλικά"] },
    { title: "Κατηγορία Παρέμβασης", description: "", items: ["Κουφώματα", "Θερμομόνωση", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Λοιπές Παρεμβάσεις"] },
    { title: "Μονάδες Μέτρησης", description: "", items: ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση", "τεμ.", "m", "m³", "kWh"] },
    { title: "Κατάσταση Έργου", description: "Οι κύριες καταστάσεις ενός έργου.", items: ["Προσφορά", "Ενεργό", "Ολοκληρωμένο", "Ακυρωμένο"] },
];

/**
 * Hook που εκτελείται μία φορά για να ελέγξει και να εισάγει αρχικά δεδομένα (seeding)
 * αν οι συλλογές `tsia-custom-lists`, `tsia-contacts` και `tsia-projects` είναι άδειες.
 */
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
                const batch = writeBatch(db);
                
                // 1. Έλεγχος και Seeding Προσαρμοσμένων Λιστών
                const listsSnapshot = await getDocs(collection(db, "tsia-custom-lists"));
                if (listsSnapshot.empty) {
                    console.log("No custom lists found, seeding initial data...");
                    initialListsData.forEach(listData => {
                        const listDocRef = doc(collection(db, "tsia-custom-lists"));
                        batch.set(listDocRef, { title: listData.title, description: listData.description, createdAt: new Date() });
                        listData.items.forEach(itemValue => {
                            const itemDocRef = doc(collection(listDocRef, 'items'));
                            batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
                        });
                    });
                }

                // 2. Έλεγχος και Seeding Επαφών
                const contactsSnapshot = await getDocs(collection(db, "tsia-contacts"));
                let createdContacts: { id: string; name: string; }[] = [];
                if (contactsSnapshot.empty) {
                    console.log("No contacts found, seeding with production data...");
                    contactsData.forEach(contactData => {
                        const contactDocRef = doc(collection(db, "tsia-contacts"));
                        batch.set(contactDocRef, { ...contactData });
                        const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || contactData.companyName;
                        createdContacts.push({ id: contactDocRef.id, name: fullName as string });
                    });
                } else {
                    // Αν υπάρχουν ήδη επαφές, τις χρειαζόμαστε για να δημιουργήσουμε τα έργα
                    createdContacts = contactsSnapshot.docs.map(d => {
                        const data = d.data();
                        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.companyName;
                        return { id: d.id, name: fullName };
                    });
                }

                // 3. Έλεγχος και Seeding Έργων
                const projectsSnapshot = await getDocs(collection(db, "tsia-projects"));
                if (projectsSnapshot.empty && createdContacts.length > 0) {
                    console.log("No projects found, seeding initial data...");
                    const projectsData = [
                        { title: "Ανακαίνιση διαμερίσματος στην Τούμπα", status: 'Ενεργό', deadline: new Date(2024, 11, 20) },
                        { title: "Ενεργειακή Αναβάθμιση Μονοκατοικίας στο Πανόραμα", status: 'Ολοκληρωμένο', deadline: new Date(2023, 10, 15) },
                        { title: "Προσφορά για μελέτη στατικής επάρκειας", status: 'Προσφορά', deadline: null },
                        { title: "Αλλαγή κουφωμάτων σε πολυκατοικία στο κέντρο", status: 'Σε Καθυστέρηση', deadline: new Date(2024, 6, 1) },
                        { title: "Τακτοποίηση αυθαιρέτου χώρου", status: 'Ακυρωμένο', deadline: null },
                        { title: "Κατασκευή νέας διώροφης κατοικίας στην Επανομή", status: 'Ενεργό', deadline: new Date(2025, 5, 30) },
                        { title: "Προσφορά για έκδοση ενεργειακού πιστοποιητικού", status: 'Προσφορά', deadline: null },
                        { title: "Ανακαίνιση γραφείου στην Καλαμαριά", status: 'Ολοκληρωμένο', deadline: new Date(2024, 1, 28) },
                        { title: "Μελέτη πυρασφάλειας για κατάστημα υγειονομικού ενδιαφέροντος", status: 'Ενεργό', deadline: new Date(2024, 8, 10) },
                        { title: "Προσθήκη κατ' επέκταση σε υπάρχουσα κατοικία", status: 'Προσφορά', deadline: null },
                    ];
                    
                    projectsData.forEach((proj, index) => {
                        const ownerContact = createdContacts[index % createdContacts.length];
                        const projectDocRef = doc(collection(db, "tsia-projects"));
                        batch.set(projectDocRef, {
                            ...proj,
                            ownerId: ownerContact.id,
                            ownerName: ownerContact.name,
                            applicationNumber: `ΕΞ-${2024 - (index % 3)}-${String(1000 + index).padStart(4, '0')}`,
                            description: `Περιγραφή για το έργο: ${proj.title}`,
                            createdAt: new Date(new Date().getTime() - (index * 1000 * 60 * 60 * 24 * 7)) // Πηγαίνει πίσω κατά 1 εβδομάδα για κάθε έργο
                        });
                    });
                }

                await batch.commit();
                console.log("Seeding process completed.");

            } catch (err: any) {
                console.error("Error during seeding process:", err);
                setError(err.message);
            } finally {
                setSeeding(false);
            }
        };

        checkAndSeedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { seeding, error };
}
