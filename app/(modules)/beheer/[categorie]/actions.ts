"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { getBeheerConfig } from "../../../lib/beheer"; // Zorg dat dit pad klopt met je lib map
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function opslaanRecord(categorieNaam: string, formData: FormData) {
  const config = await getBeheerConfig(categorieNaam);
  if (!config) throw new Error("Configuratie ontbreekt");

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) throw new Error(`Tabel ${categorieNaam} niet gevonden`);

  const data: Record<string, any> = {};
  config.velden.forEach((v) => {
    const val = formData.get(v.id);
    // Verwerk checkbox expliciet naar boolean, de rest naar waarde of null
    if (v.type === "checkbox") {
      data[v.id] = val === "true";
    } else {
      data[v.id] = val === "" ? null : val;
    }
  });

  await db.insert(targetTable).values(data);
  revalidatePath(`/beheer/${categorieNaam}`);
}

export async function bijwerkenRecord(categorieNaam: string, id: string, formData: FormData) {
  const config = await getBeheerConfig(categorieNaam);
  if (!config) throw new Error("Configuratie ontbreekt");

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) throw new Error(`Tabel ${categorieNaam} niet gevonden`);

  const data: Record<string, any> = {};
  config.velden.forEach((v) => {
    const val = formData.get(v.id);
    if (v.type === "checkbox") {
      data[v.id] = val === "true";
    } else {
      data[v.id] = val === "" ? null : val;
    }
  });

  await db.update(targetTable).set(data).where(eq(targetTable.id, id));
  revalidatePath(`/beheer/${categorieNaam}`);
}