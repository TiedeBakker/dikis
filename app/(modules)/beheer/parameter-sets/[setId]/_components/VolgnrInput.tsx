"use client";

import React from "react";

interface VolgnrInputProps {
  regelId: string;
  initialVolgnr: number;
  updateAction: (regelId: string, data: { volgnr: number }) => Promise<any>;
}

export default function VolgnrInput({ regelId, initialVolgnr, updateAction }: VolgnrInputProps) {
  const handleSave = async (waarde: string) => {
    const nieuwVolgnr = parseInt(waarde, 10);
    if (!isNaN(nieuwVolgnr) && nieuwVolgnr !== initialVolgnr) {
      await updateAction(regelId, { volgnr: nieuwVolgnr });
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("volgnr") as HTMLInputElement;
        await handleSave(input.value);
        input.blur(); // Haal focus weg na enter
      }}
    >
      <input
        type="text"
        name="volgnr"
        pattern="[0-9]*"
        defaultValue={initialVolgnr}
        onBlur={(e) => handleSave(e.target.value)}
        className="w-10 text-center bg-gray-50 border border-gray-200 rounded p-1 font-mono font-bold text-gray-700 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
      />
    </form>
  );
}