// src/app/(modules)/beheer/parameter-sets/[setId]/page.tsx
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { parameterSets, setRegels, parameters } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { voegParameterToeAanSet, verwijderRegelUitSet, updateSetRegel } from "../actions";
import VolgnrInput from "./_components/VolgnrInput";
import LabelInput from "./_components/LabelInput";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function ParameterSetDetailPage({ params }: PageProps) {
  const { setId } = await params;

  // 1. Haal de specifieke parameterset op
  const [set] = await db.select().from(parameterSets).where(eq(parameterSets.id, setId));
  if (!set) notFound();

  // 2. Haal de huidige regels binnen deze set op, inclusief parameter-info
  const regelsMetParameters = await db
    .select({
      id: setRegels.id,
      label: setRegels.label,
      verplicht: setRegels.verplicht,
      volgnr: setRegels.volgnr,
      parameterId: parameters.id,
      parameterNaam: parameters.naam,
      parameterType: parameters.type,
    })
    .from(setRegels)
    .innerJoin(parameters, eq(setRegels.parameterId, parameters.id))
    .where(eq(setRegels.setId, setId))
    .orderBy(asc(setRegels.volgnr));

  // 3. Haal alle beschikbare basisparameters op voor de "Nieuwe regel toevoegen" dropdown
  const alleBeschikbareParameters = await db
    .select()
    .from(parameters)
    .orderBy(asc(parameters.naam));

  return (
    <div className="w-full space-y-6">

      {/* KOPREGEL MET CRUMBS */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            <Link href="/beheer/parameter-sets" className="hover:text-blue-600 transition-colors">Parametersets</Link>
            <span>&raquo;</span>
            <span className="text-gray-800">Editor</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Blauwdruk: {set.naam}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{set.toelichting || "Geen toelichting aanwezig"}</p>
        </div>

        <Link
          href="/beheer/parameter-sets"
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          ⬅️ Terug naar Overzicht
        </Link>
      </div>

      {/* SPLIT SCREEN OVER DE VOLLEDIGE BREEDTE */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* RECHTS / HOOFDDEEL (xl:col-span-3): De Regels van het formulier */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wide">Formulier Velden & Volgorde</h2>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {regelsMetParameters.length} velden actief
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-20 text-center">Volgnr</th>
                <th className="p-3.5">Basisparameter</th>
                <th className="p-3.5 w-40">Type</th>
                <th className="p-3.5">Label Override (Optioneel)</th>
                <th className="p-3.5 w-24 text-center">Verplicht</th>
                <th className="p-3.5 w-20 text-center">Verwijderen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regelsMetParameters.map((regel) => (
                <tr key={regel.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Volgnummer */}
                  <td className="p-3 text-center">
                    <VolgnrInput
                      regelId={regel.id}
                      initialVolgnr={regel.volgnr}
                      updateAction={updateSetRegel}
                    />
                  </td>
                  {/* Parameter info */}
                  <td className="p-3 font-semibold text-gray-900">{regel.parameterNaam}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[11px]">
                      {regel.parameterType}
                    </span>
                  </td>

                  {/* Label Override Veld */}
                  <td className="p-3">
                    <LabelInput
                      regelId={regel.id}
                      initialLabel={regel.label || ""}
                      placeholder={regel.parameterNaam}
                      updateAction={updateSetRegel}
                    />
                  </td>
                  {/* Verplicht checkbox */}
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      defaultChecked={regel.verplicht}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>

                  {/* Actieknop */}
                  <td className="p-3 text-center">
                    <form action={async () => {
                      "use server";
                      await verwijderRegelUitSet(regel.id, setId);
                    }}>
                      <button type="submit" className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {regelsMetParameters.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Dit formulier is nog leeg. Voeg hiernaast een parameter toe om te starten.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* LINKS / ZIJBALK (xl:col-span-1): Snel een nieuwe parameter toevoegen */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">
            + Veld Toevoegen
          </h3>

          <form className="space-y-3" action={async (formData: FormData) => {
            "use server";
            const parameterId = formData.get("parameterId") as string;
            if (!parameterId) return;

            await voegParameterToeAanSet(setId, parameterId);
          }}>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Selecteer Parameter</label>
              <select name="parameterId" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:border-blue-500 outline-none transition-all">
                <option value="">-- Kies een parameter --</option>
                {alleBeschikbareParameters.map(p => (
                  <option key={p.id} value={p.id}>{p.naam} ({p.type})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Volgnr</label>
                <input type="number" name="volgnr" defaultValue={regelsMetParameters.length + 1} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                  <input type="checkbox" name="verplicht" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  Verplicht
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs font-semibold shadow-sm transition-colors text-center mt-2">
              Voeg toe aan Formulier
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}