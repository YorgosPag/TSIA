
'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Ρεαλιστικά Δεδομένα για Επαφές (Contacts) ---
const contactsData = [
  // Πελάτες
  { firstName: "Γεώργιος", lastName: "Παπαδόπουλος", role: "Πελάτης", type: "Ιδιώτης", phone: "6971234567", email: "g.papadopoulos@email.com", address: "Εγνατίας 154", city: "Θεσσαλονίκη", vatNumber: "123456789", taxOffice: "Δ' Θεσσαλονίκης" },
  { firstName: "Ελένη", lastName: "Ιωαννίδου", role: "Πελάτης", type: "Ιδιώτης", phone: "6982345678", email: "e.ioannidou@email.com", address: "Λεωφ. Κηφισίας 210", city: "Αθήνα", vatNumber: "987654321", taxOffice: "Α' Αθηνών" },
  { firstName: "Κωνσταντίνος", lastName: "Αγγέλου", role: "Πελάτης", type: "Ιδιώτης", phone: "6943456789", email: "k.aggelou@email.com", address: "Ανδρέα Παπανδρέου 50", city: "Πάτρα", vatNumber: "112233445", taxOffice: "Α' Πατρών" },

  // Συνεργάτες
  { firstName: "Ανδρέας", lastName: "Νικολάου", role: "Συνεργάτης", type: "Αρχιτέκτονας", phone: "6978889900", email: "a.nikolaou.arch@email.com", companyName: "Nikolaou & Partners", address: "Τσιμισκή 33", city: "Θεσσαλονίκη", vatNumber: "223344556", taxOffice: "Ε' Θεσσαλονίκης" },
  { firstName: "Μαρία", lastName: "Δημητρίου", role: "Συνεργάτης", type: "Πολιτικός Μηχανικός", phone: "6934445566", email: "m.dimitriou.civil@email.com", companyName: "Dimitriou Engineering", address: "Βασ. Σοφίας 12", city: "Αθήνα", vatNumber: "334455667", taxOffice: "ΙΓ' Αθηνών" },
  { firstName: "Ιωάννης", lastName: "Γεωργίου", role: "Συνεργάτης", type: "Δικηγόρος", phone: "6971112233", email: "i.georgiou.law@email.com", address: "Ερμού 5", city: "Αθήνα", vatNumber: "445566778", taxOffice: "ΣΤ' Αθηνών" },

  // Προμηθευτές
  { companyName: "ALUMIL A.E.", role: "Προμηθευτής", type: "Κουφώματα", phone: "2310123123", email: "sales@alumil.com", address: "ΒΙ.ΠΕ. Κιλκίς", city: "Κιλκίς", vatNumber: "556677889", taxOffice: "Κιλκίς" },
  { companyName: "ISOMAT A.E.", role: "Προμηθευτής", type: "Δομικά Υλικά", phone: "2310456456", email: "info@isomat.gr", address: "17ο χλμ Θεσ/νίκης - Αγ. Αθανασίου", city: "Θεσσαλονίκη", vatNumber: "667788990", taxOffice: "Ιωνίας" },
  { companyName: "DAIKIN HELLAS", role: "Προμηθευτής", type: "Συστήματα Θέρμανσης-Ψύξης", phone: "2109876543", email: "contact@daikin.gr", address: "Λ. Βουλιαγμένης 577", city: "Αργυρούπολη", vatNumber: "778899001", taxOffice: "Ηλιούπολης" },
  
  // Δημόσιοι Υπάλληλοι / Φορείς
  { firstName: "Αθανάσιος", lastName: "Οικονόμου", role: "Δημόσιος Υπάλληλος", type: "Υπάλληλος Πολεοδομίας", phone: "2101234567", email: "poleodomia@dimos.gr", companyName: "Υ.ΔΟΜ. Δήμου Αθηναίων", address: "Αθηνάς 63", city: "Αθήνα", vatNumber: "", taxOffice: "" },
  { firstName: "Σοφία", lastName: "Βασιλείου", role: "Δημόσιος Υπάλληλος", type: "Υπάλληλος ΔΟΥ", phone: "2310987654", email: "doy.thess@aade.gr", companyName: "Δ' ΔΟΥ Θεσσαλονίκης", address: "Πλ. Δημοκρατίας 1", city: "Θεσσαλονίκη", vatNumber: "", taxOffice: "" },

  // Λογιστήριο
  { firstName: "Χρήστος", lastName: "Σταυρόπουλος", role: "Λογιστήριο", type: "Λογιστής", phone: "2119998877", email: "c.stavropoulos@logistis.gr", companyName: "Stavropoulos Tax Services", address: "Πανεπιστημίου 34", city: "Αθήνα", vatNumber: "889900112", taxOffice: "Α' Αθηνών" },
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
                    console.log("No contacts found, seeding initial data...");
                    contactsData.forEach(contactData => {
                        const contactDocRef = doc(collection(db, "tsia-contacts"));
                        batch.set(contactDocRef, { ...contactData, createdAt: new Date() });
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
