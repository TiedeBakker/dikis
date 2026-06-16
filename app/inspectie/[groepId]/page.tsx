import { getInspectieGroepDetails, getLaatsteMetingenVoorObject } from "../actions";
import FormulierEngineClient from "./FormulierEngineClient";
import Link from "next/link";
import { db } from "@/db";
import { metingen } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function GroepInspectiePage({ 
  params 
}: { 
  params: Promise<{ groepId: string }> | { groepId: string } 
}) {
  const resolvedParams = await params;
  const groepId = resolvedParams.groepId;

  const data = await getInspectieGroepDetails(groepId);

  if (!data) {
    return <div className="p-8 text-black">Inspectiegroep niet gevonden of geen formulier gekoppeld.</div>;
  }

  const { groepInfo, formulierVelden, objecten } = data;

  // Haal de historische data op van álle gekoppelde objecten om mee te geven aan de referentie
  const objectIds = objecten.map(o => o.id);
  
  let historieLijst: any[] = [];
  if (objectIds.length > 0) {
    // We halen simpelweg de metingen op voor de relevante objecten
    historieLijst = await db
      .select({
        objectId: metingen.objectId,
        parameterId: metingen.parameterId,
        waarde: metingen.waarde,
        datumTijd: metingen.datumTijd,
      })
      .from(metingen)
      .orderBy(metingen.datumTijd); // Oud naar nieuw, zodat de client makkelijk de nieuwste kan vinden
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Broodkruimel */}
      <div>
        <Link href="/inspectie" className="text-xs font-semibold text-blue-600 hover:underline">
          ← Wissel van Groep
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <span className="text-xs uppercase tracking-wider font-bold text-blue-600">Actieve Inspectieronde</span>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">{groepInfo.naam}</h1>
      </div>

      {/* De Interactieve Formulier Engine */}
      <FormulierEngineClient 
        groepId={groepId} 
        velden={formulierVelden} 
        objecten={objecten} 
        historie={historieLijst} 
      />

    </div>
  );
}