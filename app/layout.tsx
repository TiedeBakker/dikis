// app/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIKIS_MODULES } from "@/config/modules";
import "./globals.css";

export default function RootLayout({
  children,
  submenu, // Het dynamische slot
}: Readonly<{
  children: React.ReactNode;
  submenu: React.ReactNode;
}>) {
  const pathname = usePathname() || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col antialiased">

        {/* PC HOOFDNAVIGATIE (Balk 1) */}
        <div className="hidden lg:flex flex-col w-full shrink-0">
          <header className="bg-slate-900 text-slate-300 px-8 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <span className="font-extrabold tracking-wider text-sm text-blue-400">DIKIS CORE</span>
              </div>

              <nav className="flex items-center gap-1 text-sm font-medium">
                {DIKIS_MODULES.map((module) => {
                  const isActive = module.path === "/" ? pathname === "/" : pathname.startsWith(module.path);
                  return (
                    <Link
                      key={module.id}
                      href={module.path}
                      className={`px-3 py-1.5 rounded transition-colors ${isActive ? "bg-blue-600 text-white font-semibold shadow-sm" : "hover:text-white hover:bg-slate-800"
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
        </div>

        {/* SMARTPHONE & TABLET HOOFDNAVIGATIE */}
        <div className="lg:hidden flex flex-col w-full bg-slate-900 text-white shrink-0 shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <span className="font-bold text-xs uppercase tracking-wider text-blue-400">DIKIS Mobile</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300 hover:text-white rounded-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="border-t border-slate-800 p-3 space-y-1 bg-slate-900">
              {DIKIS_MODULES.map((module) => {
                const isActive = module.path === "/" ? pathname === "/" : pathname.startsWith(module.path);
                return (
                  <Link
                    key={module.id}
                    href={module.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                      }`}
                  >
                    <span>{module.icon}</span>
                    {module.title}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        {/* SUBNAVIGATIEBALK (Grijs) - NU OOK 100% Breedte omdat hij buiten <main> staat! */}
        {submenu && (
          <div className="w-full bg-gray-100 border-b border-gray-200 px-8 py-2 flex items-center shadow-sm empty:hidden">
            {submenu}
          </div>
        )}

        {/* CENTRALE CONTENT CONTAINER (Gecentreerd op max 1700px met ademruimte) */}
        {/* CENTRALE INHOUD */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 md:p-8 transition-all">
          {children}
        </main>

      </body>
    </html>
  );
}