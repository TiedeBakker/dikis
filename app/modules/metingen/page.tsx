import { db } from "@/db";
import { personen, gebouwen, parameters, metingen, eenheden } from "@/db/schema"; // NIEUW: 'eenheden' toegevoegd aan import
import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import MetingenForm from "./MetingenForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function MetingenPage() {

  // 1. Haal de stamgegevens op
  const allePersonen = await db.select().from(personen);
  const alleGebouwen = await db.select().from(gebouwen);

  // === SLIMME VERBETERING ===
  // In plaats van plat alle parameters trekken, joinen we direct de eenheden (symbool) mee!
  const alleParametersMetEenheid = await db
    .select({
      id: parameters.id,
      naam: parameters.naam,
      symbool: eenheden.symbool, // Nu reist het symbool (bijv. 'kWh') direct mee!
    })
    .from(parameters)
    .leftJoin(eenheden, eq(parameters.eenheidId, eenheden.id));

  // 2. Haal recente metingen op met de JOINs over de UUID's inclusief het eenheden-symbool
  const recenteMetingen = await db
    .select({
      id: metingen.id,
      waarde: metingen.waarde,
      datumTijd: metingen.datumTijd,
      parameterNaam: parameters.naam,
      eenheidSymbool: eenheden.symbool, // NIEUW: Toon ook het symbool in het overzicht van recente metingen
      objectWeergave: sql<string>`COALESCE(
        ${personen.voornamen} || ' ' || ${personen.achternaam}, 
        ${gebouwen.straat} || ' ' || ${gebouwen.nummer}, 
        'Onbekend Object'
      )`
    })
    .from(metingen)
    .leftJoin(parameters, eq(metingen.parameterId, parameters.id))
    .leftJoin(eenheden, eq(parameters.eenheidId, eenheden.id)) // NIEUW: Join eenheden voor het recente overzicht
    .leftJoin(personen, eq(metingen.objectId, personen.id))
    .leftJoin(gebouwen, eq(metingen.objectId, gebouwen.id))
    .orderBy(desc(metingen.datumTijd))
    .limit(10);

  // 3. De Server Action
  async function voegMetingToe(formData: FormData) {
    "use server";

    const objectId = formData.get("objectId") as string;
    const parameterId = formData.get("parameterId") as string;
    const waardeStr = formData.get("waarde") as string;

    if (!objectId || !parameterId || !waardeStr) return;

    // We houden het nu als string (want de DB is nu Text), 
    // maar formatteren evt. wel de komma netjes naar een punt.
    const schoneWaarde = waardeStr.replace(',', '.');

    await db.insert(metingen).values({
      objectId: objectId,
      objectType: "ad-hoc", // NIEUW: Verplicht veld. Omdat het ad-hoc is, vullen we dit in.
      sessieId: crypto.randomUUID(), // NIEUW: Verplicht veld. Eén ad-hoc meting = een sessie van 1.
      parameterId: parameterId,
      waarde: schoneWaarde, // GEWIJZIGD: Geen parseFloat meer, gewoon netjes een string!
    });

    revalidatePath("/modules/metingen");
  }
  return (
    <div className="max-w-xl mx-auto space-y-8">

      {/* INVOERFORMULIER - We geven nu de verrijkte parameters mee */}
      <MetingenForm
        personen={allePersonen}
        gebouwen={alleGebouwen}
        parameters={alleParametersMetEenheid} // Geleverd incl. .symbool
        actie={voegMetingToe}
      />

      {/* RECENTE METINGEN OVERZICHT */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-1">Recente Metingen</h3>

        {recenteMetingen.length === 0 ? (
          <p className="text-sm text-gray-500 italic px-1">Nog geen metingen vastgelegd.</p>
        ) : (
          <div className="space-y-3">
            {recenteMetingen.map((meting) => (
              <div key={meting.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(meting.datumTijd).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    {meting.objectWeergave}
                  </div>
                  <div className="text-sm text-gray-600">
                    {meting.parameterNaam}
                  </div>
                </div>
                {/* AANGEPAST: Toont nu ook netjes de eenheid (indien aanwezig) achter de waarde */}
                <div className="text-2xl font-bold text-blue-700 whitespace-nowrap">
                  {meting.waarde} <span className="text-sm font-normal text-gray-500">{meting.eenheidSymbool || ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}