
import React from 'react';
import { Zap, Home, Server, Activity, Ban, Sun } from 'lucide-react';

// --- Helper para Gráfico de Ciclo de Bateria Suave (SVG Area) ---
const generateBatteryProfile = () => {
    const hours = Array.from({ length: 25 }, (_, i) => i); // 0 to 24
    const batteryLevel = hours.map(h => {
        if (h < 6) return 30 - (h * 1.5); // Madrugada
        if (h < 8) return 20; // Mínimo
        if (h < 13) return 20 + ((h - 7) * 14); // Carga Rápida
        if (h < 16) return 90 + ((h - 13) * 3.3); // Topo
        if (h === 16) return 100; 
        if (h < 18) return 98; 
        if (h < 22) return 98 - ((h - 17) * 16); // Descarga Ponta
        return 34 - ((h - 21) * 2); // Final
    }).map(v => Math.max(5, Math.min(100, v)));

    // Curva Solar Simulada (Sino)
    const solarGeneration = hours.map(h => {
        if (h < 6 || h > 18) return 0;
        // Parabólica simples centrada em 12h
        return 100 * (1 - Math.pow((h - 12) / 6, 2)); 
    }).map(v => Math.max(0, v));

    return { batteryLevel, solarGeneration };
};

export const BatteryCycleChart: React.FC = () => {
    const { batteryLevel, solarGeneration } = generateBatteryProfile();
    const width = 100;
    const height = 50;
    const maxX = batteryLevel.length - 1;
    const maxY = 100;

    // Função para criar string de path SVG
    const createPath = (data: number[]) => {
        return data.map((y, i) => {
            const xCoord = (i / maxX) * width;
            const yCoord = height - (y / maxY) * height;
            return `${xCoord},${yCoord}`;
        }).join(' ');
    };

    const batPoints = createPath(batteryLevel);
    const solPoints = createPath(solarGeneration);

    const batArea = `M0,${height} ${batPoints} L${width},${height} Z`;
    
    return (
        <div className="w-full group relative">
            <div className="relative w-full aspect-[2.5/1] max-h-56">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                        </linearGradient>
                         <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#f1f5f9" strokeWidth="0.2" />
                    <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#f1f5f9" strokeWidth="0.2" />
                    <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#f1f5f9" strokeWidth="0.2" />

                    {/* Curva Solar (Fundo) */}
                    <path d={`M0,${height} ${solPoints} L${width},${height} Z`} fill="url(#solarGradient)" />
                    <path d={`M${solPoints}`} fill="none" stroke="#fbbf24" strokeWidth="0.4" strokeDasharray="1,1" />

                    {/* Curva Bateria (Frente) */}
                    <path d={batArea} fill="url(#batteryGradient)" />
                    <path d={`M${batPoints}`} fill="none" stroke="#059669" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Marcadores Interativos (Pontos Chave) */}
                    <circle cx={width * (12/24)} cy={height - (batteryLevel[12]/maxY)*height} r="1.5" fill="white" stroke="#059669" strokeWidth="0.5" className="transition-all group-hover:r-2" />
                    <circle cx={width * (19/24)} cy={height - (batteryLevel[19]/maxY)*height} r="1.5" fill="white" stroke="#ef4444" strokeWidth="0.5" className="transition-all group-hover:r-2" />
                </svg>

                {/* Labels Flutuantes */}
                <div className="absolute top-0 right-0 flex space-x-3 text-[8px] font-medium">
                    <div className="flex items-center text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Nível Bateria</div>
                    <div className="flex items-center text-amber-500"><div className="w-2 h-2 rounded-full bg-amber-400 mr-1"></div> Geração Solar</div>
                </div>
                
                {/* Tooltips Estáticos (Print Friendly) */}
                <div className="absolute top-[35%] left-[45%] text-[9px] text-emerald-700 font-bold bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-emerald-100 backdrop-blur-sm">
                    Carga Solar Máxima
                </div>
                <div className="absolute top-[45%] left-[76%] text-[9px] text-red-600 font-bold bg-white/80 px-1.5 py-0.5 rounded shadow-sm border border-red-100 backdrop-blur-sm">
                    Descarga na Ponta
                </div>
            </div>
            
            {/* Eixo X */}
            <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono border-t border-slate-100 pt-1">
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
            </div>
        </div>
    );
};

// --- Gráfico de ROI Acumulado (Moderno) ---
export const EconomyAreaChart: React.FC<{ monthlySavings: number }> = ({ monthlySavings }) => {
    const years = Array.from({ length: 11 }, (_, i) => i); // Ano 0 a 10
    const projection = years.map(y => {
        if (y === 0) return 0;
        let total = 0;
        for(let i=0; i<y; i++) { total += (monthlySavings * 12) * Math.pow(1.08, i); }
        return total;
    });
    
    const maxVal = projection[10];
    const width = 100;
    const height = 50;

    const points = projection.map((val, i) => {
        const x = (i / 10) * width;
        const y = height - (val / maxVal) * height;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M0,${height} ${points} L${width},${height} Z`;

    return (
        <div className="w-full">
            <div className="relative w-full aspect-[2.5/1] max-h-56">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    
                    {/* Linhas de Grade */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2={height} stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2"/>

                    {/* Gráfico */}
                    <path d={areaPath} fill="url(#roiGradient)" />
                    <path d={`M${points}`} fill="none" stroke="#0284c7" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Marcador Final */}
                    <circle cx={width} cy="0" r="1.5" fill="#0284c7" stroke="white" strokeWidth="0.5" />
                </svg>
                
                {/* Valor Final Destacado */}
                <div className="absolute -top-4 right-0 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md border border-sky-100 shadow-sm">
                    R$ {maxVal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
            </div>
             <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono border-t border-slate-100 pt-1">
                <span>Hoje</span>
                <span>2 Anos</span>
                <span>5 Anos</span>
                <span>8 Anos</span>
                <span>10 Anos</span>
            </div>
        </div>
    );
};

// --- Gráfico de Cargas (Minimalista) ---
export const ProposalLoadChart: React.FC<{ cargas127V: number; cargas220V: number; cargas380V: number }> = ({ cargas127V, cargas220V, cargas380V }) => {
    const total = cargas127V + cargas220V + cargas380V;
    if (total === 0) return null;

    const percent127 = (cargas127V / total) * 100;
    const percent220 = (cargas220V / total) * 100;
    const percent380 = (cargas380V / total) * 100;

    return (
        <div className="w-full space-y-2">
            <div className="h-6 w-full flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
                {percent127 > 0 && (
                    <div style={{ width: `${percent127}%` }} className="bg-rose-500" />
                )}
                {percent220 > 0 && (
                    <div style={{ width: `${percent220}%` }} className="bg-amber-400" />
                )}
                {percent380 > 0 && (
                    <div style={{ width: `${percent380}%` }} className="bg-sky-500" />
                )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
                <div className="flex gap-3">
                    {percent127 > 0 && <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1"></div>127V</span>}
                    {percent220 > 0 && <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-amber-400 mr-1"></div>220V</span>}
                    {percent380 > 0 && <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-sky-500 mr-1"></div>380V</span>}
                </div>
                <span className="font-mono font-bold text-slate-700">{total.toLocaleString('pt-BR')} W</span>
            </div>
        </div>
    );
};

// --- Esquema Zero Grid (Diagrama Técnico Clean) ---
export const ZeroGridSchematic: React.FC = () => {
    return (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center shadow-sm">
            <div className="relative w-full max-w-md aspect-[2.2/1]">
                <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                    <defs>
                        <marker id="arrow-grey" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L0,8 L8,4 z" fill="#94a3b8" />
                        </marker>
                         <marker id="arrow-energy" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                            <path d="M0,0 L0,8 L8,4 z" fill="#f59e0b" />
                        </marker>
                    </defs>

                    {/* Linhas Base */}
                    <line x1="40" y1="90" x2="360" y2="90" stroke="#e2e8f0" strokeWidth="2" />

                    {/* Rede */}
                    <g transform="translate(20, 60)">
                        <rect width="40" height="60" rx="4" fill="#1e293b" />
                        <Server className="w-5 h-5 text-white" x="10" y="10" />
                        <text x="20" y="50" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">GRID</text>
                    </g>

                    {/* Smart Meter (TC) */}
                    <g transform="translate(100, 75)">
                        <circle cx="15" cy="15" r="20" fill="white" stroke="#10b981" strokeWidth="2" />
                        <Activity className="w-6 h-6 text-emerald-600" x="3" y="3" />
                        <text x="15" y="-10" textAnchor="middle" fontSize="9" fill="#059669" fontWeight="bold">SMART METER</text>
                    </g>
                    
                    {/* Inversor */}
                    <g transform="translate(200, 110)">
                        <rect width="60" height="40" rx="6" fill="#f59e0b" />
                        <Zap className="w-6 h-6 text-white" x="17" y="8" />
                    </g>
                    
                    {/* Conexão Inversor -> Linha */}
                    <line x1="230" y1="110" x2="230" y2="90" stroke="#f59e0b" strokeWidth="3" />

                     {/* Cargas */}
                     <g transform="translate(340, 60)">
                        <rect width="50" height="50" rx="8" fill="#3b82f6" />
                        <Home className="w-8 h-8 text-white" x="9" y="9" />
                        <text x="25" y="70" textAnchor="middle" fontSize="9" fill="#1d4ed8" fontWeight="bold">CASA</text>
                    </g>

                    {/* Bloqueio Visual */}
                    <g transform="translate(70, 80)">
                         <Ban className="w-6 h-6 text-rose-500 bg-white rounded-full" />
                    </g>

                    {/* Linha de Comunicação */}
                    <path d="M115,95 C115,130 180,130 200,130" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                    
                    {/* Fluxo de Energia (Setas) */}
                    <line x1="230" y1="90" x2="330" y2="90" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-energy)" />
                    <line x1="130" y1="90" x2="180" y2="90" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-grey)" />

                </svg>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 mt-2">
                <div className="flex items-center"><div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div> Controle RS485</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></div> Energia Solar</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-rose-500 rounded-full mr-1.5"></div> Bloqueio Exportação</div>
            </div>
        </div>
    );
};
