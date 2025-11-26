import React from 'react';
import { FileText, Printer, MapPin, Battery, Zap, ShieldCheck, TrendingUp, BarChart3, DollarSign, Check, Quote, Lock, User, Calendar, HardHat, Layers, Grid3x3, Cpu, Power } from 'lucide-react';
import { ReportContent, ProjectData, CalculationResults } from '../types';
import { MODULE_POWER_Wp } from '../constants';
import { BatteryCycleChart, EconomyAreaChart, ProposalLoadChart, ZeroGridSchematic } from './PremiumCharts';

interface ReportDisplayProps {
    content: ReportContent;
    projectData: ProjectData;
    results: CalculationResults;
}

// Helper para formatar texto em negrito dentro da string da IA
const formatBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-900 font-bold">$1</strong>');
};

// Renderizador de Texto Rico Melhorado
const RichTextRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    
    const sections = text.split('\n\n');

    return (
        <div className="space-y-6 text-slate-700 text-base leading-relaxed text-justify font-normal">
            {sections.map((section, idx) => {
                const cleanSection = section.trim();
                if (!cleanSection) return null;

                // Listas (Bullets)
                if (cleanSection.startsWith('* ') || cleanSection.startsWith('- ') || cleanSection.includes('\n- ') || cleanSection.includes('\n* ')) {
                    const items = cleanSection.split('\n').filter(l => l.trim().length > 0);
                    return (
                        <div key={idx} className="grid gap-3 my-5 pl-2">
                            {items.map((item, i) => {
                                const content = item.replace(/^[\*\-]\s*/, '');
                                return (
                                    <div key={i} className="flex items-start group break-inside-avoid">
                                        <div className="mt-1.5 mr-4 flex-shrink-0 bg-emerald-100 text-emerald-700 rounded-full p-0.5">
                                            <Check className="w-4 h-4" strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-700 group-hover:text-slate-900 transition-colors" dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
                                    </div>
                                );
                            })}
                        </div>
                    );
                }

                // Títulos Numéricos (ex: 1. Introdução)
                if (/^\d+\./.test(cleanSection)) {
                     return (
                        <h4 key={idx} className="text-emerald-950 font-bold text-xl mt-8 mb-4 flex items-center pb-2 border-b border-emerald-100/50" dangerouslySetInnerHTML={{ __html: formatBold(cleanSection) }} />
                     );
                }

                // Parágrafos
                return (
                    <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(cleanSection) }} />
                );
            })}
        </div>
    );
};

// Card Técnico Refinado
const SpecCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ElementType }> = ({ label, value, sub, icon: Icon }) => (
    <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-200/60 break-inside-avoid relative overflow-hidden">
        <div className="absolute right-0 top-0 p-2 opacity-5">
            <Icon className="w-16 h-16" />
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100 mr-4 z-10">
            <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
            {sub && <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>}
        </div>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
    <div className="flex items-center mb-6 mt-2 break-after-avoid">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl text-white shadow-md shadow-emerald-200 mr-4">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
            <div className="h-1 w-12 bg-emerald-500 rounded-full mt-1"></div>
        </div>
    </div>
);

const ReportDisplay: React.FC<ReportDisplayProps> = ({ content, projectData, results }) => {
    
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Proposta_${projectData.cliente.replace(/\s+/g, '_')}_${projectData.systemType}`;
        window.print();
        document.title = originalTitle;
    };

    const economyVal = parseFloat(results.economiaMensalEstimada);
    const annualEconomy = (economyVal * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const monthlyEconomyFmt = economyVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isHybrid = projectData.systemType === 'HIB';
    const isOng = projectData.systemType === 'ONG'; 

    return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            {/* BARRA DE AÇÕES (DIGITAL) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl">
                <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-emerald-400"/> 
                        </div>
                        Proposta Comercial Gerada
                    </h3>
                    <p className="text-slate-400 mt-1 ml-11 text-sm">Documento pronto para apresentação.</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="group flex items-center bg-white text-slate-900 hover:bg-emerald-50 text-sm font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 transform hover:-translate-y-0.5"
                >
                    <Printer className="w-5 h-5 mr-2 text-emerald-600 group-hover:scale-110 transition-transform" /> 
                    Gerar PDF / Imprimir
                </button>
            </div>

            {/* --- DOCUMENTO A4 --- */}
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto shadow-2xl overflow-hidden print:shadow-none print:m-0 print:max-w-none relative flex flex-col font-sans text-slate-800">
                
                {/* CABEÇALHO EXECUTIVO */}
                <header className="bg-[#0f172a] text-white relative overflow-hidden print:bg-[#0f172a] print:text-white">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="relative z-10 p-10 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest">
                                        Estudo de Viabilidade
                                    </span>
                                </div>
                                <h1 className="text-4xl font-extrabold tracking-tight leading-none text-white mb-2">
                                    Proposta Técnica
                                </h1>
                                <p className="text-lg text-slate-400 font-light">Solução de Energia & Armazenamento Inteligente</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black tracking-tighter text-white">SOLAR<span className="text-emerald-500">BESS</span></div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.4em] mt-1">Engineering</div>
                            </div>
                        </div>

                        {/* DADOS ESTRUTURADOS */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 grid grid-cols-10 gap-6">
                            <div className="col-span-4">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-1.5 bg-blue-500/20 rounded-md"><User className="w-3 h-3 text-blue-400"/></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cliente</p>
                                </div>
                                <p className="text-lg font-bold text-white truncate pl-9">{projectData.cliente}</p>
                            </div>
                            <div className="col-span-3 border-l border-white/10 pl-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-md"><MapPin className="w-3 h-3 text-emerald-400"/></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Local</p>
                                </div>
                                <p className="text-base font-medium text-slate-200 pl-9">{projectData.cidade}, {projectData.estado}</p>
                            </div>
                            <div className="col-span-3 border-l border-white/10 pl-6">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-1.5 bg-amber-500/20 rounded-md"><HardHat className="w-3 h-3 text-amber-400"/></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Integrador</p>
                                </div>
                                <p className="text-base font-medium text-slate-200 pl-9">{projectData.integrador}</p>
                            </div>
                        </div>
                    </div>
                    {/* Barra decorativa */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600"></div>
                </header>

                {/* CONTEÚDO DO RELATÓRIO */}
                <div className="p-10 pt-12 space-y-12 flex-grow bg-white">
                    
                    {/* 1. APRESENTAÇÃO */}
                    <section>
                        <SectionHeader icon={Quote} title="Resumo Executivo" />
                        <div className="relative bg-slate-50 p-8 rounded-2xl border-l-4 border-emerald-500 shadow-sm">
                            <Quote className="absolute top-6 left-6 w-8 h-8 text-slate-200 rotate-180" />
                            <div className="relative z-10 pl-4">
                                <RichTextRenderer text={content.text} />
                            </div>
                        </div>
                    </section>

                    {/* 2. ESPECIFICAÇÕES TÉCNICAS (GRID DE CARDS) */}
                    <section className="break-inside-avoid">
                        <SectionHeader icon={Layers} title="Especificações do Sistema" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <SpecCard 
                                label="Potência Solar" 
                                value={`${results.potenciaPvKwP} kWp`} 
                                sub={`${results.numModulos}x Módulos ${MODULE_POWER_Wp}W`} 
                                icon={Grid3x3} 
                            />
                            <SpecCard 
                                label="Inversor" 
                                value={`${results.potenciaInversorKw} kW`} 
                                sub={results.suggestedInverterBess || 'Tecnologia Avançada'} 
                                icon={Cpu} 
                            />
                            <SpecCard 
                                label="Armazenamento" 
                                value={isOng ? 'N/A' : `${results.energiaBessKwh} kWh`} 
                                sub={isOng ? 'Conexão On-Grid' : `${projectData.horasBackup}h Autonomia Estimada`} 
                                icon={Battery} 
                            />
                            <SpecCard 
                                label="Conexão" 
                                value={projectData.systemVoltage} 
                                sub="Tensão Nominal CA" 
                                icon={Zap} 
                            />
                        </div>
                        
                        <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg"><Power className="w-4 h-4 text-slate-600"/></div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Carga Total</p>
                                    <p className="text-sm font-bold text-slate-800">{results.totalLoadWatts.toLocaleString()} Watts</p>
                                </div>
                             </div>
                             <div className="w-1/2">
                                <ProposalLoadChart 
                                    cargas127V={results.cargas127V}
                                    cargas220V={results.cargas220V}
                                    cargas380V={results.cargas380V}
                                />
                             </div>
                        </div>
                    </section>

                    {/* 3. FINANCEIRO & ROI */}
                    {!isOng && ( 
                    <section className="break-inside-avoid">
                        <SectionHeader icon={DollarSign} title="Análise Financeira" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Card de Destaque ROI */}
                            <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white p-8 shadow-xl">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Economia Projetada</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-extrabold tracking-tight">{monthlyEconomyFmt}</span>
                                            <span className="text-lg text-slate-400 font-medium">/mês</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-2">Estimativa baseada na tarifa local de R$ {projectData.custoKwh}/kWh</p>
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Acumulado Anual</p>
                                                <p className="text-2xl font-bold text-white">{annualEconomy}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-slate-400">Retorno (Payback)</p>
                                                <p className="text-xl font-bold text-emerald-400">~3.5 Anos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Lista de Benefícios */}
                            <div className="flex flex-col justify-center gap-4">
                                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-blue-50 rounded-xl"><ShieldCheck className="w-6 h-6 text-blue-600" /></div>
                                    <div>
                                        <p className="font-bold text-slate-800">Segurança Energética</p>
                                        <p className="text-sm text-slate-500">Blindagem contra aumentos de tarifa e apagões.</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="p-3 bg-amber-50 rounded-xl"><Zap className="w-6 h-6 text-amber-600" /></div>
                                    <div>
                                        <p className="font-bold text-slate-800">Qualidade de Energia</p>
                                        <p className="text-sm text-slate-500">Estabilidade de tensão para equipamentos sensíveis.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    )}

                    {/* 4. ZERO GRID (Condicional) */}
                    {projectData.usaraZeroGrid && (
                        <section className="break-inside-avoid">
                            <SectionHeader icon={Lock} title="Tecnologia Zero Grid" />
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                                <div className="md:col-span-1 space-y-4">
                                    <h4 className="font-bold text-slate-800">Anti-Injeção Ativa</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        O sistema monitora o consumo em tempo real e modula a geração solar para garantir que <strong>zero energia</strong> seja exportada para a rede.
                                    </p>
                                    <div className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                                        <Check className="w-3 h-3 mr-1.5" /> Conformidade Garantida
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <ZeroGridSchematic />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 5. GRÁFICOS DE PERFORMANCE */}
                    <section className="break-inside-avoid">
                        <SectionHeader icon={BarChart3} title="Performance Estimada" />
                        <div className={`grid grid-cols-1 ${isOng ? '' : 'md:grid-cols-2'} gap-8`}>
                            {!isOng && (
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Ciclo Diário</p>
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-[10px] text-slate-400">Bateria</span>
                                        </div>
                                    </div>
                                    <BatteryCycleChart />
                                </div>
                            )}
                            <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${isOng ? 'max-w-3xl mx-auto w-full' : ''}`}>
                                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-6">Projeção Acumulada (10 Anos)</p>
                                <EconomyAreaChart monthlySavings={economyVal} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* RODAPÉ */}
                <footer className="bg-slate-50 p-8 border-t border-slate-200 text-center mt-auto print:bg-slate-50">
                    <div className="flex justify-center gap-10 mb-6 opacity-70">
                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Check className="w-3 h-3 mr-1.5 text-emerald-500" /> Alta Performance
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Check className="w-3 h-3 mr-1.5 text-emerald-500" /> LiFePO4 Technology
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Check className="w-3 h-3 mr-1.5 text-emerald-500" /> Garantia Estendida
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                        <p>Documento gerado automaticamente pela plataforma SolarBESS AI Studio em {new Date().toLocaleDateString()}.</p>
                        <p>© {new Date().getFullYear()} Todos os direitos reservados. A eficácia do sistema depende das condições de instalação.</p>
                    </div>
                </footer>

            </div>

            {/* CSS PRINT OPTIMIZATION */}
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { 
                        background: white; 
                    }
                    .print\\:hidden { display: none !important; }
                    /* Forçar backgrounds para impressão */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    /* Ajustes de margem e sombra */
                    .bg-white { box-shadow: none !important; }
                    header { padding-top: 30px !important; }
                }
            `}</style>
        </div>
    );
};

export default ReportDisplay;