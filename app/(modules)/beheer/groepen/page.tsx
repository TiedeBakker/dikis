import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { groepen, parameterSets } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function GroepenOverzichtPage() {
  // Haal groepen op inclusief de naam van de gekoppelde parameterset
  const alleGroepen = await db
    .select({
      id: groepen.id,
      naam: groepen.naam,
      toelichting: groepen.toelichting,
      setName: parameterSets.naam,
    })
    .from(groepen)
    .leftJoin(parameterSets, eq(groepen.standaardSetId, parameterSets.id))
    .orderBy(asc(groepen.naam));

  return (
    <div className="w-full space-y-6">
      {/* KOPREGEL */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Groepen & Locatiestructuur</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Beheer inspectierondes en clusters. Koppel objecten type-agnostisch op basis van UUID.
          </p>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors">
          + Nieuwe Groep
        </button>
      </div>

      {/* OVERZICHTSTABEL */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
              <th className="p-3.5">Groepsnaam</th>
              <th className="p-3.5">Toelichting</th>
              <th className="p-3.5">Gekoppelde Blauwdruk</th>
              <th className="p-3.5 w-32 text-center">Actie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alleGroepen.map((groep) => (
              <tr key={groep.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="p-4 font-semibold text-gray-900">{groep.naam}</td>
                <td className="p-4 text-gray-500">{groep.toelichting || "Geen toelichting"}</td>
                <td className="p-4">
                  {groep.setName ? (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      📋 {groep.setName}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Geen formulier gekoppeld</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <Link
                    href={`/beheer/groepen/${groep.id}`}
                    className="bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-2.5 py-1.5 rounded font-semibold transition-colors"
                  >
                    ⚙️ Objecten beheren
                  </Link>
                </td>
              </tr>
            ))}
            {alleGroepen.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                  Er zijn nog geen groepen aangemaakt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}