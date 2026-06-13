import React from "react";
import Link from "next/link";
import { db } from "../../db"; // Pas aan naar jouw db-pad
import { beheerMetadata } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function BeheerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Haal de unieke tabellen op uit de metadata voor het menu
  // We groeperen ze even in de query of unificeren ze om duplicaten te voorkomen
  const menuItems = await db
    .select({
      tabelNaam: beheerMetadata.tabelNaam,
      tabelLabel: beheerMetadata.tabelLabel,
    })
    .from(beheerMetadata)
    .orderBy(asc(beheerMetadata.volgnummer));

  // Filter unieke tabellen voor de sidebar-links
  const uniekeMenuItems = Array.from(
    new Map(menuItems.map((item) => [item.tabelNaam, item])).values()
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* 1. MOBIELE BLOKKADE (Zichtbaar op mobiel, verborgen op PC) */}
      <div className="block lg:hidden p-8 text-center max-w-md mx-auto mt-20">
        <div className="text-4xl mb-4">🖥️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Beheermodule niet beschikbaar</h1>
        <p className="text-sm text-gray-600">
          Om de stamdata nauwkeurig te kunnen beheren is een groter scherm (desktop of landscape-tablet) vereist. Schakel over naar een pc.
        </p>
      </div>

      {/* 2. DESKTOP LAYOUT (Verborgen op mobiel, flexbox op PC vanaf 1024px) */}
      <div className="hidden lg:flex min-h-screen">
        
        {/* VASTE SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="font-bold text-white text-sm tracking-wide uppercase">Dikis Core</h2>
              <p className="text-xs text-slate-500">Centraal Data Beheer</p>
            </div>
          </div>

          {/* Navigatie (Dynamisch geladen) */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Moedertabellen
            </p>
            {uniekeMenuItems.map((item) => (
              <Link
                key={item.tabelNaam}
                href={`/beheer/${item.tabelNaam}`}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors group"
              >
                <span className="w-2 h-2 rounded-full bg-slate-600 mr-3 group-hover:bg-blue-400 transition-colors"></span>
                {item.tabelLabel}
              </Link>
            ))}
          </nav>

          {/* Footer van de sidebar */}
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>Omgeving: Desktop</span>
            <Link href="/" className="text-blue-400 hover:underline">Naar App</Link>
          </div>
        </aside>

        {/* RECHTER CONTENT GEBIED */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <header className="bg-white border-b border-gray-200 py-4 px-8 sticky top-0 z-10 flex justify-between items-center shadow-sm">
            <h1 className="text-sm font-medium text-gray-500">
              Beheermodule &raquo; Aanpassen stamgegevens
            </h1>
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2.5 py-0.5 rounded-full">
              Live databaseverbinding
            </span>
          </header>

          {/* Hier vallen de specifieke categorie-pagina's binnen */}
          <div className="p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}