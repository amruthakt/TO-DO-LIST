import type { TaskPriority, TaskStats } from '../types/task.ts';

interface AnalyticsChartsProps {
  stats: TaskStats;
  selectedPriority: TaskPriority | 'All';
  onSelectPriority: (priority: TaskPriority | 'All') => void;
}

export function AnalyticsCharts({
  stats,
  selectedPriority,
  onSelectPriority,
}: AnalyticsChartsProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const completedArc =
    stats.total > 0 ? (stats.completed / stats.total) * circumference : 0;
  const onTrackPending = Math.max(0, stats.pending - stats.overdue);
  const onTrackArc =
    stats.total > 0 ? (onTrackPending / stats.total) * circumference : 0;
  const overdueArc =
    stats.total > 0 ? (stats.overdue / stats.total) * circumference : 0;

  const priorities: Array<{
    key: TaskPriority;
    label: string;
    barColor: string;
    textColor: string;
  }> = [
    { key: 'High', label: 'High Priority', barColor: 'bg-red-500', textColor: 'text-red-700' },
    { key: 'Medium', label: 'Medium Priority', barColor: 'bg-amber-500', textColor: 'text-amber-700' },
    { key: 'Low', label: 'Low Priority', barColor: 'bg-blue-500', textColor: 'text-blue-700' },
  ];

  const maxPriorityCount = Math.max(
    1,
    stats.byPriority.High.total,
    stats.byPriority.Medium.total,
    stats.byPriority.Low.total,
  );

  return (
    <section
      aria-label="Task progress and priority analytics"
      className="grid grid-cols-1 gap-5 lg:grid-cols-2"
    >
      {/* Completion Progress Ring Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Task Completion Progress</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Live ratio of completed, pending, and overdue items
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-blue-600 tabular-nums">
            {stats.completionRate}%
          </span>
        </div>

        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 132 132" aria-hidden="true">
              {/* Track */}
              <circle
                cx="66"
                cy="66"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              {/* Completed arc */}
              {completedArc > 0 && (
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDasharray={`${completedArc} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all duration-300 ease-out"
                />
              )}
              {/* Pending on-track arc */}
              {onTrackArc > 0 && (
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDasharray={`${onTrackArc} ${circumference}`}
                  strokeDashoffset={-completedArc}
                  className="transition-all duration-300 ease-out"
                />
              )}
              {/* Overdue arc */}
              {overdueArc > 0 && (
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDasharray={`${overdueArc} ${circumference}`}
                  strokeDashoffset={-(completedArc + onTrackArc)}
                  className="transition-all duration-300 ease-out"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-2xl font-bold text-slate-900 tabular-nums">
                {stats.completionRate}%
              </span>
              <span className="text-xs text-slate-500">Done</span>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" aria-hidden="true" />
                Completed
              </span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {stats.completed}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-300" aria-hidden="true" />
                Pending (On Track)
              </span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {onTrackPending}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500" aria-hidden="true" />
                Overdue
              </span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {stats.overdue}
              </span>
            </div>

            <div className="pt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution Chart Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Tasks by Priority</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Click any priority row to filter the task list
            </p>
          </div>
          {selectedPriority !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectPriority('All')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap shrink-0"
            >
              Show all
            </button>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {priorities.map((item) => {
            const breakdown = stats.byPriority[item.key];
            const totalPct = Math.round((breakdown.total / maxPriorityCount) * 100);
            const completedWithinPct =
              breakdown.total > 0 ? Math.round((breakdown.completed / breakdown.total) * 100) : 0;
            const isSelected = selectedPriority === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectPriority(isSelected ? 'All' : item.key)}
                className={`block w-full rounded-lg p-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${isSelected ? 'text-blue-700' : item.textColor}`}>
                    {item.label}
                  </span>
                  <span className="font-mono text-xs text-slate-600 tabular-nums">
                    {breakdown.completed} done · {breakdown.pending} pending ({breakdown.total} total)
                  </span>
                </div>

                <div className="mt-2 h-3 w-full overflow-hidden rounded-md bg-slate-100">
                  <div
                    className="relative h-full overflow-hidden rounded-md bg-slate-300 transition-all duration-300 ease-out"
                    style={{ width: `${totalPct}%` }}
                  >
                    <div
                      className={`h-full transition-all duration-300 ease-out ${item.barColor}`}
                      style={{ width: `${completedWithinPct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
