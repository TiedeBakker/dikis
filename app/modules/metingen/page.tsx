import { db } from "@/db";
import { personen, gebouwen, parameters, metingen } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import MetingenForm from "./MetingenForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // <-- VOEG DEZE REGEL TOE

export default async function MetingenPage() {
  
  // 1. Haal de stamgegevens op
  const allePersonen = await db.select().from(personen);
  const alleGebouwen = await db.select().from(gebouwen);
  const alleParameters = await db.select().from(parameters);
  
  // 2. Haal recente metingen op met de SLIMME JOIN over de UUID's
  const recenteMetingen = await db
    .select({
      id: metingen.id,
      waarde: metingen.waarde,
      datumTijd: metingen.datumTijd,
      parameterNaam: parameters.naam,
      // COALESCE pakt de eerste waarde die NIET NULL is.
      objectWeergave: sql<string>`COALESCE(
        ${personen.voornamen} || ' ' || ${personen.achternaam}, 
        ${gebouwen.straat} || ' ' || ${gebouwen.nummer}, 
        'Onbekend Object'
      )`
    })
    .from(metingen)
    .leftJoin(parameters, eq(metingen.parameterId, parameters.id))
    .leftJoin(personen, eq(metingen.objectId, personen.id))
    .leftJoin(gebouwen, eq(metingen.objectId, gebouwen.id))
    .orderBy(desc(metingen.datumTijd))
    .limit(10);

  // 3. De Server Action (Mag doorgegeven worden aan client components)
  async function voegMetingToe(formData: FormData) {
    "use server";

    const objectId = formData.get("objectId") as string;
    const parameterId = formData.get("parameterId") as string;
    const waardeStr = formData.get("waarde") as string;

    if (!objectId || !parameterId || !waardeStr) return;
    
    const waarde = parseFloat(waardeStr.replace(',', '.'));

    await db.insert(metingen).values({
      objectId,
      parameterId,
      waarde,
    });
    revalidatePath("/modules/metingen");
  }
  async function herlaadData() {
  "use server";
  revalidatePath("/modules/metingen"); // Of jouw exacte pad
}

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* 2. VOEG DEZE KNOP TOE BOVENAAN JE PAGINA */}
    <div className="flex justify-end px-1">
      <form action={herlaadData}>
        <button 
          type="submit" 
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1.5 px-3 rounded-lg transition border border-gray-200 shadow-sm"
        >
          🔄 Synchroniseer Data
        </button>
      </form>
    </div>
      
      {/* INVOERFORMULIER (Als apart Client Component ingeladen) */}
      <MetingenForm 
        personen={allePersonen} 
        gebouwen={alleGebouwen} 
        parameters={alleParameters} 
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
                 <div className="text-2xl font-bold text-blue-700">
                    {meting.waarde}
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}