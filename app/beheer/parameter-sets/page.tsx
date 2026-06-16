import { getParameterSets, createParameterSet } from "./actions";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ParameterSetsPage() {
  const sets = await getParameterSets();

  // Server Action inline voor het afhandelen van het aanmaak-formulier
  async function handleCreate(formData: FormData) {
    "use server";
    const naam = formData.get("naam") as string;
    const toelichting = formData.get("toelichting") as string;

    if (!naam) return;

    await createParameterSet(naam, toelichting);
    revalidatePath("/beheer/parameter-sets");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-black">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Beheer Parametersets (Blauwdrukken)</h1>
        <p className="text-sm text-gray-500">
          Maak hier de formulieren (sets van parameters) aan die inspecteurs straks gaan invullen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* LINKER KOLOM: Snel aanmaken */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 text-base">Nieuwe Set Toevoegen</h2>
          <form action={handleCreate} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Naam set</label>
              <input 
                type="text" 
                name="naam" 
                placeholder="bijv. Inspectie Brandveiligheid v1"
                required 
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Toelichting (optioneel)</label>
              <textarea 
                name="toelichting" 
                placeholder="Waar is dit formulier voor bedoeld?"
                rows={3}
                className="p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Set Aanmaken
            </button>
          </form>
        </div>

        {/* RECHTER KOLOM: Overzichtstabel (Desktop breedte) */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Naam parameterset</th>
                <th className="p-4">Toelichting</th>
                <th className="p-4 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {sets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 italic">
                    Nog geen parametersets aangemaakt. Maak links je eerste set aan.
                  </td>
                </tr>
              ) : (
                sets.map((set) => (
                  <tr key={set.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-950">{set.naam}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{set.toelichting || "—"}</td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/beheer/parameter-sets/${set.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-md text-xs font-medium border border-gray-200 hover:border-blue-200 transition-all"
                      >
                        Beheer Regels →
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