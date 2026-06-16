export interface ModuleConfig {
  id: string;
  title: string;
  path: string;
  icon?: string; // Hier kun je later eventueel Lucide-react iconen aan koppelen
}

export const DIKIS_MODULES: ModuleConfig[] = [
  { id: 'home', title: 'Dashboard', path: '/' },
  { id: 'logboek', title: 'Logboek Invoer', path: '/modules/logboek' },
  { id: 'metingen', title: 'Meetreeksen', path: '/modules/metingen' },
  { id: "inspectie", title: "📝 Veldwerk Inspecties", path: "/inspectie" },
  { id: 'analyse', title: 'Data Analyse', path: '/modules/analyse' },
];