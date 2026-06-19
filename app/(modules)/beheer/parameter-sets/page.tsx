// src/app/(modules)/beheer/parameter-sets/page.tsx
import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { parameterSets } from "@/db/schema";
import { asc } from "drizzle-orm";

//import { db } from "@/db";
import { sql } from "drizzle-orm";

// Plak dit ergens waar de code 1 keer wordt uitgevoerd bij het laden van de pagina:
await db.run(sql`DROP VIEW IF EXISTS v_beschikbare_objecten;`);
console.log("VIEW IS SUCCESVOL VERWIJDERD!");

export const dynamic = "force-dynamic";

export default async function ParameterSetsOverzichtPage() {
  const sets = await db.select().from(parameterSets).orderBy(asc(parameterSets.naam));

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Parametersets (Formulier-blauwdrukken)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Beheer hier de opbouw en invulvelden van de inspectieformulieren die in het veld gebruikt worden.
          </p>
        </div>
        
        {/* Knop voor een nieuwe set */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
          + Nieuwe Blauwdruk Starten
        </button>
      </div>

      {/* Tabel met alle beschikbare sets */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <th className="p-4">Formulier / Set Naam</th>
              <th className="p-4">Beschrijving</th>
              <th className="p-4 text-right">Actie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sets.map((set) => (
              <tr key={set.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-gray-900">{set.naam}</td>
                <td className="p-4 text-gray-500">{set.toelichting || "Geen toelichting"}</td>
                <td className="p-4 text-right">
                  <Link
                    href={`/beheer/parameter-sets/${set.id}`}
                    className="inline-flex items-center gap-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-md font-medium text-xs transition-colors"
                  >
                    🖊️ Wijzig Opbouw
                  </Link>
                </td>
              </tr>
            ))}
            {sets.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">
                  Er zijn nog geen parametersets aangemaakt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}