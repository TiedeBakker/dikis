import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Voer de harde SQL-drop uit
    await db.run(sql`DROP VIEW IF EXISTS v_beschikbare_objecten;`);
    return NextResponse.json({ success: true, message: "De gecrashte view is succesvol verwijderd!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}