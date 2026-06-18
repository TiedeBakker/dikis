// app/beheer/stamgegevens/page.tsx
export default function StamgegevensWelkomPage() {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-black">
      <div className="text-3xl mb-4">⚙️</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Centraal Stamgegevens Beheer</h1>
      <p className="text-sm text-gray-600 leading-relaxed">
        Selecteer in de linker witte kolom een brontabel om de gegevens aan te passen. 
        Wijzigingen die je hier doorvoert, zijn direct live merkbaar in alle gekoppelde parametersets en inspectieformulieren.
      </p>
      
      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-800">
        <strong>Tip:</strong> Wil je een geheel nieuwe tabel toevoegen? Dit kan via de database metadata configuratie.
      </div>
    </div>
  );
}