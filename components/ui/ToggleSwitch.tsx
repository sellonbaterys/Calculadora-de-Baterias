
import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    description: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-gray-700 shadow-inner">
        <div className="flex-1 pr-3">
            <label htmlFor="toggle-zero-grid" className="text-sm font-medium text-gray-300 cursor-pointer block">
                {label}
            </label>
            <p className="text-xs text-green-500 mt-1">{description}</p>
        </div>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
                type="checkbox"
                name="toggle-zero-grid"
                id="toggle-zero-grid"
                checked={checked}
                onChange={onChange}
                className="
                    toggle-checkbox
                    absolute block
                    w-4 h-4
                    rounded-full
                    bg-white
                    border-4
                    appearance-none
                    cursor-pointer
                    top-1
                    left-1
                    transition-transform duration-200 ease-in-out
                    checked:translate-x-full
                    checked:border-green-500
                "
            />
            <label
                htmlFor="toggle-zero-grid"
                className={`
                    toggle-label
                    block overflow-hidden h-6 rounded-full
                    cursor-pointer
                    ${checked ? 'bg-green-600' : 'bg-gray-600'}
                    transition-colors duration-200 ease-in-out
                    w-10 h-6
                `}
            ></label>
        </div>
    </div>
);

export default ToggleSwitch;
