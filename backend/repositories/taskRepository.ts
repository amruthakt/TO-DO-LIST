import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { TaskModel, type TaskDocument } from '../models/Task.ts';
import type {
  CreateTaskInput,
  TaskDTO,
  TaskPriority,
  TaskQueryFilters,
  TaskStatsDTO,
  UpdateTaskInput,
} from '../types/task.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.resolve(DATA_DIR, 'tasks.json');

function assertConfinedPath(targetPath: string): void {
  if (!targetPath.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path outside data directory.');
  }
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function offsetIsoDate(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildInitialSeedTasks(): TaskDTO[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: crypto.randomBytes(12).toString('hex'),
      title: 'Finalize Q4 product roadmap presentation',
      description: 'Review milestone timelines with engineering leads and incorporate feedback on release deliverables.',
      dueDate: offsetIsoDate(1),
      priority: 'High',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomBytes(12).toString('hex'),
      title: 'Audit monthly cloud infrastructure costs',
      description: 'Compare compute and storage utilization against budget forecasts and flag idle instances.',
      dueDate: offsetIsoDate(-2),
      priority: 'High',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomBytes(12).toString('hex'),
      title: 'Update client onboarding checklist',
      description: 'Add automated welcome email verification steps and updated security compliance forms.',
      dueDate: offsetIsoDate(4),
      priority: 'Medium',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomBytes(12).toString('hex'),
      title: 'Publish API reference documentation v2',
      description: 'Verify endpoint examples, error response schemas, and rate limit tables before release.',
      dueDate: offsetIsoDate(-1),
      priority: 'Medium',
      status: 'Completed',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: crypto.randomBytes(12).toString('hex'),
      title: 'Organize team sprint retrospective notes',
      description: 'Summarize action items and assign owners in the workspace tracker.',
      dueDate: offsetIsoDate(6),
      priority: 'Low',
      status: 'Completed',
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

async function readLocalTasks(): Promise<TaskDTO[]> {
  assertConfinedPath(DATA_FILE);
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as TaskDTO[];
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      const seed = buildInitialSeedTasks();
      await writeLocalTasks(seed);
      return seed;
    }
    throw error;
  }
}

async function writeLocalTasks(tasks: TaskDTO[]): Promise<void> {
  assertConfinedPath(DATA_FILE);
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = path.resolve(DATA_DIR, `tasks.${crypto.randomUUID()}.tmp`);
  assertConfinedPath(tempFile);
  await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2), 'utf8');
  await fs.rename(tempFile, DATA_FILE);
}

function mapDocToDTO(doc: TaskDocument): TaskDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? '',
    dueDate: doc.dueDate,
    priority: doc.priority,
    status: doc.status,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

function isMongoReady(): boolean {
  return mongoose.connection.readyState === 1;
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function applyFiltersAndSort(tasks: TaskDTO[], filters: TaskQueryFilters): TaskDTO[] {
  const today = getTodayIsoDate();
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? '';

  const filtered = tasks.filter((task) => {
    if (filters.status && filters.status !== 'All' && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== 'All' && task.priority !== filters.priority) {
      return false;
    }
    if (filters.overdueOnly) {
      if (task.status !== 'Pending' || task.dueDate >= today) {
        return false;
      }
    }
    if (normalizedSearch) {
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }
    return true;
  });

  const sortBy = filters.sortBy ?? 'dueDate';
  return filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (diff !== 0) return diff;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === 'newest') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    // Default: dueDate ascending, with pending before completed when equal
    const dateDiff = a.dueDate.localeCompare(b.dueDate);
    if (dateDiff !== 0) return dateDiff;
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  });
}

export function computeTaskStats(tasks: TaskDTO[]): TaskStatsDTO {
  const today = getTodayIsoDate();
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  const byPriority: TaskStatsDTO['byPriority'] = {
    High: { total: 0, completed: 0, pending: 0 },
    Medium: { total: 0, completed: 0, pending: 0 },
    Low: { total: 0, completed: 0, pending: 0 },
  };

  for (const task of tasks) {
    byPriority[task.priority].total += 1;
    if (task.status === 'Completed') {
      completed += 1;
      byPriority[task.priority].completed += 1;
    } else {
      pending += 1;
      byPriority[task.priority].pending += 1;
      if (task.dueDate < today) {
        overdue += 1;
      }
    }
  }

  const total = tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    pending,
    overdue,
    completionRate,
    byPriority,
  };
}

export const taskRepository = {
  async list(filters: TaskQueryFilters = {}): Promise<{ tasks: TaskDTO[]; stats: TaskStatsDTO }> {
    let allTasks: TaskDTO[];

    if (isMongoReady()) {
      const docs = await TaskModel.find({}).sort({ createdAt: -1 }).exec();
      allTasks = docs.map(mapDocToDTO);
    } else {
      allTasks = await readLocalTasks();
    }

    const stats = computeTaskStats(allTasks);
    const filteredTasks = applyFiltersAndSort(allTasks, filters);
    return { tasks: filteredTasks, stats };
  },

  async findById(id: string): Promise<TaskDTO | null> {
    if (isMongoReady()) {
      if (!mongoose.isValidObjectId(id)) {
        return null;
      }
      const doc = await TaskModel.findById(id).exec();
      return doc ? mapDocToDTO(doc) : null;
    }

    const tasks = await readLocalTasks();
    return tasks.find((task) => task.id === id) ?? null;
  },

  async create(input: CreateTaskInput): Promise<TaskDTO> {
    if (isMongoReady()) {
      const created = await TaskModel.create({
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority,
        status: input.status,
      });
      return mapDocToDTO(created);
    }

    const tasks = await readLocalTasks();
    const nowIso = new Date().toISOString();
    const created: TaskDTO = {
      id: crypto.randomBytes(12).toString('hex'),
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await writeLocalTasks([created, ...tasks]);
    return created;
  },

  async update(id: string, patch: UpdateTaskInput): Promise<TaskDTO | null> {
    if (isMongoReady()) {
      if (!mongoose.isValidObjectId(id)) {
        return null;
      }
      const safePatch: UpdateTaskInput = {};
      if (patch.title !== undefined) safePatch.title = patch.title;
      if (patch.description !== undefined) safePatch.description = patch.description;
      if (patch.dueDate !== undefined) safePatch.dueDate = patch.dueDate;
      if (patch.priority !== undefined) safePatch.priority = patch.priority;
      if (patch.status !== undefined) safePatch.status = patch.status;

      const updated = await TaskModel.findByIdAndUpdate(
        id,
        { $set: safePatch },
        { new: true, runValidators: true },
      ).exec();
      return updated ? mapDocToDTO(updated) : null;
    }

    const tasks = await readLocalTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return null;
    }
    const existing = tasks[index];
    const updated: TaskDTO = {
      ...existing,
      title: patch.title ?? existing.title,
      description: patch.description ?? existing.description,
      dueDate: patch.dueDate ?? existing.dueDate,
      priority: patch.priority ?? existing.priority,
      status: patch.status ?? existing.status,
      updatedAt: new Date().toISOString(),
    };
    const nextTasks = [...tasks];
    nextTasks[index] = updated;
    await writeLocalTasks(nextTasks);
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    if (isMongoReady()) {
      if (!mongoose.isValidObjectId(id)) {
        return false;
      }
      const deleted = await TaskModel.findByIdAndDelete(id).exec();
      return deleted !== null;
    }

    const tasks = await readLocalTasks();
    const nextTasks = tasks.filter((task) => task.id !== id);
    if (nextTasks.length === tasks.length) {
      return false;
    }
    await writeLocalTasks(nextTasks);
    return true;
  },
};
