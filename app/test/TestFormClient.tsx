// \dikis\app\test\TestFormClient.tsx

"use client";

import { useState, useEffect } from "react"; // VOEG useEffect TOE
import { saveMetingenSessie, getLaatsteWaarde, type IngevuldeMeting } from "./actions";

export default function TestFormClient({
    velden,
    objectId,
    objectType
}: {
    velden: any[];
    objectId: string;
    objectType: string;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    // NIEUW: State om de historische waarden in op te slaan
    // Sleutel is parameterId, waarde is de tekstwaarde uit de DB
    // We slaan nu per parameterId een object op met waarde en datumTijd
    const [historie, setHistorie] = useState<Record<string, { waarde: string; datumTijd: string }>>({});
    const [loadingHistorie, setLoadingHistorie] = useState(false);
    // NIEUW: Zodra het objectId verandert, halen we de historie op uit Turso
    useEffect(() => {
        async function laadHistorie() {
            setLoadingHistorie(true);
            const nieuweHistorie: Record<string, { waarde: string; datumTijd: string }> = {};

            for (const veld of velden) {
                const result = await getLaatsteWaarde(objectId, veld.parameterId);
                if (result !== null) {
                    nieuweHistorie[veld.parameterId] = result;
                }
            }

            setHistorie(nieuweHistorie);
            setLoadingHistorie(false);
        }

        laadHistorie();
    }, [objectId, velden]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);

        const verzameldeMetingen: IngevuldeMeting[] = velden.map((veld) => ({
            parameterId: veld.parameterId,
            waarde: formData.get(veld.parameterId) as string,
        })).filter(m => m.waarde !== null && m.waarde !== "");

        const result = await saveMetingenSessie(objectId, objectType, verzameldeMetingen);

        if (result.success) {
            setStatus(`Opgeslagen voor ${objectId}! Sessie: ${result.sessieId}`);

            const geupdateHistorie = { ...historie };
            const nuIsoString = new Date().toISOString(); // Of formatteer hoe je wilt

            verzameldeMetingen.forEach(m => {
                geupdateHistorie[m.parameterId] = { waarde: m.waarde, datumTijd: nuIsoString };
            });
            setHistorie(geupdateHistorie);
        } else {
            setStatus("Er is iets misgegaan bij het opslaan.");
        }

        setIsSaving(false);
    }

    if (loadingHistorie) {
        return <div className="text-gray-400 text-sm">Vorige metingen ophalen uit Turso...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6 text-black">
            {status && (
                <div className={`p-3 rounded-md text-sm ${status.includes("Opgeslagen") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {status}
                </div>
            )}

            {velden.map((veld) => {
                const displayNaam = veld.naam || veld.standaardNaam;

                // Haal de historische data op
                const historieItem = historie[veld.parameterId];
                const huidigeWaarde = historieItem ? historieItem.waarde : "";
                const datumTijdText = historieItem
                    ? new Date(historieItem.datumTijd).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })
                    : "";

                return (
                    <div key={veld.regelId} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700">
                                {displayNaam} {veld.verplicht && <span className="text-red-500">*</span>}
                            </label>

                            {/* GEWIJZIGD: Toon nu ook de geformatteerde datum/tijd erbij! */}
                            {huidigeWaarde && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                    Laatste waarde: <strong>{huidigeWaarde}</strong> ({datumTijdText})
                                </span>
                            )}
                        </div>

                        {/* We gebruiken defaultValue zodat de gebruiker de historische waarde direct kan aanpassen (Delta's!) */}
                        {veld.type === "numeriek" && (
                            <input
                                type="number"
                                step="any"
                                name={veld.parameterId}
                                defaultValue={huidigeWaarde}
                                required={veld.verplicht}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                        )}

                        {veld.type === "tekstveld" && (
                            <textarea
                                rows={3}
                                name={veld.parameterId}
                                defaultValue={huidigeWaarde}
                                required={veld.verplicht}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                        )}

                        {veld.type === "keuzelijst" && (
                            <select
                                name={veld.parameterId}
                                defaultValue={huidigeWaarde}
                                required={veld.verplicht}
                                className="p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">-- Maak een keuze --</option>
                                {veld.opties.map((optie: { id: string; waarde: string }) => (
                                    <option key={optie.id} value={optie.waarde}>{optie.waarde}</option>
                                ))}
                            </select>
                        )}
                    </div>
                );
            })}

            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                {isSaving ? "Aan het opslaan..." : "Meting Opslaan"}
            </button>
        </form>
    );
}