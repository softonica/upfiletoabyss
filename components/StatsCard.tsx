import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, colorClass }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs uppercase font-semibold">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;