import { db } from "@/db";
import { logboek } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm"; // Hiermee kunnen we sorteren
export const dynamic = "force-dynamic";
export default async function LogboekPage() {
  
  // 1. Haal de bestaande logs op uit Turso (Nieuwste eerst)
  // Voor een subset zou je hier later een '.where()' aan kunnen toevoegen voor bijv. de laatste 30 dagen
  const recenteLogs = await db.select().from(logboek).orderBy(desc(logboek.createdAt));

  // De Server Action voor het toevoegen van data
  async function voegLogboekToe(formData: FormData) {
    "use server";

    const categorie = formData.get("categorie") as string;
    const titel = formData.get("titel") as string;
    const inhoud = formData.get("inhoud") as string;

    if (!categorie || !titel || !inhoud) return;

    await db.insert(logboek).values({
      categorie,
      titel,
      inhoud,
    });

    revalidatePath("/modules/logboek");
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      
      {/* HET INVOERFORMULIER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Nieuw Logboek Record</h2>
        
        <form action={voegLogboekToe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
            <select name="categorie" className="w-full p-2 border border-gray-300 rounded-lg bg-white" required>
              <option value="">Kies een categorie...</option>
              <option value="Meting">Meting</option>
              <option value="Observatie">Observatie</option>
              <option value="Interpretatie">Interpretatie</option>
              <option value="Overig">Overig</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input type="text" name="titel" placeholder="Korte omschrijving..." className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud / Notitie</label>
            <textarea name="inhoud" rows={3} placeholder="Typ hier je gegevens..." className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>

          <button type="submit" className="w-full bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
            Gegevens Vastleggen
          </button>
        </form>
      </div>

      {/* HET RECENTE OVERZICHT (De subset) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-1">Recente Vastleggingen ({recenteLogs.length})</h3>
        
        {recenteLogs.length === 0 ? (
          <p className="text-sm text-gray-500 italic px-1">Nog geen gegevens vastgelegd.</p>
        ) : (
          <div className="space-y-3">
            {recenteLogs.map((log) => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex justify-between items-start text-xs text-gray-500">
                  {/* We maken een simpele vertaling van de UTC timestamp naar een leesbare tijd */}
                  <span>{new Date(log.createdAt).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full uppercase tracking-wider text-[10px]">
                    {log.categorie}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">{log.titel}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{log.inhoud}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}