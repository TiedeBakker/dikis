"use server";

import { db } from "@/db";
import { parameterSets, setRegels, parameters } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Haal alle parametersets op voor het overzicht
export async function getParameterSets() {
  try {
    return await db.select().from(parameterSets).orderBy(parameterSets.naam);
  } catch (error) {
    console.error("Fout bij ophalen parameter sets:", error);
    return [];
  }
}

// 2. Maak een gloednieuwe (lege) parameterset aan
export async function createParameterSet(naam: string, toelichting?: string) {
  try {
    const nieuwId = crypto.randomUUID();
    await db.insert(parameterSets).values({
      id: nieuwId,
      naam,
      toelichting: toelichting || null,
    });
    
    revalidatePath("/beheer/parameter-sets");
    return { success: true, setId: nieuwId };
  } catch (error) {
    console.error("Fout bij aanmaken parameter set:", error);
    return { success: false, error: "Kon de set niet aanmaken." };
  }
}

// 3. Haal een specifieke set op met al zijn gekoppelde regels (parameters)
export async function getParameterSetMetRegels(setId: string) {
  try {
    const setInfo = await db
      .select()
      .from(parameterSets)
      .where(eq(parameterSets.id, setId))
      .then((res) => res[0]);

    if (!setInfo) return null;

    const regels = await db
      .select({
        id: setRegels.id,
        parameterId: setRegels.parameterId,
        label: setRegels.label,
        verplicht: setRegels.verplicht,
        volgnr: setRegels.volgnr,
        parameterNaam: parameters.naam,
        parameterType: parameters.type,
      })
      .from(setRegels)
      .leftJoin(parameters, eq(setRegels.parameterId, parameters.id))
      .where(eq(setRegels.setId, setId))
      .orderBy(asc(setRegels.volgnr));

    return { setInfo, regels };
  } catch (error) {
    console.error("Fout bij ophalen set met regels:", error);
    return null;
  }
}

// 4. Haal álle beschikbare parameters op (voor de 'voeg toe' selectie)
export async function getAlleParameters() {
  return await db.select().from(parameters).orderBy(parameters.naam);
}

// 5. Voeg een parameter toe aan een set
export async function voegParameterToeAanSet(setId: string, parameterId: string) {
  try {
    // Bepaal het hoogste volgnummer zodat de nieuwe onderaan aansluit
    const bestaandeRegels = await db
      .select({ volgnr: setRegels.volgnr })
      .from(setRegels)
      .where(eq(setRegels.setId, setId));
    
    const hoogsteVolgnr = bestaandeRegels.reduce((max, r) => Math.max(max, r.volgnr), 0);

    await db.insert(setRegels).values({
      setId,
      parameterId,
      volgnr: hoogsteVolgnr + 1,
      verplicht: false,
    });

    revalidatePath(`/beheer/parameter-sets/${setId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij toevoegen parameter aan set:", error);
    return { success: false };
  }
}

// 6. Update een specifieke regel (label, verplicht, volgnr)
export async function updateSetRegel(
  regelId: string, 
  data: { label?: string; verplicht?: boolean; volgnr?: number }
) {
  try {
    // 1. Haal eerst de setId op van deze regel om de juiste pagina te kunnen refreshen
    const huidigeRegel = await db
      .select({ setId: setRegels.setId })
      .from(setRegels)
      .where(eq(setRegels.id, regelId))
      .then((res) => res[0]);

    // 2. Bouw de update-set dynamisch op
    const updateData: Record<string, any> = {};
    if (data.label !== undefined) updateData.label = data.label === "" ? null : data.label;
    if (data.verplicht !== undefined) updateData.verplicht = data.verplicht;
    if (data.volgnr !== undefined) updateData.volgnr = data.volgnr;
    console.log("Updating regel 1234 update:", regelId, data, data.volgnr,"TEST");
    console.log("Updating regel 1234 updateData:", updateData.volgnr,"TEST111");

    // 3. Voer de update uit
    await db
      .update(setRegels)
      .set(updateData)
      .where(eq(setRegels.id, regelId));
    
    // 4. Dwing Next.js om de beheerpagina opnieuw op te bouwen (en dus opnieuw te sorteren!)
    if (huidigeRegel?.setId) {
      revalidatePath(`/beheer/parameter-sets/${huidigeRegel.setId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Fout bij updaten regel:", error);
    return { success: false };
  }
}
// 7. Verwijder een parameter uit de set
export async function verwijderRegelUitSet(regelId: string, setId: string) {
  try {
    await db.delete(setRegels).where(eq(setRegels.id, regelId));
    revalidatePath(`/beheer/parameter-sets/${setId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij verwijderen regel:", error);
    return { success: false };
  }
}
