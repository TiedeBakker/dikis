import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-black space-y-8">
      {/* Welkom Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">DIKIS Dashboard</h2>
        {/* <p className="text-gray-600">
          Welkom in het centrale kennissysteem. Kies een operationele module in het menu of gebruik het beheerpaneel hieronder.
        </p> */}
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

          <Link 
            href="/beheer/personen"
            className="flex flex-col justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-xl transition-all group"
          >
            <div>
              <h4 className="font-semibold text-sm text-gray-900">3. Brontabellen</h4>
              <p className="text-xs text-gray-500 mt-1">Stamgegevens beheren van personen en gebouwen.</p>
            </div>
            <span className="text-right text-xs text-gray-400 group-hover:text-gray-600 font-bold mt-4">Openen →</span>
          </Link>

        </div>
      </div>
    </div>
  );
}