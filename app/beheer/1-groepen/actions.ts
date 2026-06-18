"use server";

import { db } from "@/db";
import { groepen, parameterSets, groepObjecten, personen, gebouwen } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Haal alle groepen op inclusief de gekoppelde parameterset-naam
export async function getGroepen() {
  try {
    return await db
      .select({
        id: groepen.id,
        naam: groepen.naam,
        toelichting: groepen.toelichting,
        standaardSetId: groepen.standaardSetId,
        setName: parameterSets.naam,
      })
      .from(groepen)
      .leftJoin(parameterSets, eq(groepen.standaardSetId, parameterSets.id))
      .orderBy(groepen.naam);
  } catch (error) {
    console.error("Fout bij ophalen groepen:", error);
    return [];
  }
}

// 2. Maak een nieuwe groep aan met een gekoppelde parameterset
export async function createGroep(naam: string, standaardSetId: string, toelichting?: string) {
  try {
    const nieuwId = crypto.randomUUID();
    await db.insert(groepen).values({
      id: nieuwId,
      naam,
      standaardSetId,
      toelichting: toelichting || null,
    });
    
    revalidatePath("/beheer/groepen");
    return { success: true, groepId: nieuwId };
  } catch (error) {
    console.error("Fout bij aanmaken groep:", error);
    return { success: false, error: "Kon de groep niet aanmaken." };
  }
}

// 3. Haal een specifieke groep op met alle gekoppelde objecten
// 3. Haal een specifieke groep op met alle gekoppelde objecten
export async function getGroepMetObjecten(groepId: string) {
  try {
    const groepInfo = await db
      .select()
      .from(groepen)
      .where(eq(groepen.id, groepId))
      .then((res) => res[0]);

    if (!groepInfo) return null;

    // We halen de ruwe kolommen op, en bepalen de naam zometeen in TypeScript
    const ruweObjecten = await db
      .select({
        id: groepObjecten.id,
        objectId: groepObjecten.objectId,
        objectType: groepObjecten.objectType,
        // Personen kolommen
        voornamen: personen.voornamen,
        achternaam: personen.achternaam,
        // Gebouwen kolommen
        straat: gebouwen.straat,
        nummer: gebouwen.nummer,
        plaats: gebouwen.plaats,
      })
      .from(groepObjecten)
      .leftJoin(personen, eq(groepObjecten.objectId, personen.id))
      .leftJoin(gebouwen, eq(groepObjecten.objectId, gebouwen.id))
      .where(eq(groepObjecten.groepId, groepId));

    // Formatteer de namen in JavaScript (dit voorkomt SQLite NULL-strings problemen)
    const gekoppeldeObjecten = ruweObjecten.map((obj) => {
      let weergaveNaam = "Onbekend Object";

      if (obj.objectType === "personen" && obj.voornamen) {
        weergaveNaam = `${obj.voornamen} ${obj.achternaam}`;
      } else if (obj.objectType === "gebouwen" && obj.straat) {
        weergaveNaam = `${obj.straat} ${obj.nummer} (${obj.plaats})`;
      }

      return {
        id: obj.id,
        objectId: obj.objectId,
        objectType: obj.objectType,
        weergaveNaam,
      };
    });

    return { groepInfo, gekoppeldeObjecten };
  } catch (error) {
    console.error("Fout bij ophalen groep met objecten:", error);
    return null;
  }
}

// 4. Haal alle beschikbare 'stamgegevens' objecten op (klaar voor selectie)
export async function getBeschikbareStamgegevens() {
  const allePersonen = await db
    .select({
      id: personen.id,
      naam: sql<string>`${personen.voornamen} || ' ' || ${personen.achternaam}`
    })
    .from(personen)
    .orderBy(personen.achternaam);

  const alleGebouwen = await db
    .select({
      id: gebouwen.id,
      naam: sql<string>`${gebouwen.straat} || ' ' || ${gebouwen.nummer} || ' (' || ${gebouwen.plaats} || ')'`
    })
    .from(gebouwen)
    .orderBy(gebouwen.straat);

  return { allePersonen, alleGebouwen };
}

// 5. Koppel een object aan een groep
export async function voegObjectToeAanGroep(groepId: string, objectType: string, objectId: string) {
  try {
    await db.insert(groepObjecten).values({
      groepId,
      objectId,
      objectType, // "personen" of "gebouwen"
    });

    revalidatePath(`/beheer/groepen/${groepId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij koppelen object aan groep:", error);
    return { success: false };
  }
}

// 6. Ontkoppel een object uit een groep
export async function verwijderObjectUitGroep(id: string, groepId: string) {
  try {
    await db.delete(groepObjecten).where(eq(groepObjecten.id, id));
    revalidatePath(`/beheer/groepen/${groepId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij ontkoppelen object:", error);
    return { success: false };
  }
}