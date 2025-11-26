

import React from 'react';
import { Zap, TrendingUp, ShieldCheck, X } from 'lucide-react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden transform transition-all scale-100">
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                        <Zap className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    
                    <h3 className="text-2xl font-extrabold text-white mb-2">
                        Desbloqueie o Potencial Máximo
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Seja um pioneiro: Venda sistemas com Baterias e esteja à frente da concorrência. O mercado mudou, lidere essa transformação.
                    </p>

                    <div className="space-y-4 text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-start">
                            <TrendingUp className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white text-sm">ROI Detalhado</h4>
                                <p className="text-xs text-slate-400">Gráficos de economia acumulada que comprovam o retorno.</p>
                            </div>
                        </div>
                         <div className="flex items-start">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Mitigação de Riscos</h4>
                                <p className="text-xs text-slate-400">Análise técnica de proteção para vender o contrato de O&M.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Zap className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Visualização Profissional</h4>
                                <p className="text-xs text-slate-400">Entregue um PDF com a sua marca e autoridade de engenharia.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1"
                    >
                        Quero Gerar meu Relatório Agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;