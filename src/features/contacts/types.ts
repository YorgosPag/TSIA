
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  role?: string;
  type?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  vatNumber?: string;
  taxOffice?: string;
  socialMedia?: { platform: string; url: string }[];
  notes?: string;
  createdAt: any;
}

export interface ListItem {
  id: string;
  value: string;
}
