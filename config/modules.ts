export interface DikisModule {
  id: string;
  title: string;
  path: string;
  icon: string;
  pcOnly?: boolean;
}

export const DIKIS_MODULES: DikisModule[] = [
  { id: "dashboard", title: "Dashboard", path: "/", icon: "🏠" }, // <-- Wijst nu puur naar de applicatieroot
  { id: "beheer", title: "Applicatie Beheer", path: "/beheer", icon: "⚙️", pcOnly: true }, // <-- Wijst naar de basis van beheer
  { id: "logboek", title: "Logboek Invoer", path: "/modules/logboek", icon: "📋" }, // Matcht met je fysieke mappen
  { id: "meetreeksen", title: "Meetreeksen", path: "/modules/metingen", icon: "📊" }
];