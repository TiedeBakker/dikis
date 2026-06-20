import { db } from "@/db";
import { beheerMetadata } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getBeheerConfig(tabelNaam: string) {
  try {
    // 1. Haal alle velddefinities op voor deze specifieke tabel
    const rijen = await db
      .select()
      .from(beheerMetadata)
      .where(eq(beheerMetadata.tabelNaam, tabelNaam))
      .orderBy(asc(beheerMetadata.volgnummer));

    // Als er geen velden zijn gedefinieerd voor deze tabel, geef null terug (resulteert in 404)
    if (rijen.length === 0) {
      return null;
    }

    // 2. Transformeer de database-rijen naar het object-formaat dat jouw page.tsx verwacht
    return {
      tabelLabel: rijen[0].tabelLabel, // Pakt het overkoepelende label (bijv. "Personen")
      velden: rijen.map((rij) => ({
        id: rij.veldId,          // De database kolomnaam (bijv. "voornamen")
        label: rij.veldLabel,    // De weergavenaam (bijv. "Voornaam")
        type: rij.veldType,      // Type input (bijv. "text", "date", "select", "checkbox")
        verplicht: rij.verplicht,  // Boolean
        lookupTabel: rij.lookupTabel, // Eventuele referentietabel voor dropdowns
        toelichting: rij.toelichting, // Optionele hint onder het invoerveld
      })),
    };
  } catch (error) {
    console.error(`Fout in getBeheerConfig voor tabel ${tabelNaam}:`, error);
    return null;
  }
}