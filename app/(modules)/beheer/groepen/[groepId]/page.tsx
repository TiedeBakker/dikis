import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { groepen, groepObjecten, vBeschikbareObjecten } from "@/db/schema";
import { eq } from "drizzle-orm";
import { koppelObjectAanGroep, ontkoppelObjectVanGroep } from "../actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ groepId: string }>;
}

export default async function GroepDetailPage({ params }: PageProps) {
  const { groepId } = await params;

  // 1. Haal de specifieke groep op
  const [groep] = await db.select().from(groepen).where(eq(groepen.id, groepId));
  if (!groep) notFound();

  // 2. Haal alle beschikbare objecten op uit de UNIVERSELE database-view
  const alleBeschikbareObjecten = await db.select().from(vBeschikbareObjecten);

  // 3. Haal de koppelingen op voor deze specifieke groep
  const gekoppeldeKoppelingen = await db
    .select()
    .from(groepObjecten)
    .where(eq(groepObjecten.groepId, groepId));

  // 4. Match de koppelingen live aan de view-data
  const gekoppeldeObjectenMetInfo = gekoppeldeKoppelingen.map((koppeling) => {
    const info = alleBeschikbareObjecten.find(
      (obj) => obj.objectId === koppeling.objectId && obj.objectType === koppeling.objectType
    );

    const icon = koppeling.objectType === "gebouwen" ? "🏢" : "👤";

    return {
      id: koppeling.id,
      objectType: koppeling.objectType,
      naam: info ? `${icon} ${info.weergaveNaam}` : `❓ Gekoppeld object buiten stamgegevens`,
      details: info?.extraInfo || "",
    };
  });

  // Groepeer de view-data voor de dropdown-keuzelijsten
  const selectieGebouwen = alleBeschikbareObjecten.filter(o => o.objectType === "gebouwen");
  const selectiePersonen = alleBeschikbareObjecten.filter(o => o.objectType === "personen");

  return (
    <div className="w-full space-y-6">
      {/* KOPREGEL */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            <Link href="/beheer/groepen" className="hover:text-blue-600 transition-colors">Groepen</Link>
            <span>&raquo;</span>
            <span className="text-gray-800">Polymorf Beheer</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Groep: {groep.naam}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{groep.toelichting || "Geen toelichting"}</p>
        </div>

        <Link
          href="/beheer/groepen"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          ⬅️ Terug naar Overzicht
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* LINKS: Gekoppelde objecten */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wide">Gekoppelde Objecten</h2>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {gekoppeldeObjectenMetInfo.length} gekoppeld
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Naam</th>
                <th className="p-3.5">Kenmerken / Adres</th>
                <th className="p-3.5 w-32">Type</th>
                <th className="p-3.5 w-24 text-center">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gekoppeldeObjectenMetInfo.map((obj) => (
                <tr key={obj.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-semibold text-gray-900">{obj.naam}</td>
                  <td className="p-3.5 text-gray-500">{obj.details}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] uppercase">
                      {obj.objectType}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <form action={async () => {
                      "use server";
                      await ontkoppelObjectVanGroep(obj.id, groepId);
                    }}>
                      <button type="submit" className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {gekoppeldeObjectenMetInfo.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                    Deze groep is leeg. Voeg hiernaast objecten toe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RECHTS: Object koppelen */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">
            + Object Koppelen
          </h3>

          <form className="space-y-4" action={async (formData: FormData) => {
            "use server";
            const target = formData.get("objectTarget") as string;
            if (!target) return;
            
            const [objectType, objectId] = target.split(":");
            if (objectType && objectId) {
              await koppelObjectAanGroep(groepId, objectId, objectType);
            }
          }}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Selecteer uit Stamgegevens
              </label>
              <select 
                name="objectTarget" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:border-blue-500 outline-none transition-all"
              >
                <option value="">-- Kies een object --</option>
                
                {selectieGebouwen.length > 0 && (
                  <optgroup label="🏢 GEBOUWEN">
                    {selectieGebouwen.map((g) => (
                      <option key={g.objectId} value={`gebouwen:${g.objectId}`}>{g.weergaveNaam}</option>
                    ))}
                  </optgroup>
                )}

                {selectiePersonen.length > 0 && (
                  <optgroup label="👤 PERSONEN">
                    {selectiePersonen.map((p) => (
                      <option key={p.objectId} value={`personen:${p.objectId}`}>{p.weergaveNaam}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs font-semibold shadow-sm transition-colors text-center"
            >
              Voeg toe aan Groep
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}