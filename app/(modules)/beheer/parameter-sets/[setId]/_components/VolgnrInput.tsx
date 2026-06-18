"use client";

import React from "react";

interface VolgnrInputProps {
  regelId: string;
  initialVolgnr: number;
  // We geven de server action als prop mee!
  updateAction: (regelId: string, data: { volgnr: number }) => Promise<any>;
}

export default function VolgnrInput({ regelId, initialVolgnr, updateAction }: VolgnrInputProps) {
  return (
    <form
      className="flex items-center justify-center gap-1"
      onSubmit={(e) => e.preventDefault()} // Voorkom pagina-reload bij Enter
    >
      <input
        type="text"
        name="volgnr"
        pattern="[0-9]*"
        defaultValue={initialVolgnr}
        onBlur={async (e) => {
          const nieuwVolgnr = parseInt(e.target.value, 10);
          if (!isNaN(nieuwVolgnr) && nieuwVolgnr !== initialVolgnr) {
            await updateAction(regelId, { volgnr: nieuwVolgnr });
          }
        }}
        className="w-10 text-center bg-gray-50 border border-gray-200 rounded p-1 font-mono font-bold text-gray-700 focus:bg-white focus:border-blue-500 outline-none transition-all text-xs"
      />
    </form>
  );
}