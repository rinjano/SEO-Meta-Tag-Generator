import React, { useState } from 'react';
import Tooltip from './Tooltip';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  helper?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, tooltip, value, onChange, options = [], helper }) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const tooltipMap: { [key: string]: string } = {
    Service: "Gunakan untuk halaman layanan (mis. Gerbang Pembayaran). JSON-LD: Service.",
    Article: "Untuk artikel, postingan blog, atau konten edukasi. JSON-LD: Article.",
    WebPage: "Untuk halaman umum (mis. landing, beranda, kontak). JSON-LD: WebPage.",
  };

  return (
    <div className="space-y-1 relative">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-800">
        {label}
        {tooltip ? <Tooltip text={tooltip} /> : null}
      </label>
      <select
        className="w-full rounded-2xl border bg-white px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseLeave={() => setHoveredOption(null)}
      >
        {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
                <option
                    key={val}
                    value={val}
                    onMouseEnter={() => setHoveredOption(val)}
                    onMouseLeave={() => setHoveredOption(null)}
                >
                    {lbl}
                </option>
            )
        })}
      </select>

      {hoveredOption && tooltipMap[hoveredOption] && (
        <div className="absolute left-1/2 top-full z-10 mt-1 w-72 -translate-x-1/2 rounded-md bg-gray-800 p-2 text-xs text-white shadow-lg">
          {tooltipMap[hoveredOption]}
        </div>
      )}

      {helper ? <p className="text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}

export default SelectField;