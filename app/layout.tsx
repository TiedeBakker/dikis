// src/app/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIKIS_MODULES } from "@/config/modules";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check of de huidige pagina onder /beheer valt voor de 2e menulaag
  const isBeheerOmgeving = pathname.startsWith("/beheer");

  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col antialiased">
        
        {/* =========================================================================
            PC OMGEVING LAYOUT (Zichtbaar vanaf lg: 1024px)
            ========================================================================= */}
        <div className="hidden lg:flex flex-col w-full shrink-0">
          
          {/* BALK 1: HOOFDNAVIGATIE APPLICATIE */}
          <header className="bg-slate-900 text-slate-300 px-8 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <span className="font-extrabold tracking-wider text-sm text-blue-400">DIKIS CORE</span>
              </div>
              
              <nav className="flex items-center gap-1 text-sm font-medium">
                {DIKIS_MODULES.map((module) => {
                  const isActive = pathname.startsWith(module.path);
                  return (
                    <Link
                      key={module.id}
                      href={module.path}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        isActive 
                          ? "bg-blue-600 text-white font-semibold shadow-sm" 
                          : "hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {module.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              PC-Modus: Live
            </div>
          </header>

          {/* BALK 2: SUBNAVIGATIE (Alleen zichtbaar als we binnen Beheer navigeren) */}
          {isBeheerOmgeving && (
            <div className="bg-white border-b border-gray-200 px-8 py-2.5 flex items-center justify-between shadow-sm">
              <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <Link href="/beheer" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  🏠 Dashboard
                </Link>
                <Link href="/beheer/groepen" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  📂 Groepen & Objecten
                </Link>
                <Link href="/beheer/parameter-sets" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  📋 Parametersets (Blauwdrukken)
                </Link>
                <Link href="/beheer/stamgegevens" className="px-3 py-1.5 rounded-lg text-purple-600 hover:bg-purple-50 border border-purple-100 font-bold">
                  ⚙️ Stamgegevens
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* =========================================================================
            SMARTPHONE & TABLET LAYOUT (Zichtbaar op schermen tot 1024px)
            ========================================================================= */}
        <div className="lg:hidden flex flex-col w-full bg-slate-900 text-white shrink-0 shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <span className="font-bold text-xs uppercase tracking-wider text-blue-400">DIKIS Mobile</span>
            </div>
            
            {/* Hamburger Knop */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white outline-none focus:bg-slate-800 rounded-lg transition-colors"
              aria-label="Menu openen"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Uitklapbaar Mobiel Menu via Hamburger */}
          {mobileMenuOpen && (
            <nav className="border-t border-slate-800 p-3 space-y-1 bg-slate-900 transition-all">
              {DIKIS_MODULES.map((module) => {
                const isActive = pathname.startsWith(module.path);
                return (
                  <Link
                    key={module.id}
                    href={module.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{module.icon}</span>
                    {module.title}
                    {module.pcOnly && (
                      <span className="ml-auto text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">PC</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* HORIZONTAAL SCROLLBARE BALK (Alleen voor sub-menu op mobiel/tablet als we in beheer zitten) */}
          {isBeheerOmgeving && (
            <div className="bg-white border-b border-gray-200 text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center px-2 py-1.5 shadow-inner">
              <Link href="/beheer" className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md mr-1 hover:bg-gray-100">
                🏠 Dashboard
              </Link>
              <Link href="/beheer/groepen" className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md mr-1 hover:bg-gray-100">
                📂 Groepen
              </Link>
              <Link href="/beheer/parameter-sets" className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md mr-1 hover:bg-gray-100">
                📋 Parametersets
              </Link>
              <Link href="/beheer/stamgegevens" className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md text-purple-600 font-extrabold bg-purple-50">
                ⚙️ Stamgegevens
              </Link>
            </div>
          )}
        </div>

        {/* =========================================================================
            CENTRALE CONTENT CONTAINER (DE WERKVLOER)
            ========================================================================= */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-8 transition-all">
          {children}
        </main>

      </body>
    </html>
  );
}