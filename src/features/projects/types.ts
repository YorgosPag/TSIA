
export interface Project {
  id: string;
  title: string;
  description?: string;
  applicationNumber?: string;
  ownerId?: string;
  ownerName?: string;
  deadline?: any; // Firestore Timestamp
  status: 'Προσφορά' | 'Ενεργό' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
  createdAt: any; // Firestore Timestamp
  cost?: number;
  progress: number;
  derivedStatus: 'Προσφορά' | 'Ενεργό' | 'Σε Καθυστέρηση' | 'Ολοκληρωμένο' | 'Ακυρωμένο';
}
