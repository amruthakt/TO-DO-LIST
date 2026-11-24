export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface PriorityBreakdown {
  total: number;
  completed: number;
  pending: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  byPriority: {
    High: PriorityBreakdown;
    Medium: PriorityBreakdown;
    Low: PriorityBreakdown;
  };
}

export type NavSection = 'overview' | 'all' | 'pending' | 'completed' | 'overdue';
export type ViewLayout = 'cards' | 'table';
export type SortOption = 'dueDate' | 'priority' | 'newest';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}
