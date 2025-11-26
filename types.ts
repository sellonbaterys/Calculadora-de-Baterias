
export type SystemType = 'ONG' | 'HIB' | 'OFF';

export interface ProjectData {
  systemType: SystemType | null;
  consumoMensalKWh: number;
  kWhApuradosMes: number;
  horasBackup: number;
  cargas127V: number;
  cargas220V: number;
  cargas380V: number;
  fatorSimultaneidade: number;
  systemVoltage: string;
  tipoTarifa: string;
  usaraZeroGrid: boolean;
  integrador: string;
  cliente: string;
  cidade: string;
  estado: string;
  distribuidora: string; // Novo campo
  custoKwh: number;
  isMobileApplication: boolean; // Novo campo para Off-Grid móvel
}

export interface CalculationResults {
  energiaBessKwh: string;
  numBaterias: number;
  potenciaInversorKw: string;
  effectiveLoadKw: string;
  suggestedInverterBess: string;
  hybridInverterPower: string;
  potenciaPvKwP: string;
  numModulos: number;
  hspUsado: string;
  dailyProductionKwh: number;
  dailyConsumptionKwh: number;
  economiaMensalEstimada: string;
  suggestedInverterPvKw: string;
  cargas127V: number;
  cargas220V: number;
  cargas380V: number;
  FATOR_ECONOMIA_REAL: number;
  totalLoadWatts: number;
}

export interface ReportContent {
  text: string;
  sources?: { uri: string; title: string }[];
}