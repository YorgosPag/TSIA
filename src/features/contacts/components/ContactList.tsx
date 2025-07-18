
"use client";

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContactAvatar } from "./ContactAvatar";
import type { Contact } from "@/features/contacts/types";
import { useDebounce } from '@/hooks/use-debounce';

interface ContactListProps {
    contacts: Contact[];
    selectedContactId?: string;
    onSelectContact: (contact: Contact) => void;
    loading: boolean;
    onLoadMore: () => void;
    hasMore: boolean;
}

const getDisplayName = (contact: Contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return fullName || contact.companyName;
};

export function ContactList({ contacts, selectedContactId, onSelectContact, loading, onLoadMore, hasMore }: ContactListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredContacts = useMemo(() => {
        if (!debouncedSearchTerm) {
            return contacts;
        }
        return contacts.filter(contact => {
            const displayName = getDisplayName(contact)?.toLowerCase() || '';
            const role = contact.role?.toLowerCase() || '';
            const company = contact.companyName?.toLowerCase() || '';
            const term = debouncedSearchTerm.toLowerCase();
            return displayName.includes(term) || role.includes(term) || company.includes(term);
        });
    }, [contacts, debouncedSearchTerm]);


    return (
        <>
            <div className="px-4 pb-4">
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input 
                        placeholder="Αναζήτηση επαφής..." 
                        className="pl-10 w-full bg-card" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
            </div>
            
            {loading && contacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Φόρτωση επαφών...</div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <nav className="flex flex-col gap-1 px-2">
                        {filteredContacts.map(contact => (
                            <Button
                                key={contact.id}
                                variant={selectedContactId === contact.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start h-auto py-2"
                                onClick={() => onSelectContact(contact)}
                            >
                                <ContactAvatar contact={contact} className="h-8 w-8 mr-3"/>
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium">{getDisplayName(contact)}</span>
                                    <span className="text-xs text-muted-foreground">{contact.role}</span>
                                </div>
                            </Button>
                        ))}
                    </nav>
                </div>
            )}
            
            {hasMore && !searchTerm && (
                <div className="p-2 border-t">
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={onLoadMore}
                        disabled={loading}
                    >
                        {loading ? 'Φόρτωση...' : 'Φόρτωση Περισσότερων'}
                    </Button>
                </div>
            )}
        </>
    );
}
