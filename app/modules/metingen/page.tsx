import { db } from "@/db";
import { personen, gebouwen, parameters, metingen } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";

export default async function MetingenPage() {
  
  // 1. Haal de stamgegevens op voor de dropdowns
  const allePersonen = await db.select().from(personen);
  const alleGebouwen = await db.select().from(gebouwen);
  const alleParameters = await db.select().from(parameters);
  
  // 2. Haal de recente metingen op
  const recenteMetingen = await db.select().from(metingen).orderBy(desc(metingen.datumTijd)).limit(10);

  // 3. De Server Action
  async function voegMetingToe(formData: FormData) {
    "use server";

    const objectData = formData.get("object") as string; // Bevat bijv: "personen|uuid-van-jan"
    const parameterId = formData.get("parameterId") as string;
    const waardeStr = formData.get("waarde") as string;

    if (!objectData || !parameterId || !waardeStr) return;

    // Splits de tabelnaam en de ID
    const [objectTabel, objectId] = objectData.split("|");
    
    // Zet de string om naar een decimaal getal
    const waarde = parseFloat(waardeStr.replace(',', '.')); // Vervangt NL komma door punt voor de zekerheid

    await db.insert(metingen).values({
      objectId,
      objectTabel,
      parameterId,
      waarde,
    });

    revalidatePath("/modules/metingen");
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      
      {/* INVOERFORMULIER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Nieuwe Meting</h2>
        
        <form action={voegMetingToe} className="space-y-4">
          
          {/* OBJECT KEUZE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Koppel aan Object</label>
            <select name="object" className="w-full p-2 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Kies een object...</option>
              
              <optgroup label="Personen">
                {allePersonen.map(p => (
                  <option key={p.id} value={`personen|${p.id}`}>
                    {p.voornamen} {p.tussenvoegsel ? p.tussenvoegsel + ' ' : ''}{p.achternaam}
                  </option>
                ))}
              </optgroup>

              <optgroup label="Gebouwen">
                {alleGebouwen.map(g => (
                  <option key={g.id} value={`gebouwen|${g.id}`}>
                    {g.straat} {g.nummer}, {g.plaats}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* PARAMETER KEUZE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wat meet je?</label>
            <select name="parameterId" className="w-full p-2 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Kies een parameter...</option>
              {alleParameters.map(param => (
                <option key={param.id} value={param.id}>{param.naam}</option>
              ))}
            </select>
          </div>

          {/* WAARDE INVOER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meetwaarde</label>
            <input 
              type="number" 
              step="any" 
              name="waarde" 
              placeholder="Bijv. 37.5 of 1200" 
              className="w-full p-2 border border-gray-300 rounded-lg" 
              required 
            />
          </div>

          <button type="submit" className="w-full bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
            Meting Opslaan
          </button>
        </form>
      </div>

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
                   {/* In de toekomst kunnen we hier met een JOIN direct de naam van de parameter of persoon tonen. Voor nu tonen we even ruw de ID's */}
                   <div className="font-medium text-gray-900 text-sm">
                     Bron: {meting.objectTabel}
                   </div>
                 </div>
                 <div className="text-xl font-bold text-blue-700">
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