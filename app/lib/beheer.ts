import { db } from "@/db";
import { beheerMetadata } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getBeheerConfig(tabelNaam: string) {
  const metadata = await db
    .select()
    .from(beheerMetadata)
    .where(eq(beheerMetadata.tabelNaam, tabelNaam))
    .orderBy(asc(beheerMetadata.volgnummer));

  if (metadata.length === 0) return null;

  return {
    tabelLabel: metadata[0].tabelLabel,
    velden: metadata.map(m => ({
      id: m.veldId,
      label: m.veldLabel,
      type: m.veldType,
      verplicht: m.verplicht // <-- NIEUW
    }))
  };
}