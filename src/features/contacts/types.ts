
export interface Contact {
  id: string; // Document ID from Firestore
  firstName: string;
  lastName: string;
  companyName?: string;
  role?: string;
  type?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  vatNumber?: string;
  taxOffice?: string;
  notes?: string;
  createdAt: any; // Firestore Timestamp
}

export interface ListItem {
  id: string;
  value: string;
}
