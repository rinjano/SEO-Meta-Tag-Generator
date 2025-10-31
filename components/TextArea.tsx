import React from 'react';
import Tooltip from './Tooltip';

interface TextAreaProps {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  helper?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, tooltip, value, onChange, placeholder, rows = 4, helper }) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-800">
        {label}
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </label>
      <textarea
        className="w-full rounded-2xl border px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {helper ? <p className="text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

export default TextArea;
