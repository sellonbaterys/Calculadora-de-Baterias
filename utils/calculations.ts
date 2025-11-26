
import {
  BESS_BATTERY_CAPACITY_KWH,
  BESS_DOD_FACTOR,
  COMMERCIAL_INVERTER_KW,
  FATOR_COMPENSACAO_LIQUIDA,
  HSP_BY_STATE,
  MODULE_POWER_Wp,
  PV_PERFORMANCE_FACTOR
} from '../constants';
import { ProjectData, CalculationResults } from '../types';

const suggestInverterType = (cargas127V: number, cargas220V: number, cargas380V: number, systemVoltage: string): string => {
  const has127 = cargas127V > 0;
  const has220 = cargas220V > 0;
  const has380 = cargas380V > 0;
  const hasAnyLoad = has127 || has220 || has380;

  if (!hasAnyLoad) {
      return "Nenhuma carga prioritária definida.";
  }

  if (systemVoltage === '380V') {
      return "Trifásico 380V";
  }
  
  if (systemVoltage === '220V Trifásico') {
      return "Trifásico 220V";
  }

  if (has127 && has220) {
      return "Split-Phase (Bifásico)";
  }

  if (has220) {
      return "Monofásico 220V";
  }

  if (has127) {
      return "Monofásico 127V";
  }

  return "Não especificado (Verificar tensões)";
};

// Lógica Corrigida: Dimensiona inversor com 50% de overload (PV/1.5)
const suggestPvInverterPower = (potenciaPvKwP: number): string => {
  // Regra de Overload: A potência PV é 150% da potência do inversor.
  // Logo, Inversor = PV / 1.5
  const targetInverterPower = potenciaPvKwP / 1.5;
  
  // Encontrar o inversor comercial mais próximo do target
  const closest = COMMERCIAL_INVERTER_KW.reduce((prev, curr) => {
    return (Math.abs(curr - targetInverterPower) < Math.abs(prev - targetInverterPower) ? curr : prev);
  });
  
  return closest.toFixed(1);
};

const suggestBessInverterPower = (effectiveLoadKw: number, maxPvPowerKw: number): string => {
  const commercialKw = COMMERCIAL_INVERTER_KW;
  
  // Inversor deve suportar a carga E ter uma relação razoável com o PV
  const inverterByLoad = commercialKw.find(kw => kw >= effectiveLoadKw);
  
  // Regra similar de clipping para Híbrido/Off-grid, mas priorizando carga
  const targetByPv = maxPvPowerKw / 1.5; 
  
  let finalPower = 0;
  
  if (inverterByLoad) {
      // Encontrar o melhor inversor que atenda a carga e esteja próximo do ideal solar
      const candidates = commercialKw.filter(kw => kw >= effectiveLoadKw);
      
      // Dentre os candidatos que atendem a carga, pega o mais próximo do target solar
      // Se o target solar for menor que a carga, pega o da carga (mínimo)
      if (targetByPv < effectiveLoadKw) {
         finalPower = inverterByLoad;
      } else {
         finalPower = candidates.reduce((prev, curr) => {
             return (Math.abs(curr - targetByPv) < Math.abs(prev - targetByPv) ? curr : prev);
         });
      }
  } else {
      finalPower = commercialKw[commercialKw.length - 1]; 
  }
  
  return finalPower.toFixed(1);
};

export const calculateDimensioning = (data: ProjectData): CalculationResults => {
  const { systemType, consumoMensalKWh, horasBackup, cargas127V, cargas220V, cargas380V, fatorSimultaneidade, estado, custoKwh, systemVoltage, kWhApuradosMes } = data;
  const hspState = HSP_BY_STATE[estado] || HSP_BY_STATE['PADRAO'];

  let energiaBessKwh = 0;
  let potenciaInversorKw = '0.0';
  let effectiveLoadKw = 0;
  let totalLoadWatts = 0;
  const isBess = systemType === 'HIB' || systemType === 'OFF';
  let suggestedInverterBess = ''; 
  
  let localCargas127V = cargas127V;
  let localCargas220V = cargas220V;
  let localCargas380V = cargas380V;
  
  const cargasManuaisPreenchidas = localCargas127V > 0 || localCargas220V > 0 || localCargas380V > 0;
  let dimensionamentoPorCargas = true; 

  if (isBess) {
      
      if (systemType === 'OFF' && kWhApuradosMes > 0) {
           if (cargasManuaisPreenchidas) {
              dimensionamentoPorCargas = true;
           } else {
              localCargas127V = 0;
              localCargas220V = 0;
              localCargas380V = 0;
              dimensionamentoPorCargas = false;
           }
      }

      totalLoadWatts = localCargas127V + localCargas220V + localCargas380V;
      const effectiveLoadWatts = totalLoadWatts * fatorSimultaneidade;
      effectiveLoadKw = effectiveLoadWatts / 1000;
      
      if (dimensionamentoPorCargas) {
           energiaBessKwh = effectiveLoadKw * horasBackup / BESS_DOD_FACTOR;
      } else {
           const dailyConsumptionAp = kWhApuradosMes / 30; 
           energiaBessKwh = dailyConsumptionAp / BESS_DOD_FACTOR;
      }
      
      suggestedInverterBess = suggestInverterType(localCargas127V, localCargas220V, localCargas380V, systemVoltage);
  }

  let potenciaPvKwP = 0;
  let numModulos = 0;
  let dailyProductionKwh = 0; 
  let dailyConsumptionKwh = 0; 
  let economiaMensalEstimada = 0; 
  let suggestedInverterPvKw = ''; 

  const isPV = systemType === 'HIB' || systemType === 'ONG' || systemType === 'OFF'; 

  if (isPV) {
      let dailyEnergyToCover;
      
      if (systemType === 'OFF') {
          if(dimensionamentoPorCargas) {
              const consumptionFromLoads = effectiveLoadKw * 24; 
              dailyEnergyToCover = consumptionFromLoads;
              dailyConsumptionKwh = consumptionFromLoads;
          } else {
              const dailyConsumptionAp = kWhApuradosMes / 30;
              dailyEnergyToCover = dailyConsumptionAp + (energiaBessKwh * BESS_DOD_FACTOR * 0.5); 
              dailyConsumptionKwh = dailyConsumptionAp;
          }
          
      } else {
          dailyEnergyToCover = consumoMensalKWh / 30;
          dailyConsumptionKwh = dailyEnergyToCover;
      }
      
      const potenciaPvKwPTemp = (dailyEnergyToCover / (hspState * PV_PERFORMANCE_FACTOR));
      potenciaPvKwP = potenciaPvKwPTemp;

      numModulos = Math.ceil((potenciaPvKwP * 1000) / MODULE_POWER_Wp);
      
      dailyProductionKwh = potenciaPvKwP * hspState * PV_PERFORMANCE_FACTOR;
      
      if (systemType !== 'OFF') {
           const economiaBruta = consumoMensalKWh * custoKwh;
           economiaMensalEstimada = economiaBruta * FATOR_COMPENSACAO_LIQUIDA;
      }
      
      suggestedInverterPvKw = suggestPvInverterPower(potenciaPvKwP);
  }
  
  if (isBess) {
      const minPowerByLoad = effectiveLoadKw > 0 ? effectiveLoadKw : 3.5; 
      potenciaInversorKw = suggestBessInverterPower(minPowerByLoad, potenciaPvKwP);
  }
  
  const numBaterias = Math.ceil(energiaBessKwh / BESS_BATTERY_CAPACITY_KWH);

  return {
      energiaBessKwh: energiaBessKwh.toFixed(1),
      numBaterias: numBaterias,
      potenciaInversorKw: potenciaInversorKw,
      effectiveLoadKw: effectiveLoadKw.toFixed(1),
      suggestedInverterBess: suggestedInverterBess,
      hybridInverterPower: potenciaInversorKw,
      potenciaPvKwP: potenciaPvKwP.toFixed(2),
      numModulos: numModulos,
      hspUsado: hspState.toFixed(2), 
      dailyProductionKwh: dailyProductionKwh, 
      dailyConsumptionKwh: dailyConsumptionKwh, 
      economiaMensalEstimada: economiaMensalEstimada.toFixed(2),
      suggestedInverterPvKw: suggestedInverterPvKw, 
      cargas127V: localCargas127V,
      cargas220V: localCargas220V,
      cargas380V: localCargas380V,
      FATOR_ECONOMIA_REAL: FATOR_COMPENSACAO_LIQUIDA, 
      totalLoadWatts: totalLoadWatts,
  };
};
