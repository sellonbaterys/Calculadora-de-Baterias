
import React from 'react';
import { CheckCircle, X } from 'lucide-react';

export const PowerChart: React.FC<{ effectiveLoadKw: number; inverterPowerKw: number }> = ({ effectiveLoadKw, inverterPowerKw }) => {
    const total = inverterPowerKw;
    const loadPercentage = Math.min((effectiveLoadKw / total) * 100, 100);
    const safetyPercentage = 100 - loadPercentage;

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-3">Gráfico 1: Comparativo de Potência (kW)</h4>
            <div className="h-6 w-full flex rounded-lg overflow-hidden bg-gray-700">
                <div
                    style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    className="bg-red-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                >
                    {loadPercentage > 10 && `${effectiveLoadKw} kW Carga`}
                </div>
                <div
                    style={{ width: `${Math.max(safetyPercentage, 0)}%` }}
                    className="bg-green-600 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                >
                    {safetyPercentage > 10 && `${(total - effectiveLoadKw).toFixed(1)} kW Margem`}
                </div>
            </div>
            <p className="text-sm mt-2 text-gray-400">Total do Inversor: {inverterPowerKw.toFixed(1)} kW</p>
            <p className="text-xs text-gray-500">Visualização da margem de segurança do inversor híbrido/off-grid.</p>
        </div>
    );
};

export const EnergyChart: React.FC<{ energyBessKwh: number; hoursBackup: number }> = ({ energyBessKwh, hoursBackup }) => {
    const energyPerH = (energyBessKwh / hoursBackup).toFixed(2);
    const hours = Array.from({ length: hoursBackup }, (_, i) => i + 1);

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 mt-4">
            <h4 className="font-semibold text-gray-300 mb-1">Gráfico 2: Autonomia e Capacidade do BESS</h4>
            <p className="text-xs text-gray-400 mb-4">Capacidade total de {energyBessKwh} kWh para {hoursBackup} horas de backup.</p>
            
            <div className="flex justify-start items-end h-24 space-x-2 p-2 bg-gray-900 rounded-lg overflow-x-auto">
                {hours.map((h) => (
                    <div key={h} className="flex flex-col items-center group flex-shrink-0" style={{width: '40px'}} title={`Hora ${h}: ${energyPerH} kWh consumidos`}>
                        <div 
                            className={`w-full h-20 bg-gradient-to-t from-green-500 to-green-600 rounded-t-sm transition-all duration-300 ease-in-out group-hover:from-green-600 group-hover:to-green-700 group-hover:scale-y-105`} 
                            style={{ opacity: 1 - (h - 1) / hoursBackup }} 
                        ></div>
                        <span className="text-xs mt-1 font-medium text-gray-400">{h}h</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PvConsumptionChart: React.FC<{ dailyConsumptionKwh: number; dailyProductionKwh: number }> = ({ dailyConsumptionKwh, dailyProductionKwh }) => {
    const max = Math.max(dailyConsumptionKwh, dailyProductionKwh) * 1.2;
    const consumptionHeight = (dailyConsumptionKwh / max) * 100;
    const productionHeight = (dailyProductionKwh / max) * 100;

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 mt-4">
            <h4 className="font-semibold text-gray-300 mb-3">Gráfico 3: Geração PV vs. Consumo Diário (kWh)</h4>
            <div className="flex justify-around items-end h-32 space-x-4">
                <div className="flex flex-col items-center w-1/2">
                    <div 
                        style={{ height: `${consumptionHeight}%` }} 
                        className="w-full bg-red-500 rounded-t-lg shadow-md transition-all duration-500"
                    ></div>
                    <span className="text-xs mt-2 font-medium text-gray-400">Consumo ({dailyConsumptionKwh.toFixed(1)} kWh)</span>
                </div>
                <div className="flex flex-col items-center w-1/2">
                    <div 
                        style={{ height: `${productionHeight}%` }} 
                        className="w-full bg-green-500 rounded-t-lg shadow-md transition-all duration-500"
                    ></div>
                    <span className="text-xs mt-2 font-medium text-gray-400">Produção ({dailyProductionKwh.toFixed(1)} kWh)</span>
                </div>
            </div>
        </div>
    );
};

export const BessVsDieselChart: React.FC = () => (
    <div className="p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 mt-4">
        <h4 className="font-semibold text-gray-300 mb-3">Gráfico 5: Comparativo BESS vs. Gerador Diesel</h4>
        <div className="flex justify-around items-end h-32 space-x-6">
            <div className="flex flex-col items-center w-1/2">
                <div 
                    className="w-full h-24 bg-green-600 rounded-t-lg shadow-md flex flex-col justify-end text-white p-1"
                >
                    <span className="text-xs font-bold">BESS</span>
                </div>
                <ul className="text-xs mt-2 text-gray-400 space-y-1">
                    <li><CheckCircle className='w-3 h-3 inline text-green-400'/> Sustentável</li>
                    <li><CheckCircle className='w-3 h-3 inline text-green-400'/> Silencioso</li>
                    <li><CheckCircle className='w-3 h-3 inline text-green-400'/> Baixo O&M</li>
                </ul>
            </div>
            <div className="flex flex-col items-center w-1/2">
                <div 
                    className="w-full h-16 bg-red-600/80 rounded-t-lg shadow-md flex flex-col justify-end text-white p-1"
                >
                    <span className="text-xs font-bold">DIESEL</span>
                </div>
                <ul className="text-xs mt-2 text-gray-400 space-y-1">
                    <li><X className='w-3 h-3 inline text-red-500'/> Combustível (Custo)</li>
                    <li><X className='w-3 h-3 inline text-red-500'/> Poluente</li>
                    <li><X className='w-3 h-3 inline text-red-500'/> Manutenção Alta</li>
                </ul>
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Use este comparativo para justificar o investimento no BESS.</p>
    </div>
);

export const LoadCompositionChart: React.FC<{ cargas127V: number; cargas220V: number; cargas380V: number }> = ({ cargas127V, cargas220V, cargas380V }) => {
    const total = cargas127V + cargas220V + cargas380V;
    if (total === 0) return null;

    const percent127 = (cargas127V / total) * 100;
    const percent220 = (cargas220V / total) * 100;
    const percent380 = (cargas380V / total) * 100;

    return (
        <div className="p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 mt-4">
            <h4 className="font-semibold text-gray-300 mb-3">Gráfico 4: Decomposição das Cargas Prioritárias por Tensão</h4>
            <div className="h-6 w-full flex rounded-lg overflow-hidden bg-gray-700">
                {percent127 > 0 && (
                    <div
                        style={{ width: `${percent127}%` }}
                        className="bg-red-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                        title={`127V: ${percent127.toFixed(1)}%`}
                    >
                        {percent127 > 5 && `127V`}
                    </div>
                )}
                {percent220 > 0 && (
                    <div
                        style={{ width: `${percent220}%` }}
                        className="bg-yellow-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                        title={`220V: ${percent220.toFixed(1)}%`}
                    >
                        {percent220 > 5 && `220V`}
                    </div>
                )}
                {percent380 > 0 && (
                    <div
                        style={{ width: `${percent380}%` }}
                        className="bg-blue-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white"
                        title={`380V: ${percent380.toFixed(1)}%`}
                    >
                        {percent380 > 5 && `380V`}
                    </div>
                )}
            </div>
            <p className="text-sm mt-2 text-gray-400">Total: {total.toLocaleString('pt-BR')} Watts</p>
            <p className="text-xs text-gray-500">Ajuda a justificar a escolha do tipo de inversor e a necessidade de autotransformador.</p>
        </div>
    );
};
