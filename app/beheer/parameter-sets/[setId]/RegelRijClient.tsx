"use client";

import { useState } from "react";
import { updateSetRegel, verwijderRegelUitSet } from "../actions";

export default function RegelRijClient({ regel, setId }: { regel: any; setId: string }) {
  const [label, setLabel] = useState(regel.label || "");
  const [verplicht, setVerplicht] = useState(regel.verplicht);
  const [volgnr, setVolgnr] = useState(regel.volgnr);
  const [isSaving, setIsSaving] = useState(false);

  async function handleBlurOfChange(updates: { label?: string; verplicht?: boolean; volgnr?: number }) {
    setIsSaving(true);
    await updateSetRegel(regel.id, updates);
    setIsSaving(false);
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors text-black">
      {/* Volgnummer */}
      <td className="p-3 w-20">
        <input
          type="number"
          value={volgnr}
          onChange={(e) => {
            const v = parseInt(e.target.value) || 0;
            setVolgnr(v);
          }}
          onBlur={() => handleBlurOfChange({ volgnr })}
          className="w-14 p-1 border border-gray-300 rounded text-center text-sm"
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
          onBlur={() => handleBlurOfChange({ label })}
          className="w-full p-1.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white outline-none"
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
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
          className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 transition-colors"
        >
          Verwijder
        </button>
      </td>
    </tr>
  );
}