import { AlertCircle, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { NavSection, TaskStats } from '../types/task.ts';

interface StatsCardsProps {
  stats: TaskStats;
  onSelectSection: (section: NavSection) => void;
}

export function StatsCards({ stats, onSelectSection }: StatsCardsProps) {
  const cards = [
    {
      id: 'all' as NavSection,
      label: 'Total Tasks',
      value: stats.total,
      subtext: `${stats.completionRate}% overall completion`,
      icon: Layers,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'completed' as NavSection,
      label: 'Completed Tasks',
      value: stats.completed,
      subtext: stats.total > 0 ? `${stats.completed} of ${stats.total} finished` : 'No tasks yet',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'pending' as NavSection,
      label: 'Pending Tasks',
      value: stats.pending,
      subtext: stats.pending === 0 ? 'All caught up' : 'Active in queue',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'overdue' as NavSection,
      label: 'Overdue Tasks',
      value: stats.overdue,
      subtext: stats.overdue > 0 ? 'Past scheduled due date' : 'Nothing overdue',
      icon: AlertCircle,
      iconColor: stats.overdue > 0 ? 'text-red-600' : 'text-slate-500',
      iconBg: stats.overdue > 0 ? 'bg-red-50' : 'bg-slate-100',
      valueColor: stats.overdue > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ];

  return (
    <section aria-label="Task statistics overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectSection(card.id)}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} aria-hidden="true" />
              </span>
            </div>

            <div className="mt-3">
              <p className={`font-display text-3xl font-bold tracking-tight tabular-nums ${card.valueColor}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">{card.subtext}</p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
