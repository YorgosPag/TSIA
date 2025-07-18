
export interface ListItem {
  id: string;
  value: string;
}

export interface CustomList {
  id: string;
  title: string;
  description?: string;
  items: ListItem[];
}
