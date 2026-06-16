import { getParameterSetMetRegels, getAlleParameters, voegParameterToeAanSet } from "../actions";
import RegelRijClient from "./RegelRijClient";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SetDetailBeheerPage({ 
  params 
}: { 
  params: Promise<{ setId: string }> | { setId: string } 
}) {
  // Zorg dat we de parameters gegarandeerd correct hebben uitgepakt
  const resolvedParams = await params;
  const setId = resolvedParams.setId;

  const data = await getParameterSetMetRegels(setId);
  const alleParameters = await getAlleParameters();

  if (!data) {
    return <div className="p-8 text-black">Parameterset met ID {setId} niet gevonden.</div>;
  }

  const { setInfo, regels } = data;

  // Filter parameters die al in de lijst staan, zodat je ze niet dubbel toevoegt
  const bestaandeParamIds = regels.map((r) => r.parameterId);
  const beschikbareParameters = alleParameters.filter((p) => !bestaandeParamIds.includes(p.id));

  // Server action voor het toevoegen van een geselecteerde parameter
  async function handleVoegToe(formData: FormData) {
    "use server";
    const parameterId = formData.get("parameterId") as string;
    if (!parameterId) return;

    await voegParameterToeAanSet(setId, parameterId);
    revalidatePath(`/beheer/parameter-sets/${setId}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto text-black">
      
      {/* Broodkruimel / Terug knop */}
      <div className="mb-6">
        <Link href="/beheer/parameter-sets" className="text-sm text-blue-600 hover:underline">
          ← Terug naar alle parametersets
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Formulier configureren: {setInfo.naam}</h1>
        {setInfo.toelichting && <p className="text-sm text-gray-500 mt-1">{setInfo.toelichting}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LINKER / MIDDENST KOLOM: De Formulier Regels Editor */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-3 text-center w-20">Volgorde</th>
                <th className="p-3">Parameter (Basis)</th>
                <th className="p-3">Weergave Label op formulier (Override)</th>
                <th className="p-3 text-center w-24">Verplicht</th>
                <th className="p-3 text-right w-24">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {regels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                    Dit formulier is nog leeg. Voeg rechts parameters toe om velden te maken.
                  </td>
                </tr>
              ) : (
                regels.map((regel) => (
                  <RegelRijClient key={regel.id} regel={regel} setId={setId} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RECHTER ZIJBALK: Snel Parameters Toevoegen */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800 text-base">Parameter Toevoegen</h2>
          
          {beschikbareParameters.length === 0 ? (
            <p className="text-xs text-gray-500 italic">
              Alle beschikbare parameters uit de database zitten al in dit formulier.
            </p>
          ) : (
            <form action={handleVoegToe} className="space-y-3">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Kies een parameter
                </label>
                <select 
                  name="parameterId" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                >
                  <option value="">-- Selecteer parameter --</option>
                  {beschikbareParameters.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.naam} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Voeg toe aan formulier
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Staat een parameter er niet bij? Maak deze dan eerst aan in de algemene parameter-stamgegevens omgeving.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}