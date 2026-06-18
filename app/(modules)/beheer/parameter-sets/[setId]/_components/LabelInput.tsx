"use client";

import React from "react";

interface LabelInputProps {
  regelId: string;
  initialLabel: string;
  placeholder: string;
  updateAction: (regelId: string, data: { label: string }) => Promise<any>;
}

export default function LabelInput({ regelId, initialLabel, placeholder, updateAction }: LabelInputProps) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        name="label"
        defaultValue={initialLabel}
        placeholder={placeholder}
        onBlur={async (e) => {
          const nieuwLabel = e.target.value;
          if (nieuwLabel !== initialLabel) {
            await updateAction(regelId, { label: nieuwLabel });
          }
        }}
        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white rounded px-2 py-1 transition-all outline-none"
      />
    </form>
  );
}