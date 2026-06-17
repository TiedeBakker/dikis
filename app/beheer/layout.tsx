import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BeheerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <>
        <style dangerouslySetInnerHTML={{
          __html: `
    .class-root-header { display: none !important; }
    .class-root-nav { display: none !important; }
  `}} />

        {/* Hier start de rest van je schitterende dubbele topbar layout... */}
        <div className="w-full min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
          {/* ... de rest van de code van de dubbele topbar ... */}
        </div>
      </>
      {/* 1. MOBIELE BLOKKADE (Behouden voor smartphones) */}
      <div className="block lg:hidden p-8 text-center max-w-md mx-auto mt-20">
        <div className="text-4xl mb-4">🖥️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Beheermodule niet beschikbaar</h1>
        <p className="text-sm text-gray-600">
          Om de stamdata nauwkeurig te kunnen beheren is een groter scherm vereist. Schakel over naar een pc of landscape-tablet.
        </p>
      </div>

      {/* 2. PC / DESKTOP OMGEVING (Met dubbele menubalk bovenaan) */}
      <div className="hidden lg:flex flex-col flex-1 w-full">

        {/* ==================== BALK 1: HOOFDNAVIGATIE APPLICATIE ==================== */}
        <header className="bg-slate-900 text-slate-300 px-8 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-8">
            {/* Logo / Systeemnaam */}
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <span className="font-extrabold tracking-wider text-sm text-blue-400">DIKIS CORE</span>
            </div>

            {/* Horizontale hoofdnavigatie (Vervangt je oude linkerbalk) */}
            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link href="/dashboard" className="px-3 py-1.5 rounded hover:text-white hover:bg-slate-800 transition-colors">
                Dashboard
              </Link>
              <Link href="/logboek" className="px-3 py-1.5 rounded hover:text-white hover:bg-slate-800 transition-colors">
                Logboek Invoer
              </Link>
              <Link href="/meetreeksen" className="px-3 py-1.5 rounded hover:text-white hover:bg-slate-800 transition-colors">
                Meetreeksen
              </Link>
              <Link href="/inspecties" className="px-3 py-1.5 rounded hover:text-white hover:bg-slate-800 transition-colors">
                Veldwerk Inspecties
              </Link>
              <Link href="/beheer" className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold shadow-sm">
                Applicatie Beheer
              </Link>
            </nav>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Status: <span className="text-green-400 font-bold">Online</span>
          </div>
        </header>

        {/* ==================== BALK 2: SUBNAVIGATIE BEHEERONDERDELEN ==================== */}
        <div className="bg-white border-b border-gray-200 px-8 py-2.5 flex items-center justify-between shadow-sm shrink-0">
          <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
            <Link
              href="/beheer"
              className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              🏠 Dashboard Home
            </Link>
            <Link
              href="/beheer/groepen"
              className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              📂 Groepen & Objecten
            </Link>
            <Link
              href="/beheer/parameter-sets"
              className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              📋 Parametersets (Blauwdrukken)
            </Link>
            <Link
              href="/beheer/stamgegevens"
              className="px-3 py-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors border border-purple-100 font-bold"
            >
              ⚙️ Stamgegevens / Brontabellen
            </Link>
          </nav>

          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-medium">
            Live databaseverbinding
          </span>
        </div>

        {/* ==================== HOOFDWERKPLEK ==================== */}
        {/* Neemt nu de VOLLEDIGE breedte in beslag zonder links te worden weggedrukt */}
        <main className="flex-1 p-8 w-full max-w-[1700px] mx-auto">
          {children}
        </main>

      </div>
    </div>
  );
} 