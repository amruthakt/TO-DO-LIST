export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed';

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskQueryFilters {
  status?: TaskStatus | 'All';
  priority?: TaskPriority | 'All';
  search?: string;
  overdueOnly?: boolean;
  sortBy?: 'dueDate' | 'priority' | 'newest';
}

export interface PriorityBreakdown {
  total: number;
  completed: number;
  pending: number;
}

export interface TaskStatsDTO {
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
