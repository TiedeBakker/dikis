"use server";

import { db } from "@/db";
import { groepen, groepObjecten, parameterSets, setRegels, parameters, metingen, personen, gebouwen } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Haal alle groepen op waar een inspecteur uit kan kiezen
export async function getInspectieGroepen() {
  return await db
    .select({
      id: groepen.id,
      naam: groepen.naam,
      toelichting: groepen.toelichting,
      setName: parameterSets.naam,
    })
    .from(groepen)
    .leftJoin(parameterSets, eq(groepen.standaardSetId, parameterSets.id))
    .orderBy(groepen.naam);
}

// 2. Haal een groep op inclusief de objecten en de bijbehorende formulier-blauwdruk
export async function getInspectieGroepDetails(groepId: string) {
  // A. Groep & Set info ophalen
  const groepInfo = await db
    .select({
      id: groepen.id,
      naam: groepen.naam,
      standaardSetId: groepen.standaardSetId,
    })
    .from(groepen)
    .where(eq(groepen.id, groepId))
    .then((res) => res[0]);

  if (!groepInfo || !groepInfo.standaardSetId) return null;

  // B. Dynamische formulierregels (parameters) ophalen voor deze set
  const formulierVelden = await db
    .select({
      regelId: setRegels.id,
      parameterId: setRegels.parameterId,
      label: setRegels.label,
      verplicht: setRegels.verplicht,
      volgnr: setRegels.volgnr,
      paramNaam: parameters.naam,
      paramType: parameters.type,
    })
    .from(setRegels)
    .leftJoin(parameters, eq(setRegels.parameterId, parameters.id))
    .where(eq(setRegels.setId, groepInfo.standaardSetId))
    .orderBy(setRegels.volgnr);

  // C. Gekoppelde objecten ophalen
  const ruweObjecten = await db
    .select({
      id: groepObjecten.id,
      objectId: groepObjecten.objectId,
      objectType: groepObjecten.objectType,
      voornamen: personen.voornamen,
      achternaam: personen.achternaam,
      straat: gebouwen.straat,
      nummer: gebouwen.nummer,
      plaats: gebouwen.plaats,
    })
    .from(groepObjecten)
    .leftJoin(personen, eq(groepObjecten.objectId, personen.id))
    .leftJoin(gebouwen, eq(groepObjecten.objectId, gebouwen.id))
    .where(eq(groepObjecten.groepId, groepId));

  const objecten = ruweObjecten.map((obj) => {
    let naam = "Onbekend Object";
    if (obj.objectType === "personen" && obj.voornamen) {
      naam = `${obj.voornamen} ${obj.achternaam}`;
    } else if (obj.objectType === "gebouwen" && obj.straat) {
      naam = `${obj.straat} ${obj.nummer} (${obj.plaats})`;
    }
    return { id: obj.objectId, type: obj.objectType, naam };
  });

  return { groepInfo, formulierVelden, objecten };
}

// 3. Haal de allerlaatste metingen op voor een specifiek object (historie-referentie)
export async function getLaatsteMetingenVoorObject(objectId: string) {
  // We gebruiken een subquery/groepering of halen simpelweg de recente records op
  return await db
    .select({
      parameterId: metingen.parameterId,
      waarde: metingen.waarde,
      datumTijd: metingen.datumTijd,
    })
    .from(metingen)
    .where(eq(metingen.objectId, objectId))
    .orderBy(desc(metingen.datumTijd));
}

// 4. Sla een complete inspectie/meting sessie op
export async function slaMetingenOp(
  groepId: string,
  objectId: string,
  objectType: string,
  metingenData: Record<string, string> // Sleutel = parameterId, Waarde = de input string
) {
  try {
    const sessieId = crypto.randomUUID();
    const nu = new Date().toISOString();

    // Bouw de inserts op voor elke ingevulde parameter
    const inserts = Object.entries(metingenData)
      .filter(([_, waarde]) => waarde !== undefined && waarde !== "")
      .map(([parameterId, waarde]) => ({
        id: crypto.randomUUID(),
        sessieId,
        objectId,
        objectType,
        parameterId,
        waarde: waarde.toString(),
        datumTijd: nu,
      }));

    if (inserts.length > 0) {
      await db.insert(metingen).values(inserts);
    }

    revalidatePath(`/inspectie/${groepId}`);
    return { success: true };
  } catch (error) {
    console.error("Fout bij opslaan metingen:", error);
    return { success: false };
  }
}