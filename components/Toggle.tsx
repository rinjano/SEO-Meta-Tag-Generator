import React from 'react';
import Tooltip from './Tooltip';

interface ToggleProps {
  label: string;
  tooltip?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, tooltip, checked, onChange }) => {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="flex items-center gap-1 text-gray-800">
        {label}
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </span>
    </label>
  );
}

export default Toggle;
