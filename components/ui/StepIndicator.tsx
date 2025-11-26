
import React from 'react';
import { SystemType } from '../../types';

interface StepIndicatorProps {
    step: number;
    title: string;
    currentStep: number;
    systemType: SystemType | null;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, title, currentStep, systemType }) => {
    let actualStep = step;
    const isOng = systemType === 'ONG';

    if (isOng) {
        if (step === 3) return null;
        if (step === 4) actualStep = 3;
    }

    const isCurrent = currentStep === step;
    const isCompleted = currentStep > step;

    return (
        <div className="relative flex flex-col items-center z-10">
            <div
                className={`p-3 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-all duration-300 border-2 ${
                    isCurrent 
                        ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' 
                        : isCompleted 
                            ? 'bg-emerald-900/50 border-emerald-500 text-emerald-500' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
            >
                {actualStep}
            </div>
            <span 
                className={`absolute top-full mt-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                    isCurrent ? 'text-emerald-400' : isCompleted ? 'text-emerald-600' : 'text-slate-600'
                }`}
            >
                {title}
            </span>
        </div>
    );
};

export default StepIndicator;
