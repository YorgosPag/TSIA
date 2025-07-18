import { collection, writeBatch, doc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Ρεαλιστικά Δεδομένα για Προσαρμοσμένες Λίστες ---
const initialListsData = [
    { title: "Ρόλοι", description: "Λίστα με τους διαθέσιμους ρόλους για τις επαφές.", items: ["Πελάτης", "Συνεργάτης", "Προμηθευτής", "Λογιστήριο", "Δημόσιος Υπάλληλος", "Εσωτερικός Χρήστης"] },
    { title: "Ειδικότητες", description: "Λίστα με τις διαθέσιμες ειδικότητες.", items: ["Ιδιώτης", "Αρχιτέκτονας", "Πολιτικός Μηχανικός", "Δικηγόρος", "Οικονομολόγος", "Υπάλληλος Πολεοδομίας", "Υπάλληλος ΔΟΥ", "Κατασκευαστής", "Λογιστής", "Ελεύθερος Επαγγελματίας"] },
    { title: "Είδη Προμηθευτών", description: "Κατηγορίες υλικών και υπηρεσιών από προμηθευτές.", items: ["Κουφώματα", "Δομικά Υλικά", "Συστήματα Θέρμανσης-Ψύξης", "Ηλεκτρολογικό Υλικό", "Υδραυλικά"] },
    { title: "Κατηγορία Παρέμβασης", description: "", items: ["Κουφώματα", "Θερμομόνωση", "Συστήματα Θέρμανσης-Ψύξης", "ΖΝΧ", "Λοιπές Παρεμβάσεις"] },
    { title: "Μονάδες Μέτρησης", description: "", items: ["€/m²", "€/kW", "€/μονάδα", "€/αίτηση", "τεμ.", "m", "m³", "kWh"] },
    { title: "Κατάσταση Έργου", description: "Οι κύριες καταστάσεις ενός έργου.", items: ["Προσφορά", "Ενεργό", "Ολοκληρωμένο", "Ακυρωμένο"] },
];

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

const projectsData = [
  {
    "title": "Ανακαίνιση κατοικίας Αγγέλου Κωνσταντινίδη",
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
    "ownerName": "MONOPROSOPI PRIMASUN I.K.E.",
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


export async function seedDatabase() {
  if (!db) {
    throw new Error("Firebase not initialized");
  }
  
  console.log("Starting data seeding process...");
  const batch = writeBatch(db);
  const contactNameToIdMap = new Map<string, string>();

  // 1. Seed Custom Lists (checking for existence by title)
  const listsCollectionRef = collection(db, "tsia-custom-lists");
  for (const listData of initialListsData) {
    const listExistsQuery = query(listsCollectionRef, where("title", "==", listData.title));
    const listSnapshot = await getDocs(listExistsQuery);

    if (listSnapshot.empty) {
      console.log(`Seeding list: ${listData.title}`);
      const listDocRef = doc(listsCollectionRef);
      batch.set(listDocRef, { title: listData.title, description: listData.description, createdAt: new Date() });
      listData.items.forEach(itemValue => {
        const itemDocRef = doc(collection(listDocRef, 'items'));
        batch.set(itemDocRef, { value: itemValue, createdAt: new Date() });
      });
    } else {
      console.log(`List "${listData.title}" already exists. Skipping.`);
    }
  }

  // 2. Seed Contacts (checking for existence by email if available)
  const contactsCollectionRef = collection(db, "tsia-contacts");
  for (const contactData of contactsData) {
    let shouldAdd = true;
    if (contactData.email) {
      const contactExistsQuery = query(contactsCollectionRef, where("email", "==", contactData.email));
      const contactSnapshot = await getDocs(contactExistsQuery);
      if (!contactSnapshot.empty) {
        shouldAdd = false;
        console.log(`Contact with email "${contactData.email}" already exists. Skipping.`);
        // Even if it exists, store its ID for project linking
        const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || contactData.companyName;
        contactNameToIdMap.set(fullName, contactSnapshot.docs[0].id);
      }
    }
    
    if (shouldAdd) {
      console.log(`Seeding contact: ${contactData.firstName} ${contactData.lastName}`);
      const contactDocRef = doc(contactsCollectionRef);
      const { createdAt, ...rest } = contactData;
      batch.set(contactDocRef, { 
          ...rest,
          createdAt: Timestamp.fromDate(new Date(createdAt))
      });
      const fullName = [contactData.firstName, contactData.lastName].filter(Boolean).join(' ') || contactData.companyName;
      if (fullName) {
          contactNameToIdMap.set(fullName, contactDocRef.id);
      }
    }
  }

  // 3. Seed Projects (checking for existence by applicationNumber)
  const projectsCollectionRef = collection(db, "tsia-projects");
  for (const proj of projectsData) {
    const projectExistsQuery = query(projectsCollectionRef, where("applicationNumber", "==", proj.applicationNumber));
    const projectSnapshot = await getDocs(projectExistsQuery);

    if (projectSnapshot.empty) {
      console.log(`Seeding project: ${proj.title}`);
      const projectDocRef = doc(projectsCollectionRef);
      const ownerId = contactNameToIdMap.get(proj.ownerName) || null;
      
      const projectPayload = {
        ...proj,
        ownerId: ownerId,
        deadline: Timestamp.fromDate(new Date(proj.deadline)),
        createdAt: Timestamp.fromDate(new Date(proj.createdAt)),
      };
      
      batch.set(projectDocRef, projectPayload);
    } else {
      console.log(`Project with application number "${proj.applicationNumber}" already exists. Skipping.`);
    }
  }

  try {
    await batch.commit();
    console.log("Seeding process completed successfully.");
  } catch (err) {
    if (err instanceof Error && err.message.includes('its first argument to be of type an array of writes')) {
        console.log("Batch was empty, nothing new to seed.");
        return; // This is not an error in our case
    }
    console.error("Error committing seed data batch:", err);
    throw new Error("Failed to write seed data to the database.");
  }
}
