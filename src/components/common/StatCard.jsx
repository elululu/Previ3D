import React from 'react';
import Tooltip from './Tooltip';
import { Info } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon, color, smallText }) => (
  <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <Tooltip text={subtext}>
        <Info size={16} className="text-gray-400 cursor-pointer" />
      </Tooltip>
    </div>
    <div>
      <p className="text-gray-500 mt-3 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {smallText && <p className="text-xs text-gray-500 mt-1">{smallText}</p>}
    </div>
  </div>
);

export default StatCard;
