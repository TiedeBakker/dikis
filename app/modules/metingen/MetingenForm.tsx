"use client";

import { useState, useRef, useEffect } from "react";

// Types voor de properties die we van page.tsx krijgen
interface MetingenFormProps {
  personen: any[];
  gebouwen: any[];
  parameters: any[];
  actie: (formData: FormData) => Promise<void>;
}

export default function MetingenForm({ personen, gebouwen, parameters, actie }: MetingenFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedObjectId, setSelectedObjectId] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Combineer personen en gebouwen tot één makkelijk doorzoekbare lijst
  const alleObjecten = [
    ...personen.map(p => ({ 
      id: p.id, 
      naam: `${p.voornamen} ${p.tussenvoegsel ? p.tussenvoegsel + ' ' : ''}${p.achternaam}`, 
      type: 'Persoon' 
    })),
    ...gebouwen.map(g => ({ 
      id: g.id, 
      naam: `${g.straat} ${g.nummer}, ${g.plaats}`, 
      type: 'Gebouw' 
    }))
  ];

  // Filter logica
  const gefilterdeObjecten = alleObjecten.filter(obj => 
    obj.naam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Nieuwe Meting</h2>
      
      <form 
        ref={formRef}
        action={async (formData) => {
          await actie(formData);
          // Reset formulier na succesvol opslaan
          formRef.current?.reset();
          setSearchTerm("");
          setSelectedObjectId("");
        }} 
        className="space-y-4"
      >
        
        {/* SLIM OBJECT ZOEKVELD */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Zoek Object</label>
          
          {/* De verborgen input die de daadwerkelijke UUID naar de server stuurt */}
          <input type="hidden" name="objectId" value={selectedObjectId} required />
          
          <input 
            type="text"
            placeholder="Typ een naam of straat..."
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedObjectId(""); // Reset ID als gebruiker weer gaat typen
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {/* DROPDOWN MET RESULTATEN */}
          {showDropdown && searchTerm.length > 0 && (
            <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {gefilterdeObjecten.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">Geen objecten gevonden...</div>
              ) : (
                gefilterdeObjecten.map(obj => (
                  <button 
                    key={obj.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 flex justify-between items-center"
                    onClick={() => {
                      setSearchTerm(obj.naam);
                      setSelectedObjectId(obj.id);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-medium text-gray-900">{obj.naam}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{obj.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* PARAMETER KEUZE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wat meet je?</label>
          <select name="parameterId" className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
            <option value="">Kies een parameter...</option>
            {parameters.map(param => (
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={!selectedObjectId} // Knop is pas actief als er écht een object uit de lijst is geklikt
          className="w-full bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Meting Opslaan
        </button>
      </form>
    </div>
  );
}