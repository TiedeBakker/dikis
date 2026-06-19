

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BeheerModuleLayout({
  children,
  submenu, // Vangt het slot op dat hieronder gedefinieerd staat
}: {
  children: React.ReactNode;
  submenu: React.ReactNode;
}) {
  const pathname = usePathname() || "";

 return (
    <div className="w-full flex flex-col -mt-8 -mx-8"> 
      {/* -mt-8 heft de padding van <main> op, waardoor de grijze balk strak aansluit! */}
      
      {/* De grijze subbalk verschijnt ALLEEN als de actieve module vulling geeft */}
      {submenu && (
        <div className="bg-gray-100 border-b border-gray-200 px-8 py-2 flex items-center shadow-sm empty:hidden">
          {submenu}
        </div>
      )}

      {/* De werkelijke pagina content (groepen, parameter-sets, etc.) krijgt weer netjes zijn ademruimte */}
      <div className="p-8 w-full">
        {children}
      </div>
    </div>
  );
}