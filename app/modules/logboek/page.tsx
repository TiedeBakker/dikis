import { db } from "@/db";
import { logboek } from "@/db/schema";
import { revalidatePath } from "next/cache";

export default async function LogboekPage() {
  
  // Dit is de Server Action die de data verwerkt als je op 'Opslaan' drukt
  async function voegLogboekToe(formData: FormData) {
    "use server";

    const categorie = formData.get("categorie") as string;
    const titel = formData.get("titel") as string;
    const inhoud = formData.get("inhoud") as string;

    // Validatie: check of de verplichte velden zijn ingevuld
    if (!categorie || !titel || !inhoud) {
      return;
    }

    // Gegevens invoegen in Turso via Drizzle
    // De 'id' (UUID) en 'createdAt' (datum) worden automatisch door het schema gegenereerd!
    await db.insert(logboek).values({
      categorie,
      titel,
      inhoud,
    });

    // Dit zorgt ervoor dat Next.js de pagina verversst zodat eventuele nieuwe data direct zichtbaar is
    revalidatePath("/modules/logboek");
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Nieuw Logboek Record</h2>
      
      {/* Het formulier dat de Server Action aanroept */}
      <form action={voegLogboekToe} className="space-y-4">
        
        {/* Categorie Veld */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
          <select 
            name="categorie" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            required
          >
            <option value="">Kies een categorie...</option>
            <option value="Meting">Meting</option>
            <option value="Observatie">Observatie</option>
            <option value="Interpretatie">Interpretatie</option>
            <option value="Overig">Overig</option>
          </select>
        </div>

        {/* Titel Veld */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input 
            type="text" 
            name="titel" 
            placeholder="Korte omschrijving..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Inhoud Veld */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inhoud / Notitie</label>
          <textarea 
            name="inhoud" 
            rows={4}
            placeholder="Typ hier je gegevens of interpretatie..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Knop */}
        <button 
          type="submit" 
          className="w-full bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
        >
          Gegevens Vastleggen
        </button>

      </form>
    </div>
  );
}