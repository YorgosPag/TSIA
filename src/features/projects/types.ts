
export interface Project {
  id: string; // Document ID from Firestore
  title: string;
  description?: string;
  applicationNumber?: string;
  ownerId?: string;
  ownerName?: string;
  deadline?: any; // Firestore Timestamp
  status: 'Προσφορά' | 'Ενεργό' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
  createdAt: any; // Firestore Timestamp
  
  // Client-side computed fields, not in Firestore
  cost?: number;
  progress: number;
  derivedStatus: 'Προσφορά' | 'Εντός Χρονοδιαγράμματος' | 'Σε Καθυστέρηση' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
}
