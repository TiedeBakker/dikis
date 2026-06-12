// Dwing het laden van .env.local af
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from "./db"; 
import { beheerMetadata } from "./db/schema";

async function seed() {
  // Debug check
  if (!process.env.TURSO_CONNECTION_URL) {
    console.error("❌ FOUT: TURSO_CONNECTION_URL is niet gevonden.");
    console.error("Controleer of .env.local bestaat in de root van je project.");
    process.exit(1);
  }

  console.log("🚀 Start met vullen van beheer_metadata...");

  const data = [
    // { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'voornamen', veldLabel: 'Voornamen', veldType: 'text', volgnummer: 1, verplicht: true },
    // { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'tussenvoegsel', veldLabel: 'Tussenvoegsel', veldType: 'text', volgnummer: 2, verplicht: false },
    // { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'achternaam', veldLabel: 'Achternaam', veldType: 'text', volgnummer: 3, verplicht: true },
    // { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'geboortedatum', veldLabel: 'Geboortedatum', veldType: 'date', volgnummer: 4, verplicht: false },
    // { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'straat', veldLabel: 'Straat', veldType: 'text', volgnummer: 1, verplicht: true },
    // { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'nummer', veldLabel: 'Huisnummer', veldType: 'text', volgnummer: 2, verplicht: true },
    // { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'plaats', veldLabel: 'Plaats', veldType: 'text', volgnummer: 3, verplicht: true },
    // { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'korteAanduiding', veldLabel: 'Aanduiding', veldType: 'text', volgnummer: 4, verplicht: false },
    { 
  tabelNaam: 'personen', 
  tabelLabel: 'Personen', 
  veldId: 'telefoonnummer', 
  veldLabel: 'Telefoonnummer', 
  veldType: 'text', 
  volgnummer: 5, 
  verplicht: false,
  toelichting: 'Formaat: 06-12345678'
}
  ];

  await db.transaction(async (tx) => {
    for (const item of data) {
      await tx.insert(beheerMetadata).values(item);
    }
  });

  console.log("✅ Database succesvol gevuld!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Fout bij het seeden:", err);
  process.exit(1);
});