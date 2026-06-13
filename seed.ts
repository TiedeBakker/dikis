// Dwing het laden van .env.local af
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


import { db } from "./db";
import { beheerMetadata, eenheden } from "./db/schema";

async function main() {
  // 1. Eerst even de metadata en oude eenheden opschonen voor de schone test
  await db.delete(beheerMetadata);
  await db.delete(eenheden);

  // 2. Voeg een paar basiseenheden toe
  const [celsius, kilo, procent] = await db.insert(eenheden).values([
    { naam: "Celsius", symbool: "°C" },
    { naam: "Kilogram", symbool: "kg" },
    { naam: "Percentage", symbool: "%" },
  ]).returning();

  // 3. De complete metadata set
  const metadataData = [
    { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'voornamen', veldLabel: 'Voornamen', veldType: 'text', volgnummer: 1, verplicht: true },
    { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'tussenvoegsel', veldLabel: 'Tussenvoegsel', veldType: 'text', volgnummer: 2, verplicht: false },
    { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'achternaam', veldLabel: 'Achternaam', veldType: 'text', volgnummer: 3, verplicht: true },
    { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'geboortedatum', veldLabel: 'Geboortedatum', veldType: 'date', volgnummer: 4, verplicht: false },
    { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'straat', veldLabel: 'Straat', veldType: 'text', volgnummer: 1, verplicht: true },
    { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'nummer', veldLabel: 'Huisnummer', veldType: 'text', volgnummer: 2, verplicht: true },
    { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'plaats', veldLabel: 'Plaats', veldType: 'text', volgnummer: 3, verplicht: true },
    { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'korteAanduiding', veldLabel: 'Aanduiding', veldType: 'text', volgnummer: 4, verplicht: false },
    {
      tabelNaam: 'personen',
      tabelLabel: 'Personen',
      veldId: 'telefoonnummer',
      veldLabel: 'Telefoonnummer',
      veldType: 'text',
      volgnummer: 5,
      verplicht: false,
      toelichting: 'Formaat: 06-12345678'
    },

    // Parameters metadata (Let op de wijziging bij eenheidId!)
    { tabelNaam: 'parameters', tabelLabel: 'Parameters', veldId: 'naam', veldLabel: 'Naam parameter', veldType: 'text', volgnummer: 1, verplicht: true },
    
    // HIER GEBEURT DE MAGIE: type 'select' en link naar 'eenheden'
    { 
      tabelNaam: 'parameters', 
      tabelLabel: 'Parameters', 
      veldId: 'eenheidId', 
      veldLabel: 'Eenheid', 
      veldType: 'select', 
      volgnummer: 2, 
      verplicht: false, 
      lookupTabel: 'eenheden', // Vertelt de UI waar de data staat
      toelichting: 'Kies de bijbehorende meeteenheid' 
    },
    
    { tabelNaam: 'parameters', tabelLabel: 'Parameters', veldId: 'toelichting', veldLabel: 'Toelichting', veldType: 'text', volgnummer: 3, verplicht: false },


{
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "tabelNaam",
    veldLabel: "Tabel Database Naam (bijv. personen)",
    veldType: "text",
    volgnummer: 1,
    verplicht: true,
    toelichting: "De exacte naam van de export const in je schema.ts"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "tabelLabel",
    veldLabel: "Tabel Menu Label (bijv. Personen)",
    veldType: "text",
    volgnummer: 2,
    verplicht: true,
    toelichting: "De naam zoals deze in het menu en boven het formulier verschijnt"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "veldId",
    veldLabel: "Veld Database Naam (bijv. voornamen)",
    veldType: "text",
    volgnummer: 3,
    verplicht: true,
    toelichting: "De exacte kolomnaam uit je database-schema"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "veldLabel",
    veldLabel: "Veld Formulier Label (bijv. Voornaam)",
    veldType: "text",
    volgnummer: 4,
    verplicht: true,
    toelichting: "De tekst die boven het invoerveld komt te staan"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "veldType",
    veldLabel: "Type Invoerveld",
    veldType: "select", // Onze generieke code herkent dit nu als dropdown!
    volgnummer: 5,
    verplicht: true,
    toelichting: "Bepaalt of het een tekstvak, getal, datum, dropdown of vinkje wordt"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "volgnummer",
    veldLabel: "Formulier Volgorde (Sorteernummer)",
    veldType: "number",
    volgnummer: 6,
    verplicht: true,
    toelichting: "Lage nummers staan bovenaan in het formulier (bijv. 1, 2, 3)"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "verplicht",
    veldLabel: "Dit veld is verplicht",
    veldType: "checkbox", // Onze generieke code herkent dit nu als Ja/Nee checkbox!
    volgnummer: 7,
    verplicht: false,
    toelichting: "Vink aan als de gebruiker dit veld niet leeg mag laten"
  },
  {
    tabelNaam: "beheerMetadata",
    tabelLabel: "Formulier Instellingen",
    veldId: "toelichting",
    veldLabel: "Hulptekst / Toelichting",
    veldType: "text",
    volgnummer: 8,
    verplicht: false,
    toelichting: "Kleine grijze instructietekst onder het invoerveld (optioneel)"
  }


  ];

  await db.insert(beheerMetadata).values(metadataData);
  console.log("Seeding succesvol afgerond!");
}

main();













// import { db } from "./db";
// import { beheerMetadata,eenheden } from "./db/schema";

// async function seed() {
//   // Debug check
//   if (!process.env.TURSO_CONNECTION_URL) {
//     console.error("❌ FOUT: TURSO_CONNECTION_URL is niet gevonden.");
//     console.error("Controleer of .env.local bestaat in de root van je project.");
//     process.exit(1);
//   }

//   const [celsius, kilo, procent] = await db.insert(eenheden).values([
//     { naam: "Celsius", symbool: "°C" },
//     { naam: "Kilogram", symbool: "kg" },
//     { naam: "Percentage", symbool: "%" },
//   ]).returning();

//   console.log("🚀 Start met vullen van beheer_metadata...");

//   const data = [
//     { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'voornamen', veldLabel: 'Voornamen', veldType: 'text', volgnummer: 1, verplicht: true },
//     { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'tussenvoegsel', veldLabel: 'Tussenvoegsel', veldType: 'text', volgnummer: 2, verplicht: false },
//     { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'achternaam', veldLabel: 'Achternaam', veldType: 'text', volgnummer: 3, verplicht: true },
//     { tabelNaam: 'personen', tabelLabel: 'Personen', veldId: 'geboortedatum', veldLabel: 'Geboortedatum', veldType: 'date', volgnummer: 4, verplicht: false },
//     { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'straat', veldLabel: 'Straat', veldType: 'text', volgnummer: 1, verplicht: true },
//     { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'nummer', veldLabel: 'Huisnummer', veldType: 'text', volgnummer: 2, verplicht: true },
//     { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'plaats', veldLabel: 'Plaats', veldType: 'text', volgnummer: 3, verplicht: true },
//     { tabelNaam: 'gebouwen', tabelLabel: 'Gebouwen', veldId: 'korteAanduiding', veldLabel: 'Aanduiding', veldType: 'text', volgnummer: 4, verplicht: false },
//     {
//       tabelNaam: 'personen',
//       tabelLabel: 'Personen',
//       veldId: 'telefoonnummer',
//       veldLabel: 'Telefoonnummer',
//       veldType: 'text',
//       volgnummer: 5,
//       verplicht: false,
//       toelichting: 'Formaat: 06-12345678'
//     },
//     {
//       tabelNaam: 'parameters',
//       tabelLabel: 'Parameters',
//       veldId: 'naam',
//       veldLabel: 'Naam parameter',
//       veldType: 'text',
//       volgnummer: 1,
//       verplicht: true,
//       toelichting: 'Bijv. Temperatuur, CO2, Luchtvochtigheid of Toerental'
//     },
//     {
//       tabelNaam: 'parameters',
//       tabelLabel: 'Parameters',
//       veldId: 'eenheidId',
//       veldLabel: 'Eenheid ID',
//       veldType: 'text',
//       volgnummer: 2,
//       verplicht: false,
//       toelichting: 'Optionele referentie naar een eenheid'
//     },
//     {
//       tabelNaam: 'parameters',
//       tabelLabel: 'Parameters',
//       veldId: 'toelichting',
//       veldLabel: 'Toelichting',
//       veldType: 'text',
//       volgnummer: 3,
//       verplicht: false,
//       toelichting: 'Waar wordt deze parameter voor gebruikt of gemeten?'
//     },
//   ];

//   await db.transaction(async (tx) => {
//     await db.delete(beheerMetadata);
//   await db.delete(eenheden);
//     for (const item of data) {
//       await tx.insert(beheerMetadata).values(item);
//     }
//   });

//   console.log("✅ Database succesvol gevuld!");
//   process.exit(0);
// }

// seed().catch((err) => {
//   console.error("❌ Fout bij het seeden:", err);
//   process.exit(1);
// });