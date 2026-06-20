import { db } from "@/db";
import { beheerMetadata } from "@/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StartStamgegevensPage() {
  // Haal de unieke tabelnamen en labels op door te groeperen op tabel_naam
  // We pakken het minimale volgnummer om de volgorde van de tabellen zelf te kunnen sturen
  const uniekeTabellen = await db
    .select({
      tabelNaam: beheerMetadata.tabelNaam,
      tabelLabel: beheerMetadata.tabelLabel,
      minVolgnummer: sql<number>`MIN(${beheerMetadata.volgnummer})`,
    })
    .from(beheerMetadata)
    .groupBy(beheerMetadata.tabelNaam, beheerMetadata.tabelLabel)
    .orderBy(sql`MIN(${beheerMetadata.volgnummer})`);

  if (uniekeTabellen.length === 0) {
    return (
      <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-black space-y-4">
        <div className="text-3xl">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900">Geen metadata gevonden</h1>
        <hr className="border-gray-100" />
        <p className="text-sm text-gray-600">
          Er zijn momenteel geen velddefinities geconfigureerd in de tabel <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-pink-600">beheer_metadata</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-black space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Brontabellen Beheren (Stamgegevens)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kies een tabel om data te bekijken, te wijzigen of nieuwe rijen toe te voegen op basis van de database-metadata.
        </p>
      </div>

      <hr className="border-gray-100" />

      {/* Grid van unieke brontabellen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniekeTabellen.map((tabel) => (
          <Link
            key={tabel.tabelNaam}
            href={`/beheer/stamgegevens/${tabel.tabelNaam}`}
            className="p-5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all group flex flex-col justify-between text-left shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {tabel.tabelLabel} {/* Bijv. "Personen" of "Gebouwen" */}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-500 font-mono px-2 py-0.5 rounded border border-gray-200">
                  {tabel.tabelNaam} {/* Bijv. "personen" of "gebouwen" */}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Dynamisch gegenereerd formulier & tabeloverzicht.
              </p>
            </div>
            <div className="text-xs text-purple-600 font-semibold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Gegevens beheren &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}