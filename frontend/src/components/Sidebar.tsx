import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Clock,
  LayoutDashboard,
  ListTodo,
  X,
} from 'lucide-react';
import type { NavSection, TaskStats } from '../types/task.ts';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  stats: TaskStats;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: NavSection;
  label: string;
  count?: number;
  icon: typeof LayoutDashboard;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  stats,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const navItems: NavItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all', label: 'All Tasks', count: stats.total, icon: ListTodo },
    { id: 'pending', label: 'Pending Tasks', count: stats.pending, icon: Clock },
    { id: 'completed', label: 'Completed Tasks', count: stats.completed, icon: CheckCircle2 },
    { id: 'overdue', label: 'Overdue', count: stats.overdue, icon: AlertTriangle },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg py-1"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CheckSquare className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TaskFlow
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-medium text-slate-400">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isOverdueAlert = item.id === 'overdue' && (item.count ?? 0) > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex min-h-[42px] w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-blue-600'
                        : isOverdueAlert
                          ? 'text-red-500'
                          : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </span>

                {item.count !== undefined && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive
                        ? 'font-semibold text-blue-700'
                        : isOverdueAlert
                          ? 'font-semibold text-red-600'
                          : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Progress Indicator */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span>Completion Progress</span>
              <span className="font-mono font-semibold text-blue-600 tabular-nums">
                {stats.completionRate}%
              </span>
            </div>

            <div
              className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuenow={stats.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall task completion progress"
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>

            <p className="mt-2.5 text-xs text-slate-500 tabular-nums">
              {stats.completed} of {stats.total} {stats.total === 1 ? 'task' : 'tasks'} completed
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
