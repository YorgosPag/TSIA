
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContactAvatar } from "./ContactAvatar";
import type { Contact } from "@/features/contacts/types";

interface ContactListProps {
    contacts: Contact[];
    selectedContactId?: string;
    onSelectContact: (contact: Contact) => void;
    loading: boolean;
}

const getDisplayName = (contact: Contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return fullName || contact.companyName;
};

export function ContactList({ contacts, selectedContactId, onSelectContact, loading }: ContactListProps) {
    // TODO: Implement search functionality
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <div className="px-4 pb-4">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Αναζήτηση επαφής..." className="pl-10 w-full bg-card" />
                </div>
            </div>
            
            {loading ? (
                <div className="p-4 text-center text-muted-foreground">Φόρτωση επαφών...</div>
            ) : (
                <nav className="flex flex-col gap-1 px-2">
                    {contacts.map(contact => (
                        <Button
                            key={contact.id}
                            variant={selectedContactId === contact.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-auto py-2"
                            onClick={() => onSelectContact(contact)}
                        >
                             <ContactAvatar contact={contact} className="h-8 w-8 mr-3"/>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{getDisplayName(contact)}</span>
                                <span className="text-xs text-muted-foreground">{contact.role}</span>
                            </div>
                        </Button>
                    ))}
                </nav>
            )}
        </>
    );
}
// Add this import at the top
import { useState } from 'react';
