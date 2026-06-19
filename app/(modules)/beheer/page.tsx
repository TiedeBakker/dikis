export default function BeheerModuleStartPage() {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-black space-y-4">
      <div className="text-3xl">⚙️</div>
      <h1 className="text-xl font-bold text-gray-900">Module: Applicatie Beheer & Configuratie</h1>
      <hr className="border-gray-100" />
      <p className="text-sm text-gray-600 leading-relaxed">
        Binnen deze module richt je de applicatie in voor productie. Gebruik de submenubalk hierboven om te navigeren:
      </p>
      <ul className="text-sm text-gray-600 space-y-2 pl-4 list-disc">
        <li><strong>Groepen & Objecten:</strong> Koppel specifieke meetobjecten aan inspectieformulieren.</li>
        <li><strong>Parametersets (Blauwdrukken):</strong> Stel formulieren samen en beheer parameters.</li>
        <li><strong>Brontabellen (Stamgegevens):</strong> Beheer de achterliggende moedertabellen (zoals personen en eenheden) volledig dynamisch.</li>
      </ul>
    </div>
  );
}