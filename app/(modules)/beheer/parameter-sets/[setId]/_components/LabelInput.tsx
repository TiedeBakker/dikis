"use client";

import React from "react";

interface LabelInputProps {
  regelId: string;
  initialLabel: string;
  placeholder: string;
  updateAction: (regelId: string, data: { label: string }) => Promise<any>;
}

export default function LabelInput({ regelId, initialLabel, placeholder, updateAction }: LabelInputProps) {
  const handleSave = async (waarde: string) => {
    if (waarde !== initialLabel) {
      await updateAction(regelId, { label: waarde });
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("label") as HTMLInputElement;
        await handleSave(input.value);
        input.blur();
      }}
    >
      <input
        type="text"
        name="label"
        defaultValue={initialLabel}
        placeholder={placeholder}
        onBlur={(e) => handleSave(e.target.value)}
        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white rounded px-2 py-1 transition-all outline-none"
      />
    </form>
  );
}