import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResultItemProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    description: string;
    highlight?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ icon: Icon, title, value, description, highlight = false }) => (
    <div className={`flex items-start p-4 rounded-xl border transition-all duration-300 h-full ${highlight ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}`}>
        <div className={`p-3 rounded-lg mr-4 shrink-0 ${highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
            <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1 leading-snug">{description}</p>
        </div>
    </div>
);

export default ResultItem;