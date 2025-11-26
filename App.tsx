
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    Zap, BatteryCharging, Sunrise, Scale, CheckCircle, Lightbulb, Loader, 
    AlertCircle, AlertTriangle, Home, HardHat, ChevronsRight, ChevronsLeft, TrendingUp, 
    Sun, MapPin, Map, Globe, MinusSquare, DollarSign, Power, Grid3x3, Cpu, Info
} from 'lucide-react';

import { ProjectData, CalculationResults, ReportContent } from './types';
import { BRAZILIAN_STATES, MODULE_POWER_Wp, BESS_BATTERY_CAPACITY_KWH, FATOR_COMPENSACAO_LIQUIDA, getCities, getTariffData } from './constants';
import { calculateDimensioning } from './utils/calculations';
import { generateReport } from './services/geminiService';

import InputField from './components/ui/InputField';
import SystemOption from './components/ui/SystemOption';
import ResultItem from './components/ui/ResultItem';
import StepIndicator from './components/ui/StepIndicator';
import ToggleSwitch from './components/ui/ToggleSwitch';
import ReportDisplay from './components/ReportDisplay';
import PremiumModal from './components/PremiumModal';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [projectData, setProjectData] = useState<ProjectData>({
        systemType: null,
        consumoMensalKWh: 800,
        kWhApuradosMes: 0,
        horasBackup: 4,
        cargas127V: 1500,
        cargas220V: 3500,
        cargas380V: 0,
        fatorSimultaneidade: 0.8,
        systemVoltage: '220V',
        tipoTarifa: 'B',
        usaraZeroGrid: false,
        integrador: 'Solar Tech Integration',
        cliente: 'Cliente Padrão',
        cidade: 'São Paulo',
        estado: 'SP',
        distribuidora: 'Enel SP',
        custoKwh: 0.85,
        isMobileApplication: false
    });

    const [results, setResults] = useState<CalculationResults | null>(null);
    const [reportContent, setReportContent] = useState<ReportContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showInfoSimultaneidade, setShowInfoSimultaneidade] = useState(false);

    useEffect(() => {
        if (projectData.estado && projectData.cidade) {
            const data = getTariffData(projectData.estado, projectData.cidade);
            setProjectData(prev => ({
                ...prev,
                distribuidora: data.distributor,
                custoKwh: data.price
            }));
        }
    }, [projectData.cidade, projectData.estado]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (results && !reportContent) {
            timer = setTimeout(() => {
                setShowPremiumModal(true);
            }, 3000); 
        }
        return () => clearTimeout(timer);
    }, [results, reportContent]);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const novoEstado = e.target.value;
        const cities = getCities(novoEstado);
        setProjectData(prevData => ({
            ...prevData,
            estado: novoEstado,
            cidade: cities[0] || 'Selecione uma cidade'
        }));
        setError(null);
    };

    const handleGenerateReport = async () => {
        if (!results) {
            setError("Por favor, calcule o dimensionamento primeiro.");
            return;
        }
        setIsLoading(true);
        setReportContent(null);
        setError(null);

        try {
            const content = await generateReport(projectData, results);
            setReportContent(content);
        } catch (err) {
            setError("Falha ao gerar o relatório. Verifique sua conexão ou tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalculate = useCallback(() => {
        const res = calculateDimensioning(projectData);
        setResults(res);
        setReportContent(null);
        setError(null);
    }, [projectData]);

    const handleNext = () => {
        const isBess = projectData.systemType === 'HIB' || projectData.systemType === 'OFF';
        const isOng = projectData.systemType === 'ONG';

        if (!projectData.systemType && currentStep === 1) {
            setError("Por favor, selecione o tipo de sistema para avançar.");
            return;
        }

        if (currentStep === 2) {
            if (!projectData.integrador || !projectData.cliente || !projectData.cidade || !projectData.estado) {
                 setError("Por favor, preencha todos os campos de identificação.");
                 return;
            }
            if ((isOng || projectData.systemType === 'HIB') && projectData.consumoMensalKWh <= 0) {
                 setError("Para On-Grid/Híbrido, o Consumo Mensal deve ser maior que zero (kWh).");
                 return;
            }
            const totalLoadWatts = projectData.cargas127V + projectData.cargas220V + projectData.cargas380V;
            if (projectData.systemType === 'OFF' && projectData.kWhApuradosMes <= 0 && totalLoadWatts === 0) {
                 setError("Para o sistema Off-Grid, você deve preencher o Consumo Médio Apurado OU o Detalhe das Cargas Prioritárias.");
                 return;
            }
        }
        
        if (currentStep === 3 && isBess) {
             if (projectData.fatorSimultaneidade <= 0 || projectData.horasBackup <= 0) {
                 setError("Por favor, preencha todos os campos de Fator e Horas de Backup com valores válidos (> 0).");
                 return;
            }
             const totalLoadWatts = projectData.cargas127V + projectData.cargas220V + projectData.cargas380V;
             const consumoApuradoUsado = projectData.systemType === 'OFF' && projectData.kWhApuradosMes > 0 && totalLoadWatts === 0;

             if (totalLoadWatts <= 0 && !consumoApuradoUsado) {
                 setError("A Potência Total das Cargas Prioritárias deve ser maior que zero (Watts).");
                 return;
             }
        }

        if (isOng && currentStep === 2) {
            setCurrentStep(4);
            setResults(null); 
            setReportContent(null);
            setError(null);
            return;
        }
        
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            setResults(null);
            setReportContent(null);
            setError(null);
        }
    };

    const handleBack = () => {
        setReportContent(null);
        
        if (projectData.systemType === 'ONG' && currentStep === 4) {
             setCurrentStep(2);
             setResults(null);
             setError(null);
             return;
        }
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setResults(null);
            setError(null);
        }
    };

    const renderFormStep = () => {
        const isBess = projectData.systemType === 'HIB' || projectData.systemType === 'OFF';
        const isOff = projectData.systemType === 'OFF';

        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 fade-in">
                        <div className="border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-bold text-white">Selecione o Sistema</h3>
                            <p className="text-sm text-slate-400">Defina a arquitetura do projeto.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SystemOption 
                                icon={Sun} 
                                title="On Grid" 
                                description="Conectado à rede. Foco em economia na fatura."
                                isSelected={projectData.systemType === 'ONG'}
                                onClick={() => { setProjectData(p => ({ ...p, systemType: 'ONG', usaraZeroGrid: false, kWhApuradosMes: 0, horasBackup: 4 })); setReportContent(null); }}
                            />
                            <SystemOption 
                                icon={BatteryCharging} 
                                title="Híbrido" 
                                description="Conectado + Baterias. Backup e segurança energética."
                                isSelected={projectData.systemType === 'HIB'}
                                onClick={() => { setProjectData(p => ({ ...p, systemType: 'HIB', horasBackup: 4 })); setReportContent(null); }}
                            />
                            <SystemOption 
                                icon={Globe} 
                                title="Off Grid" 
                                description="Isolado (Autônomo). Locais remotos sem rede."
                                isSelected={projectData.systemType === 'OFF'}
                                onClick={() => { setProjectData(p => ({ ...p, systemType: 'OFF', usaraZeroGrid: false, horasBackup: 24 })); setReportContent(null); }}
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-5 fade-in">
                        <div className="border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-bold text-white">Dados do Projeto</h3>
                            <p className="text-sm text-slate-400">Identificação e local de instalação.</p>
                        </div>
                        <InputField 
                            label="Nome do Integrador"
                            name="integrador"
                            type="text"
                            value={projectData.integrador}
                            onChange={(e) => setProjectData({ ...projectData, integrador: e.target.value })}
                            Icon={HardHat}
                            placeholder="Ex: Solar Tech"
                            required
                        />
                        <InputField 
                            label="Cliente Final"
                            name="cliente"
                            type="text"
                            value={projectData.cliente}
                            onChange={(e) => setProjectData({ ...projectData, cliente: e.target.value })}
                            Icon={Home}
                            placeholder="Ex: Indústria ABC Ltda"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center">
                                    <Map className="w-4 h-4 mr-2 text-slate-500" /> Estado
                                </label>
                                <div className="relative">
                                    <select
                                        name="estado"
                                        value={projectData.estado}
                                        onChange={handleStateChange}
                                        className="w-full p-3 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 outline-none appearance-none shadow-inner"
                                        required
                                    >
                                        <option value="" disabled>UF</option>
                                        {BRAZILIAN_STATES.map(state => (
                                            <option key={state.uf} value={state.uf}>{state.nome}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-500" /> Cidade
                                </label>
                                <div className="relative">
                                    <select
                                        name="cidade"
                                        value={projectData.cidade}
                                        onChange={(e) => setProjectData({ ...projectData, cidade: e.target.value })}
                                        className="w-full p-3 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 outline-none appearance-none shadow-inner"
                                        required
                                    >
                                        {getCities(projectData.estado).map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {!isOff && (
                            <InputField 
                                label="Consumo Mensal Médio (kWh)"
                                name="consumoMensalKWh"
                                type="number"
                                value={projectData.consumoMensalKWh}
                                onChange={(e) => setProjectData({ ...projectData, consumoMensalKWh: parseFloat(e.target.value) })}
                                Icon={Sunrise}
                                min="1"
                                description="Média dos últimos 12 meses da fatura de energia."
                            />
                        )}
                        {isOff && (
                            <>
                                <InputField 
                                    label="Consumo Real Apurado (kWh/mês)"
                                    name="kWhApuradosMes"
                                    type="number"
                                    value={projectData.kWhApuradosMes}
                                    onChange={(e) => setProjectData({ ...projectData, kWhApuradosMes: parseFloat(e.target.value) })}
                                    Icon={Sunrise}
                                    min="0"
                                    description="Base de cálculo para autonomia (se não detalhar cargas)."
                                />
                                
                                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Utilização em ambientes móveis (Motorhome/Veículos náuticos/Stand)?
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="isMobileApplication"
                                            value={projectData.isMobileApplication ? "true" : "false"}
                                            onChange={(e) => setProjectData({ ...projectData, isMobileApplication: e.target.value === "true" })}
                                            className="w-full p-3 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 outline-none appearance-none shadow-inner"
                                        >
                                            <option value="false">Não (Residência/Sítio Fixo)</option>
                                            <option value="true">Sim (Veículo/Barco/Stand)</option>
                                        </select>
                                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>

                                    {projectData.isMobileApplication && (
                                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                                            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-amber-500" />
                                            <div>
                                                <strong className="block mb-1 text-amber-400">Atenção: Restrição de Espaço</strong>
                                                Esse dimensionamento requer um estudo mais apurado, pois muito provavelmente não terá espaço suficiente para conseguir carregar as baterias via solar. O recomendado é projetar para carregar as baterias diretamente da rede elétrica (Dock Station) ou Alternador.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 3:
                if (!isBess) return null;
                return (
                    <div className="space-y-5 fade-in">
                        <div className="border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-bold text-white">Mapeamento de Cargas</h3>
                            <p className="text-sm text-slate-400">Detalhamento para dimensionamento preciso.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField 
                                label="Cargas 127V (W)"
                                name="cargas127V"
                                type="number"
                                value={projectData.cargas127V}
                                onChange={(e) => setProjectData({ ...projectData, cargas127V: parseFloat(e.target.value) })}
                                Icon={MinusSquare}
                                min="0"
                            />
                            <InputField 
                                label="Cargas 220V (W)"
                                name="cargas220V"
                                type="number"
                                value={projectData.cargas220V}
                                onChange={(e) => setProjectData({ ...projectData, cargas220V: parseFloat(e.target.value) })}
                                Icon={MinusSquare}
                                min="0"
                            />
                            <InputField 
                                label="Cargas 380V (W)"
                                name="cargas380V"
                                type="number"
                                value={projectData.cargas380V}
                                onChange={(e) => setProjectData({ ...projectData, cargas380V: parseFloat(e.target.value) })}
                                Icon={MinusSquare}
                                min="0"
                            />
                        </div>
                        <p className="text-xs text-amber-400/80 bg-amber-900/20 p-3 rounded-lg border border-amber-900/50 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/> 
                            Preencha apenas as tensões existentes. Deixe 0 para as demais.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div>
                                <InputField 
                                    label="Simultaneidade (0.1 - 1.0)"
                                    name="fatorSimultaneidade"
                                    type="number"
                                    value={projectData.fatorSimultaneidade}
                                    onChange={(e) => setProjectData({ ...projectData, fatorSimultaneidade: parseFloat(e.target.value) })}
                                    Icon={Scale}
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowInfoSimultaneidade(!showInfoSimultaneidade)}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 underline mt-1.5 flex items-center transition-colors"
                                >
                                    <Info className="w-3 h-3 mr-1" />
                                    {showInfoSimultaneidade ? "Ocultar explicação" : "Como definir este valor?"}
                                </button>
                                {showInfoSimultaneidade && (
                                    <div className="mt-2 p-3 bg-gray-950 rounded-lg border border-gray-800 text-xs text-slate-300 space-y-2 animate-in fade-in slide-in-from-top-2 shadow-inner">
                                        <p><strong className="text-white">O que é:</strong> Define a % da carga total que será usada <em>ao mesmo tempo</em>. Evita comprar inversor maior que o necessário.</p>
                                        <ul className="space-y-1.5 border-t border-gray-800 pt-2 mt-2">
                                            <li className="flex items-start">
                                                <span className="text-emerald-400 font-bold mr-2 w-16">0.4 - 0.5</span>
                                                <span><strong className="text-white">Residencial:</strong> Geladeira liga/desliga, luzes só à noite, uso esporádico.</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-emerald-400 font-bold mr-2 w-16">0.6 - 0.8</span>
                                                <span><strong className="text-white">Comercial:</strong> Ar-condicionado, PCs e iluminação ligados o dia todo.</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-emerald-400 font-bold mr-2 w-16">1.0</span>
                                                <span><strong className="text-white">Industrial:</strong> Máquinas críticas que operam 100% do tempo.</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <InputField 
                                label="Autonomia (Horas)"
                                name="horasBackup"
                                type="number"
                                value={projectData.horasBackup}
                                onChange={(e) => setProjectData({ ...projectData, horasBackup: parseFloat(e.target.value) })}
                                Icon={BatteryCharging}
                                min="1"
                                description="Tempo desejado de backup."
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-5 fade-in">
                         <div className="border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-xl font-bold text-white">Cenário Técnico</h3>
                            <p className="text-sm text-slate-400">Definições finais de conexão.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center">
                                <Power className="w-4 h-4 mr-2 text-slate-500" /> Tensão de Entrada (Rede)
                            </label>
                            <div className="relative">
                                <select
                                    name="systemVoltage"
                                    value={projectData.systemVoltage}
                                    onChange={(e) => setProjectData({ ...projectData, systemVoltage: e.target.value })}
                                    className="w-full p-3 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 outline-none appearance-none shadow-inner"
                                >
                                    <option value="127V">127V (Monofásico)</option>
                                    <option value="220V">220V (Monofásico/Bifásico)</option>
                                    <option value="220V Trifásico">220V (Trifásico)</option>
                                    <option value="380V">380V (Trifásico)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>
                        {!isOff && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center">
                                        <Scale className="w-4 h-4 mr-2 text-slate-500" /> Grupo Tarifário
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="tipoTarifa"
                                            value={projectData.tipoTarifa}
                                            onChange={(e) => setProjectData({ ...projectData, tipoTarifa: e.target.value })}
                                            className="w-full p-3 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 outline-none appearance-none shadow-inner"
                                        >
                                            <option value="B">Grupo B (Baixa Tensão)</option>
                                            <option value="A">Grupo A (Alta Tensão)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField 
                                        label="Distribuidora"
                                        name="distribuidora"
                                        type="text"
                                        value={projectData.distribuidora}
                                        onChange={(e) => setProjectData({ ...projectData, distribuidora: e.target.value })}
                                        Icon={Zap}
                                        readOnly={true}
                                        description="Definida pela cidade."
                                        className="w-full p-3 pl-4 border border-gray-800 bg-gray-950 text-slate-400 rounded-xl shadow-inner"
                                    />
                                    <InputField 
                                        label="Tarifa (R$/kWh)"
                                        name="custoKwh"
                                        type="number"
                                        value={projectData.custoKwh}
                                        onChange={(e) => setProjectData({ ...projectData, custoKwh: parseFloat(e.target.value) })}
                                        Icon={DollarSign}
                                        min="0.01"
                                        step="0.01"
                                        description="Estimativa local."
                                    />
                                </div>
                            </>
                        )}
                        {(projectData.systemType === 'HIB' || projectData.systemType === 'ONG') && (
                            <ToggleSwitch 
                                label="Zero Grid (Anti-Injeção)"
                                description="Bloqueia injeção na rede (requer Smart Meter/TC)."
                                checked={projectData.usaraZeroGrid}
                                onChange={(e) => setProjectData({ ...projectData, usaraZeroGrid: e.target.checked })}
                            />
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transform hover:-translate-y-0.5"
                        >
                            <Zap className="w-5 h-5 mr-2 animate-pulse" />
                            Processar Dimensionamento
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const ResultsCard = useMemo(() => {
        if (!results) return null;
        const isBess = projectData.systemType === 'HIB' || projectData.systemType === 'OFF';
        const isOng = projectData.systemType === 'ONG';
        const isPV = isBess || isOng;

        const effectiveLoadKw = parseFloat(results.effectiveLoadKw);
        const energyBessKwh = parseFloat(results.energiaBessKwh);

        if (isBess) {
            const totalInverterPower = results.potenciaInversorKw;

            return (
                <div className="bg-black/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-500 text-white fade-in">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center">
                                <CheckCircle className="w-6 h-6 mr-3 text-emerald-500" /> 
                                Resultado do Dimensionamento
                            </h3>
                            <p className="text-sm text-slate-400 mt-1 ml-9">Sistema {projectData.systemType === 'HIB' ? 'Híbrido' : 'Off-Grid'} Otimizado</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            Engenharia Validada
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <ResultItem 
                            icon={Cpu} 
                            title="Inversor Sugerido" 
                            value={`${totalInverterPower} kW`} 
                            description={`Modelo: ${results.suggestedInverterBess}`}
                            highlight
                        />
                         <ResultItem 
                            icon={BatteryCharging} 
                            title="Banco de Baterias" 
                            value={`${energyBessKwh} kWh`} 
                            description={`${results.numBaterias}x Módulos de ${BESS_BATTERY_CAPACITY_KWH}kWh`}
                            highlight
                        />
                        <ResultItem 
                            icon={Grid3x3} 
                            title="Potência Solar Estimada" 
                            value={`${results.potenciaPvKwP} kWp`} 
                            description="Capacidade de geração instalada"
                        />
                         <ResultItem 
                            icon={Zap} 
                            title="Energia Efetiva" 
                            value={`${effectiveLoadKw} kW`} 
                            description="Energia instantânea apurada"
                        />
                    </div>

                    <div className="mt-2 mb-6 p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-start gap-3 text-xs text-slate-400">
                        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p>
                            <strong>Nota de Engenharia:</strong> Os valores apresentados são estimativas técnicas baseadas nos dados de entrada e no HSP médio da região. 
                            O desempenho real pode variar conforme condições climáticas, sombreamento e perfil de uso.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isLoading || (isPV && Number(results.potenciaPvKwP) <= 0)}
                            className="w-full group relative flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-emerald-500 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            {isLoading ? (
                                <div className="flex items-center">
                                    <Loader className="w-5 h-5 mr-3 animate-spin text-white" />
                                    <span>Consolidando Engenharia e Viabilidade Financeira...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Lightbulb className="w-5 h-5 mr-3 text-yellow-300" />
                                    <span>Gerar Relatório Premium</span>
                                </div>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-3">
                            Monetize este projeto gerando uma proposta completa com análise de riscos.
                        </p>
                    </div>
                </div>
            );
        }

        // ON-GRID VIEW
        return (
            <div className="bg-black/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-800 transition-all duration-500 text-white fade-in">
                <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center">
                            <CheckCircle className="w-6 h-6 mr-3 text-emerald-500" /> 
                            Resultado do Dimensionamento
                        </h3>
                        <p className="text-sm text-slate-400 mt-1 ml-9">Sistema On-Grid Conectado</p>
                    </div>
                     <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        Solar Puro
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ResultItem 
                        icon={Grid3x3} 
                        title="Potência Solar Estimada" 
                        value={`${results.potenciaPvKwP} kWp`} 
                        description="Capacidade de geração instalada"
                        highlight
                    />
                    <ResultItem 
                        icon={Cpu} 
                        title="Inversor Sugerido" 
                        value={`${results.suggestedInverterPvKw} kW`} 
                        description="Tecnologia On-Grid (150% Overload)"
                        highlight
                    />
                     <ResultItem 
                        icon={Zap} 
                        title="Produção Estimada" 
                        value={`${(results.dailyProductionKwh * 30).toFixed(0)} kWh/mês`} 
                        description={`Baseado em HSP de ${results.hspUsado}`}
                    />
                     <ResultItem 
                        icon={Scale} 
                        title="Tensão de Conexão" 
                        value={projectData.systemVoltage} 
                        description="Padrão de Entrada"
                    />
                </div>

                <div className="mt-2 mb-6 p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-start gap-3 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Nota de Engenharia:</strong> Os valores apresentados são estimativas técnicas baseadas nos dados de entrada e no HSP médio da região. 
                        O desempenho real pode variar conforme condições climáticas, sombreamento e perfil de uso.
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800">
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading || (isPV && Number(results.potenciaPvKwP) <= 0)}
                         className="w-full group relative flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-emerald-500 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        {isLoading ? (
                             <div className="flex items-center">
                                <Loader className="w-5 h-5 mr-3 animate-spin text-white" />
                                <span>Consolidando Engenharia e Viabilidade Financeira...</span>
                            </div>
                        ) : (
                             <div className="flex items-center">
                                <Lightbulb className="w-5 h-5 mr-3 text-yellow-300" />
                                <span>Gerar Relatório Premium</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        );
    }, [results, isLoading, handleGenerateReport, projectData]);

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black p-4 sm:p-8 font-sans text-slate-200">
            <header className="mb-10 text-center fade-in">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md animate-pulse">
                        <BatteryCharging className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 mb-3 tracking-tight drop-shadow-lg">
                    Calculadora de Baterias
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                    Plataforma avançada para dimensionamento de sistemas fotovoltaicos e armazenamento de energia (BESS).
                </p>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-800 sticky top-8">
                        <div className="flex justify-between items-center mb-10 px-2">
                            <StepIndicator step={1} title="Sistema" currentStep={currentStep} systemType={projectData.systemType} />
                            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-500 ${currentStep > 1 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            <StepIndicator step={2} title="Dados" currentStep={currentStep} systemType={projectData.systemType} />
                            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-500 ${currentStep > 2 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            <StepIndicator step={3} title="Cargas" currentStep={currentStep} systemType={projectData.systemType} />
                            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors duration-500 ${currentStep > 3 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                            <StepIndicator step={4} title="Rede" currentStep={currentStep} systemType={projectData.systemType} />
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 4) handleCalculate(); }} className="space-y-6 min-h-[400px] flex flex-col justify-between">
                            {renderFormStep()}
                            
                            <div className="flex justify-between pt-6 border-t border-gray-800 mt-auto">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={currentStep === 1 || isLoading}
                                    className="flex items-center text-slate-400 hover:text-white font-medium py-2 px-4 transition-colors disabled:opacity-0"
                                >
                                    <ChevronsLeft className="w-5 h-5 mr-1" /> Voltar
                                </button>

                                {currentStep < 4 && (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isLoading || (currentStep === 1 && !projectData.systemType)}
                                        className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 border border-gray-600 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        Próximo <ChevronsRight className="w-5 h-5 ml-1" />
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-900/20 text-red-400 rounded-xl flex items-start border border-red-900/50 text-sm animate-pulse">
                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> 
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    {ResultsCard}
                    {reportContent && <ReportDisplay content={reportContent} projectData={projectData} results={results} />}
                </div>
            </main>
            
            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        </div>
    );
};

export default App;
