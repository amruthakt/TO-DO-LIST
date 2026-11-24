import type { NextFunction, Request, Response } from 'express';
import type {
  CreateTaskInput,
  TaskPriority,
  TaskQueryFilters,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task.ts';

const VALID_PRIORITIES = new Set<TaskPriority>(['High', 'Medium', 'Low']);
const VALID_STATUSES = new Set<TaskStatus>(['Pending', 'Completed']);
const VALID_SORTS = new Set<NonNullable<TaskQueryFilters['sortBy']>>(['dueDate', 'priority', 'newest']);
const SAFE_ID_PATTERN = /^[a-fA-F0-9]{24}$|^[a-zA-Z0-9_-]{8,64}$/;

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateTaskIdParam(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  if (typeof id !== 'string' || !SAFE_ID_PATTERN.test(id)) {
    res.status(400).json({ error: 'Invalid task identifier.' });
    return;
  }
  next();
}

export function parseTaskQueryFilters(query: Request['query']): TaskQueryFilters {
  const filters: TaskQueryFilters = {};

  if (typeof query.status === 'string') {
    if (query.status === 'All' || VALID_STATUSES.has(query.status as TaskStatus)) {
      filters.status = query.status as TaskStatus | 'All';
    }
  }

  if (typeof query.priority === 'string') {
    if (query.priority === 'All' || VALID_PRIORITIES.has(query.priority as TaskPriority)) {
      filters.priority = query.priority as TaskPriority | 'All';
    }
  }

  if (typeof query.search === 'string') {
    filters.search = query.search.slice(0, 120);
  }

  if (query.overdueOnly === 'true') {
    filters.overdueOnly = true;
  }

  if (typeof query.sortBy === 'string' && VALID_SORTS.has(query.sortBy as NonNullable<TaskQueryFilters['sortBy']>)) {
    filters.sortBy = query.sortBy as TaskQueryFilters['sortBy'];
  }

  return filters;
}

export function validateCreateTaskBody(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be a valid JSON object.' });
    return;
  }

  const errors: Record<string, string> = {};

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.title = 'Task title is required.';
  } else if (body.title.trim().length > 120) {
    errors.title = 'Task title must be 120 characters or fewer.';
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.description = 'Task description must be text.';
    } else if (body.description.trim().length > 1000) {
      errors.description = 'Task description must be 1000 characters or fewer.';
    }
  }

  if (typeof body.dueDate !== 'string' || !isValidIsoDate(body.dueDate)) {
    errors.dueDate = 'Please provide a valid due date (YYYY-MM-DD).';
  }

  const priority = body.priority ?? 'Medium';
  if (typeof priority !== 'string' || !VALID_PRIORITIES.has(priority as TaskPriority)) {
    errors.priority = 'Priority must be High, Medium, or Low.';
  }

  const status = body.status ?? 'Pending';
  if (typeof status !== 'string' || !VALID_STATUSES.has(status as TaskStatus)) {
    errors.status = 'Status must be Pending or Completed.';
  }

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    res.status(400).json({ error: firstError, details: errors });
    return;
  }

  const sanitized: CreateTaskInput = {
    title: (body.title as string).trim(),
    description: typeof body.description === 'string' ? body.description.trim() : '',
    dueDate: body.dueDate as string,
    priority: priority as TaskPriority,
    status: status as TaskStatus,
  };

  req.body = sanitized;
  next();
}

export function validateUpdateTaskBody(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({ error: 'Request body must be a valid JSON object.' });
    return;
  }

  const errors: Record<string, string> = {};
  const sanitized: UpdateTaskInput = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.title = 'Task title cannot be empty.';
    } else if (body.title.trim().length > 120) {
      errors.title = 'Task title must be 120 characters or fewer.';
    } else {
      sanitized.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.description = 'Task description must be text.';
    } else if (body.description.trim().length > 1000) {
      errors.description = 'Task description must be 1000 characters or fewer.';
    } else {
      sanitized.description = body.description.trim();
    }
  }

  if (body.dueDate !== undefined) {
    if (typeof body.dueDate !== 'string' || !isValidIsoDate(body.dueDate)) {
      errors.dueDate = 'Please provide a valid due date (YYYY-MM-DD).';
    } else {
      sanitized.dueDate = body.dueDate;
    }
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== 'string' || !VALID_PRIORITIES.has(body.priority as TaskPriority)) {
      errors.priority = 'Priority must be High, Medium, or Low.';
    } else {
      sanitized.priority = body.priority as TaskPriority;
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !VALID_STATUSES.has(body.status as TaskStatus)) {
      errors.status = 'Status must be Pending or Completed.';
    } else {
      sanitized.status = body.status as TaskStatus;
    }
  }

  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    res.status(400).json({ error: firstError, details: errors });
    return;
  }

  if (Object.keys(sanitized).length === 0) {
    res.status(400).json({ error: 'At least one field must be provided to update.' });
    return;
  }

  req.body = sanitized;
  next();
}
