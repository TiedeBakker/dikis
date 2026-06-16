"use server";

// Let op: controleer of dit pad klopt met waar jouw 'db' geëxporteerd wordt
// Vaak is dit '@/db' of '@/app/lib/db' afhankelijk van je setup.
import { db } from "@/db";
import { keuzelijsten, keuzelijstOpties } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { parameterSets, setRegels, parameters } from "@/db/schema"; // Zorg dat deze geïmporteerd zijn!
import { metingen, groepen, groepObjecten } from "@/db/schema";
import { desc, and } from "drizzle-orm"; // Zorg dat 'desc' en 'and' geïmporteerd zijn


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

export async function getFormulierBlueprint(setId: string) {
    try {
        const velden = await db
            .select({
                regelId: setRegels.id,
                parameterId: parameters.id,
                // Als we in setRegels een label override hebben, gebruik die, anders de standaard naam
                naam: setRegels.label,
                standaardNaam: parameters.naam,
                type: parameters.type,
                verplicht: setRegels.verplicht,
                keuzelijstId: parameters.keuzelijstId,
                volgnr: setRegels.volgnr,
            })
            .from(setRegels)
            .innerJoin(parameters, eq(setRegels.parameterId, parameters.id))
            .where(eq(setRegels.setId, setId))
            .orderBy(asc(setRegels.volgnr));

        return velden;
    } catch (error) {
        console.error("Fout bij ophalen formulier:", error);
        return [];
    }
}
// ... je bestaande imports staan hierboven ...

// Het type voor de data die we vanuit het formulier verwachten
export type IngevuldeMeting = {
    parameterId: string;
    waarde: string;
};

export async function saveMetingenSessie(
    objectId: string,
    objectType: string,
    ingevuldeMetingen: IngevuldeMeting[]
) {
    try {
        // Genereer 1 uniek ID voor dit hele formulier-moment
        const sessieId = crypto.randomUUID();

        // 1. Haal het verwachte 'Insert' type direct uit je Drizzle schema
        type InsertMeting = typeof metingen.$inferInsert;
        // 2. Koppel dit type aan je array. TypeScript wijst nu direct de fout aan!
        const insertData: InsertMeting[] = ingevuldeMetingen.map((meting) => ({
            // LET OP: Controleer in schema.ts of deze namen exact kloppen. 
            // Als je schema underscores gebruikt, verander 'sessieId' hier dan naar 'sessie_id', etc.
            sessieId: sessieId,
            objectId: objectId,
            objectType: objectType,
            parameterId: meting.parameterId,

            // 3. Forceer de waarde áltijd naar een string, zodat Drizzle niet meer over numbers valt
            waarde: String(meting.waarde),
        }));

        // Nu zal deze regel nooit meer een overload-error geven
        await db.insert(metingen).values(insertData);

        return { success: true, sessieId };
    } catch (error) {
        console.error("Fout bij opslaan metingen:", error);
        return { success: false, error: "Opslaan mislukt" };
    }
}

export async function getGroepContext(groepId: string) {
    try {
        // 1. Haal de groep op inclusief de gekoppelde formulierSetId
        const groep = await db
            .select({
                id: groepen.id,
                naam: groepen.naam,
                standaardSetId: groepen.standaardSetId,
            })
            .from(groepen)
            .where(eq(groepen.id, groepId))
            .then((res) => res[0]);

        if (!groep) throw new Error("Groep niet gevonden");

        // 2. Haal alle objecten op die in deze groep zitten
        const objecten = await db
            .select({
                objectId: groepObjecten.objectId,
                objectType: groepObjecten.objectType,
            })
            .from(groepObjecten)
            .where(eq(groepObjecten.groepId, groepId));

        return {
            groep,
            objecten,
        };
    } catch (error) {
        console.error("Fout bij ophalen groep-context:", error);
        return null;
    }
}

export async function getLaatsteWaarde(objectId: string, parameterId: string) {
    try {
        const laatsteMeting = await db
            .select({
                waarde: metingen.waarde,
                datumTijd: metingen.datumTijd, // Handig om te weten WANNEER dit was
            })
            .from(metingen)
            .where(
                and(
                    eq(metingen.objectId, objectId),
                    eq(metingen.parameterId, parameterId)
                )
            )
            .orderBy(desc(metingen.datumTijd)) // Nieuwste meting bovenaan
            .limit(1) // We willen er maar één
            .then((res) => res[0]);

        // GEWIJZIGD: We geven nu een object terug met waarde én datum, of null
        return laatsteMeting ? { waarde: laatsteMeting.waarde, datumTijd: laatsteMeting.datumTijd } : null;
    } catch (error) {
        console.error("Fout bij ophalen historie:", error);
        return null;
    }
}