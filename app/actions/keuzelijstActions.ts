"use server";

import { db } from "@/db"; // Pas aan naar jouw database-import pad
import { keuzelijsten, keuzelijstOpties } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// Haal één specifieke keuzelijst op met al haar opties (gesorteerd op volgnr)
export async function getKeuzelijstMetOpties(keuzelijstId: string) {
  try {
    const opties = await db
      .select({
        id: keuzelijstOpties.id,
        waarde: keuzelijstOpties.waarde,
        volgnr: keuzelijstOpties.volgnr,
      })
      .from(keuzelijstOpties)
      .where(eq(keuzelijstOpties.keuzelijstId, keuzelijstId))
      .orderBy(asc(keuzelijstOpties.volgnr));

    return opties;
  } catch (error) {
    console.error("Fout bij ophalen keuzelijst:", error);
    return [];
  }
}