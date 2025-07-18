
"use client";

import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <main className="flex-1 p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-3"><FileText />Αποτυπώσεις</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Αυτή η σελίδα φορτώνεται δυναμικά (lazy loaded) για καλύτερες επιδόσεις.
      </p>
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <h2 className="text-xl font-semibold text-muted-foreground">Η λειτουργικότητα θα υλοποιηθεί σύντομα.</h2>
        <p className="text-muted-foreground">Εδώ θα μπορείτε να δημιουργείτε και να διαχειρίζεστε τις αποτυπώσεις σας.</p>
      </div>
    </main>
  );
}
