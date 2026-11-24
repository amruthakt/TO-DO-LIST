import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskFormData, TaskPriority, TaskStatus } from '../types/task.ts';
import { getTodayIsoDate } from '../utils/dateUtils.ts';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  isSubmitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

interface FieldErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

export function TaskFormModal({
  isOpen,
  editingTask,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayIsoDate());
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayIsoDate());
      setPriority('Medium');
      setStatus('Pending');
    }
    setErrors({});
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      nextErrors.title = 'Please enter a task title.';
    } else if (trimmedTitle.length > 120) {
      nextErrors.title = 'Title must be 120 characters or fewer.';
    }

    if (description.trim().length > 1000) {
      nextErrors.description = 'Description must be 1000 characters or fewer.';
    }

    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      nextErrors.dueDate = 'Please select a valid due date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="task-modal-title" className="text-lg font-semibold text-slate-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              autoFocus
              maxLength={120}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Prepare quarterly budget review"
              className={`mt-1.5 h-10 w-full rounded-lg border px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {description.length}/1000
              </span>
            </div>
            <textarea
              id="task-description"
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Add helpful context, acceptance criteria, or notes..."
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Due Date, Priority, Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                className={`mt-1.5 h-10 w-full rounded-lg border px-3 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.dueDate
                    ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Form Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[40px] rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Saving...'
                : editingTask
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
