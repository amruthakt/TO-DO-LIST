import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask,
} from '../controllers/taskController.ts';
import {
  validateCreateTaskBody,
  validateTaskIdParam,
  validateUpdateTaskBody,
} from '../middleware/validateTask.ts';

const taskRouter = Router();

taskRouter.get('/', listTasks);
taskRouter.get('/:id', validateTaskIdParam, getTaskById);
taskRouter.post('/', validateCreateTaskBody, createTask);
taskRouter.put('/:id', validateTaskIdParam, validateUpdateTaskBody, updateTask);
taskRouter.patch('/:id', validateTaskIdParam, validateUpdateTaskBody, updateTask);
taskRouter.delete('/:id', validateTaskIdParam, deleteTask);

export default taskRouter;
