import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { tasksApi } from './api/tasksApi.ts';
import { AnalyticsCharts } from './components/AnalyticsCharts.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { TaskFormModal } from './components/TaskFormModal.tsx';
import { TaskList } from './components/TaskList.tsx';
import { TaskToolbar } from './components/TaskToolbar.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import type {
  NavSection,
  SortOption,
  Task,
  TaskFormData,
  TaskPriority,
  TaskStats,
  TaskStatus,
  ToastMessage,
  ViewLayout,
} from './types/task.ts';

const EMPTY_STATS: TaskStats = {
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0,
  completionRate: 0,
  byPriority: {
    High: { total: 0, completed: 0, pending: 0 },
    Medium: { total: 0, completed: 0, pending: 0 },
    Low: { total: 0, completed: 0, pending: 0 },
  },
};

const SECTION_META: Record<NavSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Monitor task completion progress, priorities, and upcoming deadlines.',
  },
  all: {
    title: 'All Tasks',
    subtitle: 'View and manage every task in your workspace.',
  },
  pending: {
    title: 'Pending Tasks',
    subtitle: 'Active tasks scheduled for completion.',
  },
  completed: {
    title: 'Completed Tasks',
    subtitle: 'Archive of finished tasks across all priority levels.',
  },
  overdue: {
    title: 'Overdue Tasks',
    subtitle: 'Pending tasks whose scheduled due date has passed.',
  },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Navigation & Filters
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [layout, setLayout] = useState<ViewLayout>('cards');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Modals & Mutations
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formServerError, setFormServerError] = useState<string | null>(null);

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const effectiveStatusFilter: TaskStatus | 'All' = useMemo(() => {
    if (activeSection === 'pending' || activeSection === 'overdue') return 'Pending';
    if (activeSection === 'completed') return 'Completed';
    return statusFilter;
  }, [activeSection, statusFilter]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoadError(null);
      const result = await tasksApi.list({
        status: effectiveStatusFilter,
        priority: priorityFilter,
        search: searchQuery,
        overdueOnly: activeSection === 'overdue',
        sortBy,
      });
      setTasks(result.tasks);
      setStats(result.stats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load tasks.';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveStatusFilter, priorityFilter, searchQuery, activeSection, sortBy]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    if (section === 'pending') {
      setStatusFilter('Pending');
    } else if (section === 'completed') {
      setStatusFilter('Completed');
    } else if (section === 'all' || section === 'overview') {
      setStatusFilter('All');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormServerError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormServerError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: TaskFormData) => {
    setIsSubmitting(true);
    setFormServerError(null);
    try {
      if (editingTask) {
        const res = await tasksApi.update(editingTask.id, formData);
        pushToast('success', res.message || 'Task updated successfully.');
      } else {
        const res = await tasksApi.create(formData);
        pushToast('success', res.message || 'Task created successfully.');
      }
      setIsFormOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save task.';
      setFormServerError(message);
      pushToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTogglingTaskId(task.id);
    try {
      await tasksApi.toggleStatus(task.id, nextStatus);
      pushToast(
        'success',
        nextStatus === 'Completed' ? 'Task marked as completed.' : 'Task reopened as pending.',
      );
      await fetchTasks();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task status.';
      pushToast('error', message);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      const res = await tasksApi.remove(deletingTask.id);
      pushToast('success', res.message || 'Task deleted successfully.');
      setDeletingTask(null);
      await fetchTasks();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task.';
      pushToast('error', message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    if (activeSection === 'overview' || activeSection === 'all') {
      setStatusFilter('All');
    } else {
      setActiveSection('all');
      setStatusFilter('All');
    }
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    priorityFilter !== 'All' ||
    (activeSection === 'overview' && statusFilter !== 'All') ||
    (activeSection === 'all' && statusFilter !== 'All');

  const sectionInfo = SECTION_META[activeSection];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        stats={stats}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 truncate text-sm">
              <span className="hidden text-slate-400 sm:inline">Workspace</span>
              <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
                /
              </span>
              <span className="truncate font-semibold text-slate-900">{sectionInfo.title}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Heading */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">
                {sectionInfo.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{sectionInfo.subtitle}</p>
            </div>
            <p className="font-mono text-xs text-slate-500 tabular-nums">
              Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          {loadError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => void fetchTasks()}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {/* Overview shows KPI cards + Analytics Charts */}
          {activeSection === 'overview' && (
            <>
              <StatsCards stats={stats} onSelectSection={handleSelectSection} />
              <AnalyticsCharts
                stats={stats}
                selectedPriority={priorityFilter}
                onSelectPriority={setPriorityFilter}
              />
            </>
          )}

          {/* Dedicated views show compact progress summary bar */}
          {activeSection !== 'overview' && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span className="text-slate-600 tabular-nums">
                  Total: <strong className="font-semibold text-slate-900">{stats.total}</strong>
                </span>
                <span className="text-slate-600 tabular-nums">
                  Pending: <strong className="font-semibold text-slate-900">{stats.pending}</strong>
                </span>
                <span className="text-slate-600 tabular-nums">
                  Completed:{' '}
                  <strong className="font-semibold text-emerald-700">{stats.completed}</strong>
                </span>
                <span className="text-slate-600 tabular-nums">
                  Overdue:{' '}
                  <strong
                    className={`font-semibold ${stats.overdue > 0 ? 'text-red-600' : 'text-slate-900'}`}
                  >
                    {stats.overdue}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-semibold text-blue-600 tabular-nums">
                  {stats.completionRate}% done
                </span>
              </div>
            </div>
          )}

          {/* Task Toolbar + List */}
          <section aria-label="Task list workspace" className="space-y-4">
            <TaskToolbar
              search={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={effectiveStatusFilter}
              onStatusFilterChange={(status) => {
                setStatusFilter(status);
                if (activeSection === 'pending' || activeSection === 'completed' || activeSection === 'overdue') {
                  setActiveSection('all');
                }
              }}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              layout={layout}
              onLayoutChange={setLayout}
              disableStatusToggle={
                activeSection === 'pending' ||
                activeSection === 'completed' ||
                activeSection === 'overdue'
              }
            />

            <TaskList
              tasks={tasks}
              totalCount={stats.total}
              layout={layout}
              isLoading={isLoading}
              togglingTaskId={togglingTaskId}
              hasActiveFilters={hasActiveFilters}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={setDeletingTask}
              onCreateTask={handleOpenCreateModal}
              onResetFilters={handleResetFilters}
            />
          </section>
        </main>
      </div>

      {/* Modals & Notifications */}
      <TaskFormModal
        isOpen={isFormOpen}
        editingTask={editingTask}
        isSubmitting={isSubmitting}
        serverError={formServerError}
        onClose={() => {
          if (!isSubmitting) {
            setIsFormOpen(false);
            setEditingTask(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        task={deletingTask}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
