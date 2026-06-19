"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BeheerSubmenu() {
  const pathname = usePathname() || "";

  return (
    <nav className="w-full flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
      <Link href="/beheer" className={`px-3 py-1.5 rounded transition-colors ${pathname === "/beheer" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "hover:bg-gray-200/60"}`}>
        🏠 Module Start
      </Link>
      <Link href="/beheer/groepen" className={`px-3 py-1.5 rounded transition-colors ${pathname.startsWith("/beheer/groepen") ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "hover:bg-gray-200/60"}`}>
        📂 Groepen & Objecten
      </Link>
      <Link href="/beheer/parameter-sets" className={`px-3 py-1.5 rounded transition-colors ${pathname.startsWith("/beheer/parameter-sets") ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "hover:bg-gray-200/60"}`}>
        📋 Parametersets (Blauwdrukken)
      </Link>
      <Link href="/beheer/start-stamgegevens" className={`px-3 py-1.5 rounded transition-colors border ${pathname !== "/beheer" && !pathname.startsWith("/beheer/groepen") && !pathname.startsWith("/beheer/parameter-sets") ? "bg-purple-600 border-purple-700 text-white font-bold shadow-sm" : "border-transparent text-purple-700 hover:bg-purple-200/50"}`}>
        ⚙️ Brontabellen (Stamgegevens)
      </Link>
    </nav>
  );
}