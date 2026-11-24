import type { Task } from '../types/task.ts';

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  if (task.status === 'Completed') {
    return false;
  }
  return task.dueDate < getTodayIsoDate();
}

export function formatDueDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getRelativeDueLabel(isoDate: string, status: Task['status']): string | null {
  if (status === 'Completed') {
    return null;
  }
  const today = getTodayIsoDate();
  if (isoDate < today) {
    return 'Overdue';
  }
  if (isoDate === today) {
    return 'Due today';
  }
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tYear = tomorrowDate.getFullYear();
  const tMonth = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
  const tDay = String(tomorrowDate.getDate()).padStart(2, '0');
  const tomorrow = `${tYear}-${tMonth}-${tDay}`;
  if (isoDate === tomorrow) {
    return 'Due tomorrow';
  }
  return null;
}
