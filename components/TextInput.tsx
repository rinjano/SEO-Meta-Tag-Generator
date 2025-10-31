import React from 'react';
import Tooltip from './Tooltip';

interface TextInputProps {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, tooltip, value, onChange, placeholder, helper }) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-800">
        {label}
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </label>
      <input
        className="w-full rounded-2xl border px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {helper ? <p className="text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

export default TextInput;
