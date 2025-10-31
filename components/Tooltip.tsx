import React from 'react';
import { Info } from './icons';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <span className="group relative inline-flex items-center">
      <Info className="ml-1 h-4 w-4 cursor-pointer text-gray-500" />
      <span className="pointer-events-none invisible absolute left-1/2 top-full z-10 mt-1 w-64 -translate-x-1/2 rounded-md bg-gray-800 p-2 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:visible group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export default Tooltip;
