// \dikis\app\inspectie\[groepId]\FormulierEngineClient.tsx

"use client";

import { useState } from "react";
import { slaMetingenOp } from "../actions";

interface Veld {
  parameterId: string;
  label: string | null;
  paramNaam: string | null; // GEWIJZIGD: Mag null zijn vanwege leftJoin
  paramType: "boolean" | "numeriek" | "tekst" | "tekstveld" | "keuzelijst" | null; // GEWIJZIGD: Matcht exact je schema enum + null
  verplicht: boolean;
}

interface ObjectItem {
  id: string;
  type: string;
  naam: string;
}

export default function FormulierEngineClient({
  groepId,
  velden,
  objecten,
  historie,
}: {
  groepId: string;
  velden: Veld[];
  objecten: ObjectItem[];
  historie: any[]; // Bevat eerdere metingen
}) {
  const [geselecteerdObject, setGeselecteerdObject] = useState<ObjectItem | null>(null);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Haal de allerlaatste waarde op voor een specifieke parameter bij het actieve object
  function getLaatsteWaarde(paramId: string) {
    if (!geselecteerdObject) return null;
    const match = historie.find(
      (h) => h.objectId === geselecteerdObject.id && h.parameterId === paramId
    );
    return match ? match.waarde : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!geselecteerdObject) return;

    setIsSaving(true);
    setStatusMessage("Bezig met opslaan in Turso...");

    const res = await slaMetingenOp(groepId, geselecteerdObject.id, geselecteerdObject.type, formState);

    setIsSaving(false);
    if (res.success) {
      setStatusMessage("✅ Metingen succesvol opgeslagen!");
      setFormState({}); // Wis formulier voor volgende ronde
      setTimeout(() => setStatusMessage(""), 3000);
    } else {
      setStatusMessage("❌ Er ging iets mis bij het opslaan.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-black">
      
      {/* LINKER KOLOM: Objectenkiezer */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Kies Object voor Inspectie</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {objecten.map((obj) => (
            <button
              key={obj.id}
              onClick={() => {
                setGeselecteerdObject(obj);
                setFormState({});
                setStatusMessage("");
              }}
              className={`w-full p-4 text-left font-medium transition-all flex justify-between items-center ${
                geselecteerdObject?.id === obj.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-50 text-gray-900"
              }`}
            >
              <div>
                <div className="text-base">{obj.naam}</div>
                <div className={`text-xs uppercase font-semibold ${geselecteerdObject?.id === obj.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {obj.type === "personen" ? "👤 Persoon" : "🏢 Gebouw"}
                </div>
              </div>
              <span className="text-lg">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* RECHTER TWEE KOLOMMEN: Het Dynamische Formulier */}
      <div className="md:col-span-2">
        {!geselecteerdObject ? (
          <div className="p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 italic">
            Selecteer links een persoon of gebouw om de metingen en kenmerken te openen.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Formulier Kop */}
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Meting invoeren</h3>
                <p className="text-xs text-gray-500">Object: <span className="font-semibold text-gray-800">{geselecteerdObject.naam}</span></p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                {geselecteerdObject.type}
              </span>
            </div>

            {/* De Dynamische Velden-lus */}
            <div className="space-y-4">
              {velden.map((veld) => {
                const weergaveNaam = veld.label || veld.paramNaam || "Naamloze parameter";
                const laatsteWaarde = getLaatsteWaarde(veld.parameterId);

                return (
                  <div key={veld.parameterId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                    
                    {/* Veldlabel & Historie indicator */}
                    <div className="sm:w-1/3">
                      <label className="block text-sm font-semibold text-gray-800">
                        {weergaveNaam} {veld.verplicht && <span className="text-red-500">*</span>}
                      </label>
                      {laatsteWaarde && (
                        <span className="block text-xs text-gray-400 mt-0.5 italic">
                          Laatst: {laatsteWaarde}
                        </span>
                      )}
                    </div>

                    {/* Veld Input op basis van parametertype */}
                    <div className="flex-1">
                      {veld.paramType === "boolean" ? (
                        <select
                          value={formState[veld.parameterId] || ""}
                          onChange={(e) => setFormState({ ...formState, [veld.parameterId]: e.target.value })}
                          required={veld.verplicht}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm outline-none"
                        >
                          <option value="">-- Maak keuze --</option>
                          <option value="Ja">Ja / Goedgekeurd</option>
                          <option value="Nee">Nee / Afgekeurd</option>
                        </select>
                      ) : veld.paramType === "tekstveld" ? (
                        <textarea
                          value={formState[veld.parameterId] || ""}
                          onChange={(e) => setFormState({ ...formState, [veld.parameterId]: e.target.value })}
                          required={veld.verplicht}
                          rows={2}
                          placeholder="Typ toelichting..."
                          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm outline-none"
                        />
                      ) : (
                        // Standaard invoer voor numeriek of gewone tekst
                        <input
                          type={veld.paramType === "numeriek" ? "number" : "text"}
                          step="any"
                          value={formState[veld.parameterId] || ""}
                          onChange={(e) => setFormState({ ...formState, [veld.parameterId]: e.target.value })}
                          required={veld.verplicht}
                          placeholder={veld.paramType === "numeriek" ? "0.00" : "Typ waarde..."}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm outline-none"
                        />
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Statusberichten & Verzendknop */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-blue-700">{statusMessage}</span>
              <button
                type="submit"
                disabled={isSaving || velden.length === 0}
                className="px-5 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-sm"
              >
                {isSaving ? "Opslaan..." : "Meting Opslaan"}
              </button>
            </div>

          </form>
        )}
      </div>

    </div>
  );
}