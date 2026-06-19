"use server";

import { db } from "@/db";
import { groepen, groepObjecten } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Maak een nieuwe groep / inspectieronde aan
export async function createGroep(naam: string, toelichting?: string, standaardSetId?: string) {
  try {
    const nieuwId = crypto.randomUUID();
    await db.insert(groepen).values({
      id: nieuwId,
      naam,
      toelichting: toelichting || null,
      standaardSetId: standaardSetId || null,
    });
    
    revalidatePath("/beheer/groepen");
    return { success: true, groepId: nieuwId };
  } catch (error) {
    console.error("Fout bij aanmaken groep:", error);
    return { success: false, error: "Kon de groep niet aanmaken." };
  }
}

// 2. Koppel een universeel object (via unieke UUID) aan een groep
export async function koppelObjectAanGroep(groepId: string, objectId: string, objectType: string) {
  try {
    // Voorkom dat exact hetzelfde object twee keer in dezelfde groep belandt
    const bestaand = await db
      .select()
      .from(groepObjecten)
      .where(
        and(
          eq(groepObjecten.groepId, groepId),
          eq(groepObjecten.objectId, objectId)
        )
      );

    if (bestaand.length > 0) {
      return { success: false, error: "Dit object is al gekoppeld aan deze groep." };
    }

    await db.insert(groepObjecten).values({
      id: crypto.randomUUID(),
      groepId,
      objectId,
      objectType, // Fungeert als 'routerings-hint' voor de UI (bijv. "gebouwen", "personen")
    });

    revalidatePath(`/beheer/groepen/${groepId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij koppelen object:", error);
    return { success: false, error: "Koppelen mislukt." };
  }
}

// 3. Ontkoppel een object uit een groep
export async function ontkoppelObjectVanGroep(koppelingId: string, groepId: string) {
  try {
    await db.delete(groepObjecten).where(eq(groepObjecten.id, koppelingId));
    revalidatePath(`/beheer/groepen/${groepId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij ontkoppelen object:", error);
    return { success: false };
  }
}