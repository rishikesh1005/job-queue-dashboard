import React from 'react';
import { StatusCounts } from '../types';
import { Layers, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export const MetricsCards: React.FC<{ counts: StatusCounts }> = ({ counts }) => {
  const cards = [
    { label: 'Total Jobs', count: counts.all, icon: Layers, color: 'text-slate-700 bg-slate-100' },
    { label: 'Pending', count: counts.pending, icon: Clock, color: 'text-amber-700 bg-amber-100' },
    { label: 'Running', count: counts.running, icon: PlayCircle, color: 'text-blue-700 bg-blue-100' },
    { label: 'Completed', count: counts.completed, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Failed', count: counts.failed, icon: XCircle, color: 'text-rose-700 bg-rose-100' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.color}`}><Icon className="h-4 w-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{card.count}</div>
          </div>
        );
      })}
    </div>
  );
};
