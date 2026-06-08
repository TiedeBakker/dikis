export interface ModuleConfig {
  id: string;
  title: string;
  path: string;
  icon?: string; // Hier kun je later eventueel Lucide-react iconen aan koppelen
}

export const DIKIS_MODULES: ModuleConfig[] = [
  { id: 'home', title: 'Dashboard', path: '/' },
  { id: 'logboek', title: 'Logboek Invoer gegevens', path: '/modules/logboek' },
  { id: 'metingen', title: 'Meetreeksen', path: '/modules/metingen' },
  { id: 'analyse', title: 'Data Analyse', path: '/modules/analyse' },
];