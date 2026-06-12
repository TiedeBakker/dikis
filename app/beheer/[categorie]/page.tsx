import { db } from "@/db";
import { getBeheerConfig } from "../../lib/beheer"; 
import { notFound } from "next/navigation";
import * as schema from "@/db/schema";
import { opslaanRecord, bijwerkenRecord } from "./actions"; // NIEUW: Importeer ook bijwerkenRecord
import Link from "next/link"; // NIEUW: Voor de bewerk/annuleer knoppen

interface BeheerVeld {
  id: string;
  label: string;
  type: string;
  verplicht: boolean | null;
}

export default async function BeheerCategoriePage({ 
  params,
  searchParams // NIEUW: searchParams opvangen
}: { 
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ edit?: string }>; // NIEUW
}) {
 const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categorieNaam = resolvedParams.categorie;
  
  // FIX 1: Niet meer parsen naar een nummer, bewaar de UUID als string
  const editId = resolvedSearchParams.edit || null;

  const config = await getBeheerConfig(categorieNaam);
  if (!config) notFound();

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) notFound();
  
  const records = await db.select().from(targetTable);

  // FIX 2: Veilig vergelijken door beide ID's naar een String om te zetten
  const huidigRecord = editId ? records.find((r: any) => String(r.id) === String(editId)) : null;

  // Dynamisch de juiste Server Action kiezen en voorbereiden (binden)
  const formAction = huidigRecord && editId
    ? bijwerkenRecord.bind(null, categorieNaam, editId)
    : opslaanRecord.bind(null, categorieNaam);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* SECTIE 1: Het dynamische formulier (Toevoegen óf Bewerken) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {huidigRecord ? `${config.tabelLabel} bijwerken` : `Beheer ${config.tabelLabel}`}
        </h1>
        
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.velden.map((v: BeheerVeld) => (
              <div key={v.id} className={v.id === 'toelichting' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {v.label} {!v.verplicht && <span className="text-gray-400 text-xs">(optioneel)</span>}
                </label>
                <input 
                  name={v.id} 
                  type={v.type} 
                  // NIEUW: Als we editen, vullen we de bestaande waarde in als standaardwaarde
                  defaultValue={huidigRecord ? huidigRecord[v.id] ?? "" : ""}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" 
                  required={v.verplicht || false} 
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            {/* NIEUW: Annuleerknop tonen als we in edit-modus zijn */}
            {huidigRecord && (
              <Link 
                href={`/beheer/${categorieNaam}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuleren
              </Link>
            )}
            <button type="submit" className="px-6 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
              {huidigRecord ? "Bijwerken" : "Toevoegen"}
            </button>
          </div>
        </form>
      </div>

      <hr className="border-gray-200" />

      {/* SECTIE 2: Het overzicht met bewerkknop */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-lg text-gray-800">Bestaande {config.tabelLabel.toLowerCase()}</h2>
        </div>
        
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            Er zijn nog geen gegevens ingevoerd.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider font-semibold border-b border-gray-200">
                  {config.velden.map((v: BeheerVeld) => (
                    <th key={v.id} className="p-4 font-medium">{v.label}</th>
                  ))}
                  {/* NIEUW: Extra kolomkop voor acties */}
                  <th className="p-4 font-medium text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {records.map((row: any) => (
                  <tr key={row.id} className={`transition-colors ${editId === row.id ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                    {config.velden.map((v: BeheerVeld) => (
                      <td key={v.id} className="p-4 text-sm max-w-xs truncate">
                        {v.type === 'date' && row[v.id] 
                          ? new Date(row[v.id]).toLocaleDateString('nl-NL') 
                          : row[v.id] ?? <span className="text-gray-300 italic">-</span>
                        }
                      </td>
                    ))}
                    {/* NIEUW: Bewerklink per rij */}
                    <td className="p-4 text-sm text-right whitespace-nowrap">
                      <Link 
                        href={`/beheer/${categorieNaam}?edit=${row.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                      >
                        Bewerken
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}