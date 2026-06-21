"use client";

import { useState, useRef } from "react";

// Types voor de properties die we van page.tsx krijgen
interface MetingenFormProps {
  personen: any[];
  gebouwen: any[];
  parameters: any[];
  actie: (formData: FormData) => Promise<void>;
}

export default function MetingenForm({ personen, gebouwen, parameters, actie }: MetingenFormProps) {
  // State voor Object zoeken
  const [searchObject, setSearchObject] = useState("");
  const [selectedObjectId, setSelectedObjectId] = useState("");
  const [showObjectDropdown, setShowObjectDropdown] = useState(false);

  // State voor Parameter zoeken
  const [searchParameter, setSearchParameter] = useState("");
  const [selectedParameterId, setSelectedParameterId] = useState("");
  const [showParameterDropdown, setShowParameterDropdown] = useState(false);

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

  // Filter logica voor Objecten
  const gefilterdeObjecten = alleObjecten.filter(obj =>
    obj.naam.toLowerCase().includes(searchObject.toLowerCase())
  );

  // Filter logica voor Parameters
  const gefilterdeParameters = parameters.filter(param =>
    param.naam.toLowerCase().includes(searchParameter.toLowerCase())
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
          setSearchObject("");
          setSelectedObjectId("");
          setSearchParameter("");
          setSelectedParameterId("");
        }}
        className="space-y-4"
      >

        {/* SLIM OBJECT ZOEKVELD */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Zoek Object</label>
          <input type="hidden" name="objectId" value={selectedObjectId} required />

          <input
            type="text"
            placeholder="Typ een naam of straat..."
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchObject}
            onChange={(e) => {
              setSearchObject(e.target.value);
              setSelectedObjectId(""); // Reset ID als gebruiker weer gaat typen
              setShowObjectDropdown(true);
            }}
            onFocus={() => setShowObjectDropdown(true)}
            onBlur={() => setTimeout(() => setShowObjectDropdown(false), 200)} // Timeout zorgt dat de klik op een dropdown-item nog geregistreerd wordt
          />

          {showObjectDropdown && searchObject.length > 0 && (
            <div className="absolute z-30 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {gefilterdeObjecten.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">Geen objecten gevonden...</div>
              ) : (
                gefilterdeObjecten.map(obj => (
                  <button
                    key={obj.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 flex justify-between items-center"
                    onMouseDown={() => { // onMouseDown triggert vóór onBlur van de input
                      setSearchObject(obj.naam);
                      setSelectedObjectId(obj.id);
                      setShowObjectDropdown(false);
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

        {/* SLIM PARAMETER ZOEKVELD */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Wat meet je?</label>
          <input type="hidden" name="parameterId" value={selectedParameterId} required />

          <input
            type="text"
            placeholder="Zoek parameter..."
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchParameter}
            onChange={(e) => {
              setSearchParameter(e.target.value);
              setSelectedParameterId("");
              setShowParameterDropdown(true);
            }}
            onFocus={() => setShowParameterDropdown(true)}
            onBlur={() => setTimeout(() => setShowParameterDropdown(false), 200)}
          />

          {showParameterDropdown && searchParameter.length > 0 && (
            <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
              {gefilterdeParameters.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">Geen parameters gevonden...</div>
              ) : (
                gefilterdeParameters.map(param => (
                  <button
                    key={param.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                    onMouseDown={() => {
                      setSearchParameter(param.naam); // We houden alleen de naam in het inputveld i.v.m. de zoekfilter
                      setSelectedParameterId(param.id);
                      setShowParameterDropdown(false);
                    }}
                  >
                    {/* AANPASSING 1: Toon het symbool in de dropdown als deze bestaat */}
                    <span className="font-medium text-gray-900">
                      {param.naam} {param.symbool && <span className="text-gray-500 font-normal ml-1">({param.symbool})</span>}
                    </span>
                    <span className="font-medium text-gray-900">
                      {param.naam} {param.symbool && <span className="text-gray-500 font-normal ml-1">({param.symbool})</span>}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* WAARDE INVOER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meetwaarde</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              name="waarde"
              placeholder="Bijv. 37.5 of 1200"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            {/* AANPASSING 2: Toon het symbool achter het invulveld zodra een parameter is gekozen */}
            {selectedParameterId && parameters.find(p => p.id === selectedParameterId)?.symbool && (
              <span className="text-gray-600 font-medium whitespace-nowrap bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                {parameters.find(p => p.id === selectedParameterId)?.symbool}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedObjectId || !selectedParameterId} // Nu vereisen we BEIDE ID's voordat je kunt opslaan
          className="w-full bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Meting Opslaan
        </button>
      </form>
    </div>
  );
}