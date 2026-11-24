import { LayoutGrid, Search, Table as TableIcon, X } from 'lucide-react';
import type {
  SortOption,
  TaskPriority,
  TaskStatus,
  ViewLayout,
} from '../types/task.ts';

interface TaskToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | 'All';
  onStatusFilterChange: (status: TaskStatus | 'All') => void;
  priorityFilter: TaskPriority | 'All';
  onPriorityFilterChange: (priority: TaskPriority | 'All') => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  layout: ViewLayout;
  onLayoutChange: (layout: ViewLayout) => void;
  disableStatusToggle?: boolean;
}

export function TaskToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  layout,
  onLayoutChange,
  disableStatusToggle = false,
}: TaskToolbarProps) {
  const statusOptions: Array<TaskStatus | 'All'> = ['All', 'Pending', 'Completed'];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter Tabs */}
          {!disableStatusToggle && (
            <div
              role="group"
              aria-label="Filter by status"
              className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
            >
              {statusOptions.map((option) => {
                const isActive = statusFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onStatusFilterChange(option)}
                    className={`min-h-[32px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Priority Select */}
          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriority | 'All')}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Sort Select */}
          <select
            aria-label="Sort tasks"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Newest</option>
          </select>

          {/* Cards vs Table Layout Switch */}
          <div
            role="group"
            aria-label="Task view layout"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => onLayoutChange('cards')}
              aria-label="Card layout"
              title="Card layout"
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                layout === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange('table')}
              aria-label="Table layout"
              title="Table layout"
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                layout === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
