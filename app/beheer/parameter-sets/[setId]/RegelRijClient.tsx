"use client";

import { useState, useEffect } from "react";
import { updateSetRegel, verwijderRegelUitSet } from "../actions";

export default function RegelRijClient({ regel, setId }: { regel: any; setId: string }) {
  const [label, setLabel] = useState(regel.label || "");
  const [verplicht, setVerplicht] = useState(regel.verplicht);
  const [volgnr, setVolgnr] = useState(regel.volgnr);
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniseer lokale velden als de server de volgorde husselt
  useEffect(() => {
    setLabel(regel.label || "");
    setVerplicht(regel.verplicht);
    setVolgnr(regel.volgnr);
  }, [regel.label, regel.verplicht, regel.volgnr]);

  async function handleBlurOfChange(updates: { label?: string; verplicht?: boolean; volgnr?: number }) {
    // 💡 FRONTEND LOG: Kijk in je BROWSER console (F12) wat hij verstuurt
    console.log("-> Client stuurt update naar server:", updates);

    setIsSaving(true);
    await updateSetRegel(regel.id, updates);
    setIsSaving(false);
  }

  return (
    <tr className={`transition-colors text-black ${isSaving ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'}`}>

      {/* Volgnummer zonder pijltjes */}
      <td className="p-3 w-20">
        <input
          type="text"
          inputMode="numeric" // Zorgt voor een numeriek toetsenbord op tablets/smartphones
          pattern="[0-8]*"    // Extra indicatie voor browsers dat alleen nummers horen
          value={volgnr}
          onChange={(e) => {
            // Laat Alleen cijfers toe. Als de gebruiker letters typt, worden ze direct genegeerd.
            const alleenCijfers = e.target.value.replace(/\D/g, "");
            setVolgnr(alleenCijfers === "" ? 0 : parseInt(alleenCijfers));
          }}
          onBlur={(e) => {
            const actueleWaarde = parseInt(e.target.value) || 0;
            handleBlurOfChange({ volgnr: actueleWaarde });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur(); // Forceert opslaan en her-sorteren
            }
          }}
          disabled={isSaving}
          className="w-14 p-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100 font-mono"
        />
      </td>

      {/* Systeembasisnaam */}
      <td className="p-3">
        <div className="font-medium text-gray-950">{regel.parameterNaam}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">{regel.parameterType}</div>
      </td>

      {/* Formulier Label Override */}
      <td className="p-3">
        <input
          type="text"
          value={label}
          placeholder={regel.parameterNaam}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={(e) => handleBlurOfChange({ label: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          disabled={isSaving}
          className="w-full p-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white outline-none disabled:bg-gray-100"
        />
      </td>

      {/* Verplicht Vinkje */}
      <td className="p-3 text-center">
        <input
          type="checkbox"
          checked={verplicht}
          onChange={(e) => {
            const v = e.target.checked;
            setVerplicht(v);
            handleBlurOfChange({ verplicht: v });
          }}
          disabled={isSaving}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
        />
      </td>

      {/* Acties (Verwijderen) */}
      <td className="p-3 text-right">
        <button
          onClick={async () => {
            if (confirm(`Weet je zeker dat je ${regel.parameterNaam} uit deze set wilt verwijderen?`)) {
              await verwijderRegelUitSet(regel.id, setId);
            }
          }}
          disabled={isSaving}
          className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          Verwijder
        </button>
      </td>
    </tr>
  );
}