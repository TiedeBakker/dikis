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
    return (
      <div className="p-8 max-w-4xl mx-auto text-black text-center mt-12 bg-red-50 rounded-xl border border-red-200">
        <p className="font-semibold">Parameterset met ID {setId} niet gevonden.</p>
        <Link href="/beheer/parameter-sets" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          &larr; Terug naar het overzicht
        </Link>
      </div>
    );
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
    // Brede container (max-w-7xl) voor een rustig, modern dashboard-gevoel
    <div className="p-8 max-w-7xl mx-auto text-black">
      
      {/* Elegante Broodkruimel / Navigatie */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/beheer/parameter-sets" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm"
        >
          ← Terug naar alle parametersets
        </Link>
      </div>

      {/* Header sectie */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Formulier configureren</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Blauwdruk</span>
          <span className="text-base font-medium text-gray-700">{setInfo.naam}</span>
        </div>
        {setInfo.toelichting && (
          <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
            {setInfo.toelichting}
          </p>
        )}
      </div>

      {/* Verdeling over 12 kolommen: 9 voor de tabel, 3 voor de actie-zijbalk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LINKER / MIDDENST KOLOM (9 van de 12 kolommen) - Alle ruimte voor de editor */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-3.5 text-center w-20">Volgorde</th>
                <th className="p-3.5">Parameter (Basis)</th>
                <th className="p-3.5">Weergave Label op formulier (Override)</th>
                <th className="p-3.5 text-center w-24">Verplicht</th>
                <th className="p-3.5 text-right w-24">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {regels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400 italic bg-gray-50/50">
                    Dit formulier is nog leeg. Voeg in de zijbalk parameters toe om velden te maken.
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

        {/* RECHTER ZIJBALK (3 van de 12 kolommen) - Compact en gefocust */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 sticky top-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">➕</span>
            <h2 className="font-bold text-gray-800 text-base">Veld Toevoegen</h2>
          </div>
          
          {beschikbareParameters.length === 0 ? (
            <p className="text-xs text-gray-500 italic bg-amber-50 text-amber-800 border border-amber-100 p-3 rounded-lg">
              Alle beschikbare parameters uit de database zijn al aan dit formulier toegevoegd.
            </p>
          ) : (
            <form action={handleVoegToe} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Kies een basisparameter
                </label>
                <select 
                  name="parameterId" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm font-semibold"
              >
                Voeg toe aan formulier
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Staat een parameter hier niet tussen? Ga naar het dashboard en voeg hem eerst toe aan de centrale <Link href="/beheer/stamgegevens" className="text-blue-600 hover:underline">Stamgegevens</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}