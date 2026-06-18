// src/config/modules.ts

export interface DikisModule {
  id: string;
  title: string;
  path: string;
  icon: string;
  pcOnly?: boolean; // Hiermee kunnen we straks specifieke beheer-schermen blokkeren op mobiel
}

export const DIKIS_MODULES: DikisModule[] = [
  { id: "dashboard", title: "Dashboard", path: "/beheer", icon: "🏠" },
  { id: "logboek", title: "Logboek Invoer", path: "/logboek", icon: "📋" },
  { id: "meetreeksen", title: "Meetreeksen", path: "/meetreeksen", icon: "📊" },
  { id: "inspecties", title: "Veldwerk Inspecties", path: "/inspecties", icon: "🔍" },
  { id: "beheer", title: "Applicatie Beheer", path: "/beheer/parameter-sets", icon: "⚙️", pcOnly: true }
];