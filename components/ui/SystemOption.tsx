import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SystemOptionProps {
    icon: LucideIcon;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

const SystemOption: React.FC<SystemOptionProps> = ({ icon: Icon, title, description, isSelected, onClick }) => (
    <div
        className={`relative p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center text-center h-full group overflow-hidden ${
            isSelected
                ? 'border-emerald-500 bg-slate-800 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]'
                : 'border-slate-700 bg-slate-900 hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-1'
        } text-white`}
        onClick={onClick}
    >
        {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
        )}
        
        <div className={`p-3 rounded-full mb-3 transition-colors duration-300 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'}`}>
            <Icon className="w-8 h-8" />
        </div>
        
        <h4 className={`font-bold text-lg mb-2 ${isSelected ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'}`}>{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
);

export default SystemOption;