import {  getInspectieGroepen } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InspectieStartPage() {
  const groepen = await getInspectieGroepen();

  return (
    <div className="text-amber-200xt-black max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">👋 Inspecties Uitvoeren</h2>
        <p className="text-gray-600 text-slate-50t-sm mt-1">Selecteer de groep of locatie-cluster waar je momenteel aan het werk bent.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groepen.length === 0 ? (
          <p className="text-gray-400 italic col-span-2 p-8 text-center bg-white rounded-xl border border-gray-200">
            Er zijn momenteel geen actieve groepen geconfigureerd. Vraag de beheerder een groep aan te maken.
          </p>
        ) : (
          groepen.map((groep) => (
            <Link
              key={groep.id}
              href={`/inspectie/${groep.id}`}
              className="p-5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl shadow-sm transition-all hover:shadow flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{groep.naam}</h3>
                <p className="text-xs text-gray-400 mt-1">{groep.toelichting || "Geen extra omschrijving beschikbaar."}</p>
              </div>
              <div className="mt-6 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                <span>Formulier: <strong className="text-gray-700">{groep.setName}</strong></span>
                <span className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Start →</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}