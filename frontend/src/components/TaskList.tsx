import {
  AlertTriangle,
  Calendar,
  Check,
  ClipboardList,
  Flag,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Task, TaskPriority, ViewLayout } from '../types/task.ts';
import { formatDueDate, getRelativeDueLabel, isTaskOverdue } from '../utils/dateUtils.ts';

interface TaskListProps {
  tasks: Task[];
  totalCount: number;
  layout: ViewLayout;
  isLoading: boolean;
  togglingTaskId: string | null;
  hasActiveFilters: boolean;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCreateTask: () => void;
  onResetFilters: () => void;
}

const PRIORITY_STYLES: Record<TaskPriority, { text: string; icon: string }> = {
  High: { text: 'text-red-700 font-medium', icon: 'text-red-600' },
  Medium: { text: 'text-amber-700 font-medium', icon: 'text-amber-600' },
  Low: { text: 'text-blue-700 font-medium', icon: 'text-blue-600' },
};

export function TaskList({
  tasks,
  totalCount,
  layout,
  isLoading,
  togglingTaskId,
  hasActiveFilters,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onResetFilters,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    const isCompletelyEmpty = totalCount === 0 && !hasActiveFilters;
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">
          {isCompletelyEmpty ? 'No tasks yet' : 'No matching tasks found'}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-slate-500">
          {isCompletelyEmpty
            ? 'Create your first task with a due date and priority level to start tracking your daily progress.'
            : 'Try adjusting your search query, status tab, or priority filter to see other tasks.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              Clear Filters
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{isCompletelyEmpty ? 'Add First Task' : 'Add Task'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (layout === 'table') {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                <th className="w-12 px-4 py-3 text-center">Done</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                <th className="px-4 py-3 whitespace-nowrap">Due Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((task) => {
                const completed = task.status === 'Completed';
                const overdue = isTaskOverdue(task);
                const relativeLabel = getRelativeDueLabel(task.dueDate, task.status);
                const priorityStyle = PRIORITY_STYLES[task.priority];
                const isToggling = togglingTaskId === task.id;

                return (
                  <tr
                    key={task.id}
                    className={`transition-colors duration-150 hover:bg-slate-50/90 ${
                      completed ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => onToggleStatus(task)}
                        aria-label={
                          completed
                            ? `Mark "${task.title}" as pending`
                            : `Mark "${task.title}" as completed`
                        }
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          completed
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-blue-500'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>

                    <td className="max-w-md px-4 py-3">
                      <p
                        className={`font-medium ${
                          completed ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {task.description}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${priorityStyle.text}`}>
                        <Flag className={`h-3.5 w-3.5 ${priorityStyle.icon}`} aria-hidden="true" />
                        <span>{task.priority}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                        {overdue ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                        ) : (
                          <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        )}
                        <span className={overdue ? 'font-semibold text-red-600' : 'text-slate-600'}>
                          {formatDueDate(task.dueDate)}
                        </span>
                        {relativeLabel && (
                          <span
                            className={`font-sans text-xs ${
                              overdue ? 'font-medium text-red-600' : 'text-blue-600'
                            }`}
                          >
                            · {relativeLabel}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium ${
                          completed ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit "${task.title}"`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task)}
                          aria-label={`Delete "${task.title}"`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Card Layout
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
      {tasks.map((task) => {
        const completed = task.status === 'Completed';
        const overdue = isTaskOverdue(task);
        const relativeLabel = getRelativeDueLabel(task.dueDate, task.status);
        const priorityStyle = PRIORITY_STYLES[task.priority];
        const isToggling = togglingTaskId === task.id;

        return (
          <article
            key={task.id}
            className={`flex flex-col justify-between rounded-xl border p-5 transition-colors duration-150 ${
              completed
                ? 'border-slate-200 bg-slate-50/70'
                : 'border-slate-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                disabled={isToggling}
                onClick={() => onToggleStatus(task)}
                aria-label={
                  completed
                    ? `Mark "${task.title}" as pending`
                    : `Mark "${task.title}" as completed`
                }
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  completed
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-transparent hover:border-blue-500'
                }`}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <h3
                  className={`text-base font-semibold leading-snug ${
                    completed ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </h3>

                {task.description && (
                  <p
                    className={`mt-1.5 line-clamp-2 text-sm leading-relaxed ${
                      completed ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
              {/* Unboxed Metadata with Typographic Separators */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                <span className={`inline-flex items-center gap-1 ${priorityStyle.text}`}>
                  <Flag className={`h-3.5 w-3.5 ${priorityStyle.icon}`} aria-hidden="true" />
                  <span>{task.priority}</span>
                </span>

                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>

                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                    overdue ? 'font-semibold text-red-600' : 'text-slate-600'
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  )}
                  <span>{formatDueDate(task.dueDate)}</span>
                  {relativeLabel && (
                    <span className="font-sans font-medium">({relativeLabel})</span>
                  )}
                </span>

                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>

                <span
                  className={`font-medium ${
                    completed ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {task.status}
                </span>
              </div>

              {/* Card Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  aria-label={`Edit "${task.title}"`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task)}
                  aria-label={`Delete "${task.title}"`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
