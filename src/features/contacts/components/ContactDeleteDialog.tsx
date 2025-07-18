
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Contact } from "@/features/contacts/types";

interface ContactDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contact: Contact | null;
}

export function ContactDeleteDialog({ isOpen, onClose, onConfirm, contact }: ContactDeleteDialogProps) {
    if (!contact) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Είστε βέβαιοι;</AlertDialogTitle>
                    <AlertDialogDescription>
                        Αυτή η ενέργεια δεν μπορεί να αναιρεθεί. Η επαφή θα διαγραφεί οριστικά από τη βάση δεδομένων.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Άκυρο</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Διαγραφή
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
