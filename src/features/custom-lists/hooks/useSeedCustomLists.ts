
'use client';

import { useEffect, useState } from "react";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
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

const projectsData = [
  {
    "title": "Ανακαίνιση κατοικίας Αγγέλου Κωνσταντίνου",
    "description": "Ολική ανακαίνιση, θερμομόνωση και αντικατάσταση κουφωμάτων.",
    "applicationNumber": "61-038111",
    "ownerName": "Κωνσταντινίδης Άγγελος",
    "deadline": new Date("2025-09-30T00:00:00.000Z"),
    "status": "Ενεργό",
    "createdAt": new Date("2024-07-10T11:35:00.000Z")
  },
  {
    "title": "Ενεργειακή αναβάθμιση κατοικίας Καψίδου",
    "description": "Αντικατάσταση κουφωμάτων & τοποθέτηση ηλιακού.",
    "applicationNumber": "81-028588",
    "ownerName": "Καψίδου Δέσποινα",
    "deadline": new Date("2023-11-20T00:00:00.000Z"),
    "status": "Ολοκληρωμένο",
    "createdAt": new Date("2023-10-12T13:10:00.000Z")
  },
  {
    "title": "Ανακαίνιση διαμερίσματος PRIMASUN I.K.E.",
    "description": "Ενεργειακή αναβάθμιση πολυκατοικίας.",
    "applicationNumber": "81-082235",
    "ownerName": "PRIMASUN MONOPROSOPI I.K.E.",
    "deadline": new Date("2024-02-28T00:00:00.000Z"),
    "status": "Ενεργό",
    "createdAt": new Date("2024-01-18T10:10:00.000Z")
  },
  {
    "title": "Ανακαίνιση κατοικίας Ανατολή Καραγιάννη",
    "description": "",
    "applicationNumber": "81-058764",
    "ownerName": "Ανατολή Εύα Καραγιάννη",
    "deadline": new Date("2025-09-30T00:00:00.000Z"),
    "status": "Προσφορά",
    "createdAt": new Date("2024-07-01T09:00:00.000Z")
  }
];

const ownerNameToContactDataMap = contactsData.reduce((acc, contact) => {
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.companyName;
    if (name) {
        acc[name] = contact;
    }
    return acc;
}, {} as Record<string, typeof contactsData[0]>);


/**
 * Hook που εκτελείται μία φορά για να ελέγξει και να εισάγει αρχικά δεδομένα (seeding).
 * Τώρα πια, δεν ελέγχει αν οι συλλογές είναι άδειες, αλλά προσπαθεί να γράψει τα δεδομένα πάντα.
 */
export function useSeedCustomLists() {
    const [seeding, setSeeding] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const seedData = async () => {
            if (!db) {
                setError("Firebase not initialized");
                setSeeding(false);
                return;
            }

            try {
                console.log("Attempting to seed data. This will run every time the app starts.");
                const batch = writeBatch(db);
                
                // 1. Seeding Προσαρμοσμένων Λιστών
                console.log("Seeding custom lists...");
                initialListsData.forEach(listData => {
                    const listDocRef = doc(collection(db, "tsia-custom-lists"));
                    batch.set(listDocRef, { title: listData.title, description: listData.description, createdAt: new Date() });
                    listData.items.forEach(itemValue => {
                        const itemDocRef = doc(collection(listDocRef, 'items'));
                        batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
                    });
                });

                // 2. Seeding Επαφών και συλλογή των IDs τους
                console.log("Seeding contacts with production data...");
                const contactNameToIdMap = new Map<string, string>();
                contactsData.forEach(contactData => {
                    const contactDocRef = doc(collection(db, "tsia-contacts"));
                    const { createdAt, ...rest } = contactData;
                    batch.set(contactDocRef, { 
                        ...rest,
                        createdAt: new Date(createdAt)
                    });
                    const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || contactData.companyName;
                    if(fullName) {
                        contactNameToIdMap.set(fullName, contactDocRef.id);
                    }
                });

                // 3. Seeding Έργων, συνδέοντάς τα με τις επαφές
                console.log("Seeding projects...");
                projectsData.forEach((proj) => {
                    const projectDocRef = doc(collection(db, "tsia-projects"));
                    
                    // Βρίσκουμε το ID του ιδιοκτήτη από το map που δημιουργήσαμε
                    const ownerId = contactNameToIdMap.get(proj.ownerName) || null;

                    batch.set(projectDocRef, {
                        ...proj,
                        ownerId: ownerId,
                    });
                });
                
                // Execute all writes
                await batch.commit();
                console.log("Seeding process completed.");

            } catch (err: any) {
                // Ignore "Function WriteBatch.commit() requires its first argument to be of type an array of writes" error if batch is empty.
                if (err.message.includes('requires its first argument to be of type an array of writes')) {
                     console.log("Batch was empty, nothing to seed.");
                } else {
                    console.error("Error during seeding process:", err);
                    setError(err.message);
                }
            } finally {
                setSeeding(false);
            }
        };

        const flag = sessionStorage.getItem('data_seeded');
        if(!flag) {
            seedData();
            sessionStorage.setItem('data_seeded', 'true');
        } else {
             setSeeding(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { seeding, error };
}
