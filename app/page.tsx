import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-black space-y-8">
      {/* Welkom Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">DIKIS Dashboard</h2>
      </div>

      <hr className="border-gray-200" />

      {/* BEHEERPANEEL (Exclusief voor Desktop/PC inrichting) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">⚙️</span>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Applicatie Beheer & Configuratie</h3>
            <p className="text-xs text-gray-500">Richt hier de basislijsten en formulieren in voor de inspecteurs.</p>
          </div>
        </div>

        {/* Knoppen Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          
          {/* 1. Parameter-sets (Blauwdrukken) */}
          <Link 
            href="/beheer/parameter-sets"
            className="flex flex-col justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all group"
          >
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-900">1. Blauwdrukken</h4>
              <p className="text-xs text-gray-500 mt-1">Formulieren samenstellen en parameters beheren.</p>
            </div>
            <span className="text-right text-xs text-gray-400 group-hover:text-blue-600 font-bold mt-4">Inrichten →</span>
          </Link>

          {/* 2. Groepen & Objecten */}
          <Link 
            href="/beheer/groepen"
            className="flex flex-col justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all group"
          >
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-900">2. Groepen & Objecten</h4>
              <p className="text-xs text-gray-500 mt-1">Objecten koppelen aan een specifiek formulier.</p>
            </div>
            <span className="text-right text-xs text-gray-400 group-hover:text-blue-600 font-bold mt-4">Koppelen →</span>
          </Link>

          {/* 3. UPDATE: Centrale Stamgegevens / Brontabellen */}
          <Link 
            href="/beheer/stamgegevens" // <-- Dit wordt de nieuwe centrale route
            className="flex flex-col justify-between p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl transition-all group"
          >
            <div>
              <h4 className="font-semibold text-sm text-gray-900 group-hover:text-purple-900">3. Stamgegevens</h4>
              <p className="text-xs text-gray-500 mt-1">Gecentraliseerd beheer van objecttypes, basisparameters, eenheden en personen.</p>
            </div>
            <span className="text-right text-xs text-gray-400 group-hover:text-purple-600 font-bold mt-4">Beheren →</span>
          </Link>

        </div>
      </div>
    </div>
  );
}