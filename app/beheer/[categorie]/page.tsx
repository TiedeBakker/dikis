import { db } from "@/db";
import { getBeheerConfig } from "../../lib/beheer";
import { notFound } from "next/navigation";
import * as schema from "@/db/schema";
import { opslaanRecord, bijwerkenRecord } from "./actions";
import Link from "next/link";
import { asc } from "drizzle-orm"; // NIEUW: Nodig voor de sortering

interface BeheerVeld {
  id: string;
  label: string;
  type: string;
  verplicht: boolean | null;
  lookupTabel: string | null;
  toelichting?: string | null;
}

export default async function BeheerCategoriePage({
  params,
  searchParams
}: {
  params: Promise<{ categorie: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorieNaam = resolvedParams.categorie;
  const editId = resolvedSearchParams.edit || null;

  const config = await getBeheerConfig(categorieNaam);
  if (!config) notFound();

  const targetTable = (schema as any)[categorieNaam];
  if (!targetTable) notFound();

 /// DYNAMISCHE SORTERING BOUWEN (Gebaseerd op schema.ts)
  const orderClauses = [];
  
  // 1. Sorteer op tabelNaam als de actieve tabel die kolom heeft (zoals beheerMetadata)
  if (targetTable.tabelNaam) {
    orderClauses.push(asc(targetTable.tabelNaam));
  }

  // 2. Sorteer op volgnummer als de actieve tabel die kolom heeft
  if (targetTable.volgnummer) {
    orderClauses.push(asc(targetTable.volgnummer));
  }
  
  // 3. Fallback: als geen van beide bestaat (bijv. bij 'eenheden'), sorteer stabiel op id
  if (orderClauses.length === 0 && targetTable.id) {
    orderClauses.push(asc(targetTable.id));
  }

  // Haal de records op met de exacte sortering
  const records = await db.select().from(targetTable).orderBy(...orderClauses);
  
  const huidigRecord = editId ? records.find((r: any) => String(r.id) === String(editId)) : null;

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
    }
    else if (v.type === 'select' && v.lookupTabel) {
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

    const snake = id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (record[snake] !== undefined && record[snake] !== null) return record[snake];

    const camel = id.replace(/_([a-z])/g, g => g[1].toUpperCase());
    if (record[camel] !== undefined && record[camel] !== null) return record[camel];

    return "";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* SECTIE 1: Het formulier */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {huidigRecord ? `${config.tabelLabel} bijwerken` : `Beheer ${config.tabelLabel}`}
        </h1>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.velden.map((v: BeheerVeld) => (
              <div key={v.id} className={v.id === 'toelichting' ? 'md:col-span-2' : ''}>
                {v.type !== 'checkbox' && (
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {v.label} {!v.verplicht && <span className="text-gray-400 text-xs">(optioneel)</span>}
                  </label>
                )}

                {/* ELEMENT KIEZER OP BASIS VAN TYPE */}
                {v.type === 'select' ? (
                  <select
                    name={v.id}
                    defaultValue={getWaarde(huidigRecord, v.id)}
                    required={v.verplicht || false}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors h-[42px]"
                  >
                    <option value="">-- Kies een {v.label.toLowerCase()} --</option>
                    {lookupData[v.id]?.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : v.type === 'checkbox' ? (
                  <div className="flex items-center gap-3 pt-2 h-[42px]">
                    <input
                      type="checkbox"
                      id={v.id}
                      name={v.id}
                      value="true"
                      defaultChecked={!!getWaarde(huidigRecord, v.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={v.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {v.label}
                    </label>
                  </div>
                ) : (
                  <input 
                    name={v.id} 
                    type={v.type} 
                    defaultValue={getWaarde(huidigRecord, v.id)}
                    required={v.verplicht || false} 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" 
                  />
                )}
                {v.toelichting && <p className="text-xs text-gray-400 mt-1">{v.toelichting}</p>}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {huidigRecord && (
              <Link href={`/beheer/${categorieNaam}`} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
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

      {/* SECTIE 2: De Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-lg text-gray-800">Bestaande {config.tabelLabel.toLowerCase()}</h2>
        </div>

        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">Er zijn nog geen gegevens ingevoerd.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider font-semibold border-b border-gray-200">
                  {config.velden.map((v: BeheerVeld) => (
                    <th key={v.id} className="p-4 font-medium">{v.label}</th>
                  ))}
                  <th className="p-4 font-medium text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {records.map((row: any) => (
                  <tr key={row.id} className={`transition-colors ${editId === row.id ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                    {config.velden.map((v: BeheerVeld) => {
                      const celWaarde = getWaarde(row, v.id);

                      switch (v.type) {
                        case 'select': {
                          const gekozenOptie = lookupData[v.id]?.find(o => o.id === celWaarde);
                          return (
                            <td key={v.id} className="p-4 text-sm font-medium text-blue-900">
                              {gekozenOptie ? gekozenOptie.label : <span className="text-gray-300 italic">-</span>}
                            </td>
                          );
                        }
                        case 'checkbox': {
                          const isTrue = celWaarde === true || celWaarde === 1 || celWaarde === "true";
                          return (
                            <td key={v.id} className="p-4 text-sm">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isTrue ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {isTrue ? 'Ja' : 'Nee'}
                              </span>
                            </td>
                          );
                        }
                        default: {
                          return (
                            <td key={v.id} className="p-4 text-sm max-w-xs truncate">
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
                    <td className="p-4 text-sm text-right whitespace-nowrap">
                      <Link href={`/beheer/${categorieNaam}?edit=${row.id}`} className="text-blue-600 hover:text-blue-900 font-medium transition-colors">
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