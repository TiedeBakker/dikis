import type { Metadata } from "next";
import Link from "next/link";
import { DIKIS_MODULES } from "@/config/modules";
import "./globals.css"; // Zorg dat Tailwind hier geladen wordt

export const metadata: Metadata = {
  title: "DIKIS",
  description: "Digitaal Kennis- en Informatie systeem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-50 text-gray-900">
        
        {/* RECHTSOF BOVEN: De hoofdcontainer voor Header + Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden order-1 md:order-2">
          
          {/* INFO / TITEL BALK */}
          <header className="h-14 bg-blue-900 text-white flex items-center justify-between px-4 shadow-md z-10">
            <h1 className="font-bold text-lg">DIKIS</h1>
            <div className="text-sm opacity-80">Status: Online</div>
          </header>

          {/* CENTRALE CONTENT OMGEVING */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
          
        </div>

        {/* MENU-BUTTON-BALK */}
        <nav className="bg-white border-t border-gray-200 md:border-t-0 md:border-r 
                        fixed bottom-0 left-0 right-0 h-16 flex flex-row 
                        md:relative md:h-full md:w-64 md:flex-col 
                        overflow-x-auto md:overflow-y-auto overflow-y-hidden md:overflow-x-hidden 
                        select-none whitespace-nowrap md:whitespace-normal z-20 shadow-lg md:shadow-none">
          <div className="flex flex-row md:flex-col p-2 gap-2 w-full h-full items-center md:items-stretch">
            
            {/* De bestaande dynamische modules (Metingen, Logboek, etc.) */}
            {DIKIS_MODULES.map((module) => (
              <Link
                key={module.id}
                href={module.path}
                className="inline-flex items-center justify-center md:justify-start 
                           px-4 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-900 
                           font-medium transition-colors text-sm md:text-base 
                           min-w-[120px] md:min-w-0 h-10 md:h-auto"
              >
                {module.title}
              </Link>
            ))}

          </div>
        </nav>

      </body>
    </html>
  );
}