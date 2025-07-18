
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { seedDatabase } from '@/lib/seedDatabase';
import { useToast } from '@/features/toast';
import { Database } from 'lucide-react';

export default function DashboardPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      toast({ title: "Επιτυχία", description: "Τα δεδομένα εισήχθησαν επιτυχώς." });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Άγνωστο σφάλμα.";
      toast({ variant: 'destructive', title: "Σφάλμα", description: `Αποτυχία εισαγωγής δεδομένων: ${errorMessage}` });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Πίνακας Ελέγχου</h1>
      </div>
      <div className="flex flex-col items-center justify-center text-center h-full text-muted-foreground border-2 border-dashed rounded-lg py-16">
        <h2 className="text-xl font-semibold mb-4">Διαχείριση Δεδομένων</h2>
        <p className="mb-8">Χρησιμοποιήστε το παρακάτω κουμπί για να εισάγετε τα αρχικά δεδομένα στην εφαρμογή.</p>
        <Button size="lg" className="text-xl px-8 py-6" onClick={handleSeedDatabase} disabled={isSeeding}>
          <Database className="mr-4 h-6 w-6" />
          {isSeeding ? 'Γίνεται εισαγωγή...' : 'Εισαγωγή Δεδομένων στη Βάση'}
        </Button>
         <p className="text-xs text-muted-foreground mt-4">Αυτή η ενέργεια ελέγχει για υπάρχουσες εγγραφές για να αποφύγει τα διπλότυπα.</p>
      </div>
    </main>
  );
}
