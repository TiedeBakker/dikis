import { getGroepMetObjecten, getBeschikbareStamgegevens, voegObjectToeAanGroep, verwijderObjectUitGroep } from "../actions";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function GroepDetailBeheerPage({
    params
}: {
    params: Promise<{ groepId: string }> | { groepId: string }
}) {
    const resolvedParams = await params;
    const groepId = resolvedParams.groepId;

    const data = await getGroepMetObjecten(groepId);
    const { allePersonen, alleGebouwen } = await getBeschikbareStamgegevens();

    if (!data) {
        return <div className="p-8 text-black">Groep met ID {groepId} niet gevonden.</div>;
    }

    const { groepInfo, gekoppeldeObjecten } = data;

    // Filter uit de dropdowns wat al gekoppeld is
    const bestaandeObjectIds = gekoppeldeObjecten.map((o) => o.objectId);
    const beschikbarePersonen = allePersonen.filter((p) => !bestaandeObjectIds.includes(p.id));
    const beschikbareGebouwen = alleGebouwen.filter((g) => !bestaandeObjectIds.includes(g.id));

    // Server Action voor het afhandelen van toevoegingen
    async function handleAddObject(formData: FormData) {
        "use server";
        const gekozenType = formData.get("objectType") as string; // "personen" of "gebouwen"
        const objectId = formData.get("objectId") as string;

        if (!gekozenType || !objectId) return;

        await voegObjectToeAanGroep(groepId, gekozenType, objectId);
        revalidatePath(`/beheer/groepen/${groepId}`);
    }

    return (
        <div className="p-8 max-w-6xl mx-auto text-black">

            {/* Terug Knop */}
            <div className="mb-6">
                <Link href="/beheer/groepen" className="text-sm text-blue-600 hover:underline">
                    ← Terug naar alle groepen
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Groep beheren: {groepInfo.naam}</h1>
                {groepInfo.toelichting && <p className="text-sm text-gray-500 mt-1">{groepInfo.toelichting}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

                {/* LINKER/MIDDENST KOLOM: Gekoppelde objecten tabel */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-4">Type</th>
                                <th className="p-4">Naam / Adres Object</th>
                                <th className="p-4 text-right">Actie</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {gekoppeldeObjecten.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-12 text-center text-gray-400 italic">
                                        Deze groep bevat nog geen personen of gebouwen. Voeg ze rechts toe.
                                    </td>
                                </tr>
                            ) : (
                                gekoppeldeObjecten.map((obj) => (
                                    <tr key={obj.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase border ${obj.objectType === 'personen'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {obj.objectType === 'personen' ? 'Persoon' : 'Gebouw'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-950">{obj.weergaveNaam}</td>
                                        <td className="p-4 text-right">
                                            {/* GEWIJZIGD: We wikkelen de knop in een form met een inline Server Action op formAction */}
                                            <form>
                                                <button
                                                    formAction={async () => {
                                                        "use server";
                                                        await verwijderObjectUitGroep(obj.id, groepId);
                                                    }}
                                                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 transition-colors"
                                                >
                                                    Ontkoppel
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* RECHTER ZIJBALK: Objecten Toevoegen */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">

                    {/* TOEVOEGEN PERSONEN */}
                    <div className="space-y-3">
                        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Persoon Toevoegen</h2>
                        {beschikbarePersonen.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Geen personen beschikbaar.</p>
                        ) : (
                            <form action={handleAddObject} className="space-y-2">
                                <input type="hidden" name="objectType" value="personen" />
                                <select name="objectId" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none">
                                    <option value="">-- Kies persoon --</option>
                                    {beschikbarePersonen.map((p) => (
                                        <option key={p.id} value={p.id}>{p.naam}</option>
                                    ))}
                                </select>
                                <button type="submit" className="w-full bg-gray-800 text-white font-medium py-1.5 rounded-lg text-xs hover:bg-gray-900 transition-colors">
                                    Koppel Persoon
                                </button>
                            </form>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* TOEVOEGEN GEBOUWEN */}
                    <div className="space-y-3">
                        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Gebouw Toevoegen</h2>
                        {beschikbareGebouwen.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Geen gebouwen beschikbaar.</p>
                        ) : (
                            <form action={handleAddObject} className="space-y-2">
                                <input type="hidden" name="objectType" value="gebouwen" />
                                <select name="objectId" required className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-none">
                                    <option value="">-- Kies gebouw --</option>
                                    {beschikbareGebouwen.map((g) => (
                                        <option key={g.id} value={g.id}>{g.naam}</option>
                                    ))}
                                </select>
                                <button type="submit" className="w-full bg-gray-800 text-white font-medium py-1.5 rounded-lg text-xs hover:bg-gray-900 transition-colors">
                                    Koppel Gebouw
                                </button>
                            </form>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}