// src/components/Select.tsx
import React from 'react';

interface SelectProps {
  value: string | readonly string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  label?: string;
  multiple?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, children, disabled = false, className = '', multiple = false }) => {
  const id = label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined;

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        id={id}
        multiple={multiple}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;