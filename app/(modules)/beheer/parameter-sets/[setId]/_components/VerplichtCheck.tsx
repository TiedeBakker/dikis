"use client";

import React from "react";

interface VerplichtCheckProps {
  regelId: string;
  initialVerplicht: boolean;
  updateAction: (regelId: string, data: { verplicht: boolean }) => Promise<any>;
}

export default function VerplichtCheck({ regelId, initialVerplicht, updateAction }: VerplichtCheckProps) {
  return (
    <input
      type="checkbox"
      defaultChecked={initialVerplicht}
      onChange={async (e) => {
        await updateAction(regelId, { verplicht: e.target.checked });
      }}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
    />
  );
}