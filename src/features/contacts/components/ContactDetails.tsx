
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import { ContactAvatar } from "./ContactAvatar";
import type { Contact } from "@/features/contacts/types";

interface ContactDetailsProps {
    contact: Contact;
    onEdit: (contact: Contact) => void;
    onDelete: (contact: Contact) => void;
}

const getDisplayName = (contact: Contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return fullName || contact.companyName;
};

export function ContactDetails({ contact, onEdit, onDelete }: ContactDetailsProps) {
    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                     <ContactAvatar 
                        contact={contact} 
                        className="h-16 w-16 text-2xl" 
                        fallbackClassName="bg-primary/20 text-primary"
                     />
                    <div>
                        <h2 className="text-2xl font-bold">{getDisplayName(contact)}</h2>
                        <p className="text-muted-foreground">{contact.role}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onEdit(contact)}><Edit className="mr-2 h-4 w-4"/>Επεξεργασία</Button>
                    <Button variant="outline" color="destructive" onClick={() => onDelete(contact)}><Trash2 className="mr-2 h-4 w-4"/>Διαγραφή</Button>
                </div>
            </div>

            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7']} className="w-full space-y-2">
                <AccordionItem value="item-1" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Επικοινωνίας</h3></AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><Label className="text-muted-foreground">Email</Label><p className="text-sm font-medium">{contact.email || '-'}</p></div>
                    <div><Label className="text-muted-foreground">Τηλέφωνο</Label><p className="text-sm font-medium">{contact.phone || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Προσωπικά Στοιχεία</h3></AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><Label className="text-muted-foreground">Όνομα</Label><p className="text-sm font-medium">{contact.firstName || '-'}</p></div>
                    <div><Label className="text-muted-foreground">Επώνυμο</Label><p className="text-sm font-medium">{contact.lastName || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Επαγγελματικά Στοιχεία</h3></AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><Label className="text-muted-foreground">Εταιρεία</Label><p className="text-sm font-medium">{contact.companyName || '-'}</p></div>
                    <div><Label className="text-muted-foreground">Ρόλος</Label><p className="text-sm font-medium">{contact.role || '-'}</p></div>
                    <div><Label className="text-muted-foreground">Είδος</Label><p className="text-sm font-medium">{contact.type || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Διεύθυνσης</h3></AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><Label className="text-muted-foreground">Διεύθυνση</Label><p className="text-sm font-medium">{contact.address || '-'}</p></div>
                    <div><Label className="text-muted-foreground">Πόλη</Label><p className="text-sm font-medium">{contact.city || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Στοιχεία Ταυτότητας & ΑΦΜ</h3></AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><Label className="text-muted-foreground">ΑΦΜ</Label><p className="text-sm font-medium">{contact.vatNumber || '-'}</p></div>
                    <div><Label className="text-muted-foreground">ΔΟΥ</Label><p className="text-sm font-medium">{contact.taxOffice || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Κοινωνικά Δίκτυα</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                    <p className="text-sm text-muted-foreground italic">Δεν υπάρχουν καταχωρημένα κοινωνικά δίκτυα.</p>
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7" className="bg-card/50 rounded-lg px-4 border">
                <AccordionTrigger><h3 className="font-semibold text-base">Λοιπά</h3></AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <div><Label className="text-muted-foreground">Σημειώσεις</Label><p className="text-sm font-medium whitespace-pre-wrap">{contact.notes || '-'}</p></div>
                </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
}
