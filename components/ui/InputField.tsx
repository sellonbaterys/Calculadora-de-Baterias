
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    Icon: LucideIcon;
    description?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type, value, onChange, Icon, description, ...props }) => {
    const displayValue = (type === 'number' && isNaN(Number(value))) ? '' : value;

    return (
        <div className="group">
            <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center transition-colors group-focus-within:text-emerald-400">
                <Icon className="w-4 h-4 mr-2 text-slate-500 group-focus-within:text-emerald-500" /> {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={displayValue}
                    onChange={onChange}
                    className="w-full p-3 pl-4 border border-gray-800 bg-gray-950 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition duration-200 shadow-inner outline-none placeholder-slate-600"
                    {...props}
                />
            </div>
            {description && <p className="mt-1.5 text-xs text-slate-500">{description}</p>}
        </div>
    );
};

export default InputField;
