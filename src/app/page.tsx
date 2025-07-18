"use client";

import { useState, useEffect } from 'react';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useRolesList } from '@/features/contacts/hooks/useRolesList';
import { ContactList } from '@/features/contacts/components/ContactList';
import { ContactDetails } from '@/features/contacts/components/ContactDetails';
import { ContactForm } from '@/features/contacts/components/ContactForm';
import { ContactDeleteDialog } from '@/features/contacts/components/ContactDeleteDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TriangleAlert, Plus, BookUser } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Contact } from '@/features/contacts/types';

export default function ContactsPage() {
  const { 
    contacts, 
    loading: loadingContacts, 
    error: contactsError, 
    addContact, 
    updateContact, 
    deleteContact 
  } = useContacts();
  
  const { rolesList } = useRolesList();
  const { toast } = useToast();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };
  
  const handleAddNew = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (contact: Contact) => {
    setDeletingContact(contact);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingContact) return;

    const contactIndex = contacts.findIndex(c => c.id === deletingContact.id);
    
    try {
      await deleteContact(deletingContact.id);
      toast({ title: "Επιτυχία", description: "Η επαφή διαγράφηκε." });

      if (selectedContact?.id === deletingContact.id) {
          const newContacts = contacts.filter(c => c.id !== deletingContact.id);
          if (newContacts.length > 0) {
              const newIndex = Math.max(0, Math.min(contactIndex, newContacts.length - 1));
              setSelectedContact(newContacts[newIndex]);
          } else {
              setSelectedContact(null);
          }
      }
    } catch (err) {
      console.error("Delete contact error:", err);
      toast({ variant: "destructive", title: "Σφάλμα", description: "Αποτυχία διαγραφής της επαφής." });
    } finally {
      setDeletingContact(null);
    }
  };
  
  const handleSaveContact = async (data: Omit<Contact, 'id' | 'createdAt'>) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data);
        toast({ title: "Επιτυχία", description: "Η επαφή ενημερώθηκε." });
        // Update selected contact if it was the one being edited
        if (selectedContact?.id === editingContact.id) {
          setSelectedContact({ ...selectedContact, ...data });
        }
      } else {
        const newContactId = await addContact({ ...data, createdAt: new Date() });
        toast({ title: "Επιτυχία", description: "Η επαφή δημιουργήθηκε." });
         const newContact = contacts.find(c => c.id === newContactId);
         if(newContact) setSelectedContact(newContact);
      }
      setIsFormOpen(false);
      setEditingContact(null);
      return true;
    } catch (err) {
      console.error("Save contact error:", err);
      toast({ variant: "destructive", title: "Σφάλμα", description: "Αποτυχία αποθήκευσης της επαφής." });
      return false;
    }
  };
  
    useEffect(() => {
        if (!loadingContacts && contacts.length > 0 && !selectedContact) {
            const contactExists = selectedContact && contacts.find(c => c.id === selectedContact.id);
            if (!contactExists) {
                setSelectedContact(contacts[0]);
            }
        }
    }, [contacts, loadingContacts, selectedContact]);


  return (
    <main className="flex flex-1 bg-background">
      <div className="w-1/3 border-r bg-card/50 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-3"><BookUser/>Λίστα Επαφών</h1>
              <p className="text-sm text-muted-foreground">Διαχειριστείτε τις επαφές σας.</p>
            </div>
            <Button size="sm" onClick={handleAddNew}><Plus className="mr-2 h-4 w-4"/>Νέα</Button>
          </div>
        </div>

        {contactsError && (
          <Alert variant="destructive" className="m-4">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Σφάλμα</AlertTitle>
            <AlertDescription>{contactsError}</AlertDescription>
          </Alert>
        )}

        <ContactList
          contacts={contacts}
          selectedContactId={selectedContact?.id}
          onSelectContact={handleSelectContact}
          loading={loadingContacts}
        />
      </div>

      <div className="w-2/3 overflow-y-auto p-6">
        {selectedContact ? (
          <ContactDetails 
            contact={selectedContact}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        ) : (
          !loadingContacts && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <BookUser className="h-16 w-16 mb-4"/>
              <h2 className="text-xl font-semibold">{contacts.length > 0 ? "Δεν επιλέχθηκε επαφή" : "Δεν υπάρχουν επαφές"}</h2>
              <p>{contacts.length > 0 ? "Επιλέξτε μια επαφή από τη λίστα για να δείτε τις λεπτομέρειες." : "Πατήστε 'Νέα' για να προσθέσετε την πρώτη σας επαφή."}</p>
            </div>
          )
        )}
      </div>

      <ContactForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
        contact={editingContact}
        rolesList={rolesList}
      />
      
      <ContactDeleteDialog
        isOpen={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleConfirmDelete}
        contact={deletingContact}
      />
    </main>
  );
}
