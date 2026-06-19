import { db } from "@/db";
import { getBeheerConfig } from "../../../lib/beheer";
import { notFound } from "next/navigation";
import * as schema from "@/db/schema";
import { opslaanRecord, bijwerkenRecord } from "./actions";
import Link from "next/link";
import { asc, or, like } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface BeheerVeld {
  id: string;
  label: string;
  type: string;
  verplicht: boolean | null;
  lookupTabel: string | null;
  toelichting?: string | null;
}

interface PageProps {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ edit?: string; q?: string }>;
}

export default async function BeheerCategoriePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorieNaam = resolvedParams.categorie;
  const editId = resolvedSearchParams.edit || null;
  const zoekTerm = resolvedSearchParams.q || "";

  const config = await getBeheerConfig(categorieNaam);
  if (!config) notFound();

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) notFound();

  // Sortering bepalen
  const orderClauses = [];
  if (targetTable.tabelNaam) orderClauses.push(asc(targetTable.tabelNaam));
  if (targetTable.volgnummer) orderClauses.push(asc(targetTable.volgnummer));
  if (orderClauses.length === 0 && targetTable.id) orderClauses.push(asc(targetTable.id));

  // Zoekfilters bouwen
  const whereClauses = [];
  if (zoekTerm.trim() !== "") {
    for (const v of config.velden) {
      const kolomNaam = targetTable[v.id] || targetTable[v.id.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)];
      if (kolomNaam) {
        whereClauses.push(like(kolomNaam, `%${zoekTerm}%`));
      }
    }
  }

  // Database records ophalen (maximaal 50)
  const records = await db
    .select()
    .from(targetTable)
    .where(whereClauses.length > 0 ? or(...whereClauses) : undefined)
    .orderBy(...orderClauses)
    .limit(50);
  
  const huidigRecord = editId ? records.find((r: any) => String(r.id) === String(editId)) : null;

  // Lookups laden voor select-velden
  const lookupData: Record<string, { id: string; label: string }[]> = {};
  for (const v of config.velden) {
    if (v.id.toLowerCase() === 'veldtype') {
      lookupData[v.id] = [
        { id: 'text', label: 'Tekst (text)' },
        { id: 'number', label: 'Getal (number)' },
        { id: 'date', label: 'Datum (date)' },
        { id: 'select', label: 'Dropdown Keuzelijst (select)' },
        { id: 'checkbox', label: 'Ja/Nee Schakelaar (checkbox)' }
      ];
    } else if (v.type === 'select' && v.lookupTabel) {
      const lookupTableObj = (schema as any)[v.lookupTabel];
      if (lookupTableObj) {
        const rawLookupRows = await db.select().from(lookupTableObj);
        lookupData[v.id] = rawLookupRows.map((row: any) => ({
          id: row.id,
          label: row.symbool ? `${row.naam} (${row.symbool})` : (row.naam || row.id)
        }));
      }
    }
  }

  const formAction = huidigRecord && editId
    ? bijwerkenRecord.bind(null, categorieNaam, editId)
    : opslaanRecord.bind(null, categorieNaam);

  const getWaarde = (record: any, id: string) => {
    if (!record) return "";
    if (record[id] !== undefined && record[id] !== null) return record[id];
    const snake = id.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    if (record[snake] !== undefined && record[snake] !== null) return record[snake];
    return "";
  };

  return (
    <div className="w-full space-y-8">
      {/* KOPREGEL */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {huidigRecord ? `⚙️ ${config.tabelLabel} Bijwerken` : `📋 Beheer ${config.tabelLabel}`}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Pas de configuratie of stamgegevens van {config.tabelLabel.toLowerCase()} direct aan.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* RECHTS / BOVEN: INVOERFORMULIER */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-xs text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">
            {huidigRecord ? "Wijzigingen opslaan" : "Nieuw record toevoegen"}
          </h2>

          <form action={formAction} className="space-y-4">
            {config.velden.map((v: BeheerVeld) => (
              <div key={v.id} className="space-y-1">
                {v.type !== 'checkbox' && (
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {v.label} {!v.verplicht && <span className="text-gray-400 lowercase font-normal">(optioneel)</span>}
                  </label>
                )}

                {v.type === 'select' ? (
                  <select
                    name={v.id}
                    defaultValue={getWaarde(huidigRecord, v.id)}
                    required={v.verplicht || false}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Kies {v.label.toLowerCase()} --</option>
                    {lookupData[v.id]?.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                ) : v.type === 'checkbox' ? (
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id={v.id}
                      name={v.id}
                      value="true"
                      defaultChecked={!!getWaarde(huidigRecord, v.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={v.id} className="text-xs font-semibold text-gray-700 cursor-pointer">
                      {v.label}
                    </label>
                  </div>
                ) : (
                  <input 
                    name={v.id} 
                    type={v.type} 
                    defaultValue={getWaarde(huidigRecord, v.id)}
                    required={v.verplicht || false} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:bg-white focus:border-blue-500 outline-none transition-all" 
                  />
                )}
                {v.toelichting && <p className="text-[10px] text-gray-400 italic mt-0.5">{v.toelichting}</p>}
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              {huidigRecord && (
                <Link href={`/beheer/${categorieNaam}`} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                  Annuleren
                </Link>
              )}
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                {huidigRecord ? "Bijwerken" : "Toevoegen"}
              </button>
            </div>
          </form>
        </div>

        {/* LINKS / ONDER: TABEL OVERZICHT (xl:col-span-2) */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-gray-800 uppercase tracking-wide">Bestaande Gegevens</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Toont de eerste {records.length} records</p>
            </div>
            
            <form method="GET" className="flex gap-1.5 max-w-xs w-full">
              {editId && <input type="hidden" name="edit" value={editId} />}
              <input 
                type="text" 
                name="q"
                defaultValue={zoekTerm}
                placeholder="Zoeken..."
                className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:border-blue-500 transition-all outline-none"
              />
              {zoekTerm && (
                <Link 
                  href={`/beheer/${categorieNaam}${editId ? `?edit=${editId}` : ''}`} 
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 flex items-center bg-gray-100 rounded-lg"
                >
                  Wis
                </Link>
              )}
              <button type="submit" className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
                Zoek
              </button>
            </form>
          </div>

          {records.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic text-xs">
              {zoekTerm ? "Geen resultaten gevonden." : "Geen records aanwezig."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200">
                    {config.velden.map((v: BeheerVeld) => (
                      <th key={v.id} className="p-3">{v.label}</th>
                    ))}
                    <th className="p-3 text-right w-24">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {records.map((row: any) => (
                    <tr key={row.id} className={`transition-colors ${editId === row.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/70'}`}>
                      {config.velden.map((v: BeheerVeld) => {
                        const celWaarde = getWaarde(row, v.id);

                        switch (v.type) {
                          case 'select': {
                            const optie = lookupData[v.id]?.find(o => o.id === celWaarde);
                            return (
                              <td key={v.id} className="p-3 font-semibold text-blue-700">
                                {optie ? optie.label : <span className="text-gray-300 italic">-</span>}
                              </td>
                            );
                          }
                          case 'checkbox': {
                            const isTrue = celWaarde === true || celWaarde === 1 || celWaarde === "true";
                            return (
                              <td key={v.id} className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isTrue ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'}`}>
                                  {isTrue ? 'JA' : 'NEE'}
                                </span>
                              </td>
                            );
                          }
                          default: {
                            return (
                              <td key={v.id} className="p-3 max-w-xs truncate text-gray-600">
                                {v.type === 'date' && celWaarde
                                  ? new Date(celWaarde).toLocaleDateString('nl-NL')
                                  : celWaarde !== "" && celWaarde !== null && celWaarde !== undefined
                                    ? String(celWaarde)
                                    : <span className="text-gray-300 italic">-</span>
                                }
                              </td>
                            );
                          }
                        }
                      })}
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link href={`/beheer/${categorieNaam}?edit=${row.id}${zoekTerm ? `&q=${zoekTerm}` : ''}`} className="bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-2 py-1 rounded font-semibold transition-colors">
                          ✏️ Bewerken
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
    </div>
  );
}