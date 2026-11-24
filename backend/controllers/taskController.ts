import type { NextFunction, Request, Response } from 'express';
import { parseTaskQueryFilters } from '../middleware/validateTask.ts';
import { taskRepository } from '../repositories/taskRepository.ts';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.ts';

export async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseTaskQueryFilters(req.query);
    const result = await taskRepository.list(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskRepository.findById(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = req.body as CreateTaskInput;
    const task = await taskRepository.create(payload);
    res.status(201).json({
      task,
      message: 'Task created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = req.body as UpdateTaskInput;
    const task = await taskRepository.update(req.params.id, payload);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json({
      task,
      message: 'Task updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await taskRepository.remove(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json({
      deletedId: req.params.id,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
