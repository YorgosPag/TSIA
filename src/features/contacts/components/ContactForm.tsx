
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contact, ListItem } from "@/features/contacts/types";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<Contact, 'id' | 'createdAt'>) => Promise<boolean>;
    contact: Contact | null;
    rolesList: ListItem[];
}

const getFullName = (contact: Contact) => [contact.firstName, contact.lastName].filter(Boolean).join(' ');

export function ContactForm({ isOpen, onClose, onSave, contact, rolesList }: ContactFormProps) {
    const { toast } = useToast();
    const [currentRole, setCurrentRole] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (contact) {
            setCurrentRole(contact.role);
        } else {
            setCurrentRole(undefined);
        }
    }, [contact]);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fullName = formData.get('name') as string;
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const contactData = {
          firstName: firstName || '',
          lastName: lastName || '',
          companyName: formData.get('companyName') as string,
          role: currentRole || '',
          type: formData.get('type') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          city: formData.get('city') as string,
          vatNumber: formData.get('vatNumber') as string,
          taxOffice: formData.get('taxOffice') as string,
          notes: formData.get('notes') as string,
        };

        if (!contactData.firstName && !contactData.lastName && !contactData.companyName) {
            toast({
                variant: "destructive",
                title: "Σφάλμα",
                description: "Το πεδίο 'Όνομα/Εταιρεία' είναι υποχρεωτικό.",
            });
            return;
        }
        
        const success = await onSave(contactData);
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{contact ? 'Επεξεργασία Επαφής' : 'Νέα Επαφή'}</DialogTitle>
                        <DialogDescription>
                            {contact ? 'Επεξεργαστείτε τα στοιχεία της επαφής.' : 'Συμπληρώστε τα στοιχεία για τη νέα επαφή.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Όνομα/Επώνυμο</Label>
                            <Input id="name" name="name" defaultValue={contact ? getFullName(contact) : ''} className="col-span-3" required/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="companyName" className="text-right">Εταιρεία</Label>
                            <Input id="companyName" name="companyName" defaultValue={contact?.companyName} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Ρόλος</Label>
                            <Select name="role" value={currentRole} onValueChange={setCurrentRole} defaultValue={contact?.role}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Επιλέξτε ρόλο..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {rolesList.map(role => (
                                        <SelectItem key={role.id} value={role.value}>{role.value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Είδος</Label>
                            <Input id="type" name="type" defaultValue={contact?.type} placeholder="π.χ. Μηχανικός, Λογιστήριο" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={contact?.email} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Τηλέφωνο</Label>
                            <Input id="phone" name="phone" defaultValue={contact?.phone} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">Διεύθυνση</Label>
                            <Input id="address" name="address" defaultValue={contact?.address} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">Πόλη</Label>
                            <Input id="city" name="city" defaultValue={contact?.city} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vatNumber" className="text-right">ΑΦΜ</Label>
                            <Input id="vatNumber" name="vatNumber" defaultValue={contact?.vatNumber} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="taxOffice" className="text-right">ΔΟΥ</Label>
                            <Input id="taxOffice" name="taxOffice" defaultValue={contact?.taxOffice} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="notes" className="text-right pt-2">Σημειώσεις</Label>
                            <Textarea id="notes" name="notes" defaultValue={contact?.notes} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t mt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Ακύρωση</Button>
                        <Button type="submit">Αποθήκευση</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
