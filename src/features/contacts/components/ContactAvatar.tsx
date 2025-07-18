
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Contact } from "@/features/contacts/types";
import { cn } from "@/lib/utils";

interface ContactAvatarProps {
    contact: Contact;
    className?: string;
    fallbackClassName?: string;
}

const getInitials = (contact: Contact) => {
    if (contact.firstName && contact.lastName) return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    if (contact.firstName) return contact.firstName[0].toUpperCase();
    if (contact.companyName) return contact.companyName[0].toUpperCase();
    return 'Κ';
}

export function ContactAvatar({ contact, className, fallbackClassName }: ContactAvatarProps) {
    return (
        <Avatar className={className}>
            <AvatarFallback className={cn("bg-muted text-muted-foreground font-semibold", fallbackClassName)}>
                {getInitials(contact)}
            </AvatarFallback>
        </Avatar>
    );
}
