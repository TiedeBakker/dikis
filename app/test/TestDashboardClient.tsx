"use client";

import { useState } from "react";
import TestFormClient from "./TestFormClient";

// Types gebaseerd op wat we van de server krijgen
type ObjectItem = { objectId: string; objectType: string };
type GroepContext = { groep: { naam: string }; objecten: ObjectItem[] };

export default function TestDashboardClient({ 
  context, 
  velden 
}: { 
  context: GroepContext; 
  velden: any[]; 
}) {
  // Hier houden we bij op welk object de gebruiker heeft geklikt
  const [actiefObject, setActiefObject] = useState<ObjectItem | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* LINKERKOLOM: De Objecten in de groep */}
      <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg border border-gray-200 text-black">
        <h2 className="font-bold text-lg mb-2">{context.groep.naam}</h2>
        <p className="text-sm text-gray-500 mb-4">Selecteer een object om te meten:</p>
        
        <ul className="space-y-2">
          {context.objecten.map((obj) => {
            // Bepaal of dit object momenteel geselecteerd is
            const isActief = actiefObject?.objectId === obj.objectId;
            
            return (
              <li 
                key={obj.objectId} 
                onClick={() => setActiefObject(obj)}
                className={`p-3 rounded border shadow-sm cursor-pointer transition-colors ${
                  isActief 
                    ? "bg-blue-50 border-blue-500" // Opvallende kleur als hij geselecteerd is
                    : "bg-white border-gray-300 hover:border-blue-400"
                }`}
              >
                <div className="font-medium text-sm">{obj.objectId}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{obj.objectType}</div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RECHTERKOLOM: Het dynamische formulier */}
      <div className="md:col-span-2">
        <h2 className="font-bold text-lg mb-4 text-white">Invoerformulier</h2>
        
        {/* Render het formulier alléén als er een object is gekozen */}
        {actiefObject ? (
          <div key={actiefObject.objectId}> {/* Key forceert een re-render per object */}
            <p className="mb-4 text-sm text-blue-300">
              Je vult nu gegevens in voor: <strong>{actiefObject.objectId}</strong>
            </p>
            <TestFormClient 
              velden={velden} 
              objectId={actiefObject.objectId} 
              objectType={actiefObject.objectType} 
            />
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg text-center text-gray-400">
            Klik op een object in de linkerlijst om het formulier te starten.
          </div>
        )}
      </div>
      
    </div>
  );
}