"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { getBeheerConfig } from "../../lib/beheer"; // Even gecontroleerd: we stonden al op ../../
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm"; // NIEUW: Nodig voor de WHERE clause

export async function opslaanRecord(categorieNaam: string, formData: FormData) {
  const config = await getBeheerConfig(categorieNaam);
  if (!config) throw new Error("Configuratie ontbreekt");

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) throw new Error(`Tabel ${categorieNaam} niet gevonden`);

  const data: Record<string, any> = {};
  config.velden.forEach((v) => {
    const val = formData.get(v.id);
    data[v.id] = val === "" ? null : val;
  });

  await db.insert(targetTable).values(data);
  revalidatePath(`/beheer/${categorieNaam}`);
}

// NIEUW: Actie voor het bijwerken van een bestaand record
export async function bijwerkenRecord(categorieNaam: string, id: number, formData: FormData) {
  const config = await getBeheerConfig(categorieNaam);
  if (!config) throw new Error("Configuratie ontbreekt");

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) throw new Error(`Tabel ${categorieNaam} niet gevonden`);

  const data: Record<string, any> = {};
  config.velden.forEach((v) => {
    const val = formData.get(v.id);
    data[v.id] = val === "" ? null : val;
  });

  // Update de specifieke rij waar id gelijk is aan het meegegeven id
  await db.update(targetTable).set(data).where(eq(targetTable.id, id));
  
  revalidatePath(`/beheer/${categorieNaam}`);
}