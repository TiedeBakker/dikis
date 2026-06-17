import React from "react";
import Link from "next/link";
import { db } from "@/db"; // Pas eventueel aan naar jouw exacte db-pad
import { beheerMetadata } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function StamgegevensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We halen hier de unieke tabellen op, specifiek voor het sub-menu van de stamgegevens
  const menuItems = await db
    .select({
      tabelNaam: beheerMetadata.tabelNaam,
      tabelLabel: beheerMetadata.tabelLabel,
    })
    .from(beheerMetadata)
    .orderBy(asc(beheerMetadata.volgnummer));

  // Filter unieke tabellen (jouw exacte logica behouden!)
  const uniekeMenuItems = Array.from(
    new Map(menuItems.map((item) => [item.tabelNaam, item])).values()
  );

  return (
    <div className="flex h-full items-start -m-8">
      
      {/* DE TWEEDE KOLOM: Alleen zichtbaar bij stamgegevens. 
          Hier leeft jouw dynamische lijst met moedertabellen nu in alle rust! */}
      <div className="w-64 h-[calc(100vh-57px)] bg-white border-r border-gray-200 p-6 shrink-0 space-y-6 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Moedertabellen
          </p>
          <div className="space-y-1 text-sm">
            {uniekeMenuItems.map((item) => (
              <Link
                key={item.tabelNaam}
                href={`/beheer/${item.tabelNaam}`}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2.5 group-hover:bg-blue-500 transition-colors"></span>
                {item.tabelLabel}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* De specifieke tabel / invoerdata van de geselecteerde moedertabel */}
      <div className="flex-1 p-8 h-[calc(100vh-57px)] overflow-y-auto">
        {children}
      </div>

    </div>
  );
}