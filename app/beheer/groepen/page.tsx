import { getGroepen, createGroep } from "./actions";
import { getParameterSets } from "../parameter-sets/actions"; // We hergebruiken de action van net!
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function GroepenOverzichtPage() {
  const [groepenLijst, parameterSetsLijst] = await Promise.all([
    getGroepen(),
    getParameterSets(),
  ]);

  // Inline Server Action voor het formulier
  async function handleCreateGroep(formData: FormData) {
    "use server";
    const naam = formData.get("naam") as string;
    const standaardSetId = formData.get("standaardSetId") as string;
    const toelichting = formData.get("toelichting") as string;

    if (!naam || !standaardSetId) return;

    await createGroep(naam, standaardSetId, toelichting);
    revalidatePath("/beheer/groepen");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-black">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Beheer Groepen & Inspecties</h1>
        <p className="text-sm text-gray-500">
          Maak groepen aan (bijv. per regio, team of project) en koppel er een formulier-blauwdruk aan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* LINKER KOLOM: Groep aanmaken */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 text-base">Nieuwe Groep Starten</h2>
          <form action={handleCreateGroep} className="space-y-4">
            
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Naam groep</label>
              <input 
                type="text" 
                name="naam" 
                placeholder="bijv. Regio Oost - Brandveiligheid"
                required 
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Gekoppeld Formulier (Set)</label>
              <select 
                name="standaardSetId" 
                required
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Kies een parameterset --</option>
                {parameterSetsLijst.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.naam}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Toelichting (optioneel)</label>
              <textarea 
                name="toelichting" 
                placeholder="Voor welk team of welk doel is deze groep?"
                rows={3}
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Groep Aanmaken
            </button>
          </form>
        </div>

        {/* RECHTER KOLOM: Overzichtstabel Groepen */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Groep</th>
                <th className="p-4">Gekoppelde parameterset</th>
                <th className="p-4 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {groepenLijst.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                    Nog geen groepen aangemaakt. Richt links je eerste groep in.
                  </td>
                </tr>
              ) : (
                groepenLijst.map((groep) => (
                  <tr key={groep.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-950">{groep.naam}</div>
                      <div className="text-xs text-gray-400">{groep.toelichting || "Geen toelichting"}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                        {groep.setName || "Geen set gekoppeld"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/beheer/groepen/${groep.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-md text-xs font-medium border border-gray-200 hover:border-blue-200 transition-all"
                      >
                        Objecten Beheren →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}