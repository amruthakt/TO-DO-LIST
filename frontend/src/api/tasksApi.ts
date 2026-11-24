import type {
  SortOption,
  Task,
  TaskFormData,
  TaskPriority,
  TaskStats,
  TaskStatus,
} from '../types/task.ts';

export interface FetchTasksParams {
  status?: TaskStatus | 'All';
  priority?: TaskPriority | 'All';
  search?: string;
  overdueOnly?: boolean;
  sortBy?: SortOption;
}

export interface TasksListResponse {
  tasks: Task[];
  stats: TaskStats;
}

export interface TaskMutationResponse {
  task: Task;
  message: string;
}

export interface TaskDeleteResponse {
  deletedId: string;
  message: string;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const tasksApi = {
  async list(params: FetchTasksParams = {}): Promise<TasksListResponse> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.overdueOnly) query.set('overdueOnly', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString();
    const response = await fetch(`/api/tasks${qs ? `?${qs}` : ''}`);
    return parseJsonResponse<TasksListResponse>(response);
  },

  async create(payload: TaskFormData): Promise<TaskMutationResponse> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJsonResponse<TaskMutationResponse>(response);
  },

  async update(id: string, payload: Partial<TaskFormData>): Promise<TaskMutationResponse> {
    const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJsonResponse<TaskMutationResponse>(response);
  },

  async toggleStatus(id: string, status: TaskStatus): Promise<TaskMutationResponse> {
    const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return parseJsonResponse<TaskMutationResponse>(response);
  },

  async remove(id: string): Promise<TaskDeleteResponse> {
    const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return parseJsonResponse<TaskDeleteResponse>(response);
  },
};
