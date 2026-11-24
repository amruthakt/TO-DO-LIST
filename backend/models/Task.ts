import mongoose, { Schema, type Document } from 'mongoose';
import type { TaskPriority, TaskStatus } from '../types/task.ts';

export interface TaskDocument extends Document {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title cannot be empty'],
      maxlength: [120, 'Task title must be 120 characters or fewer'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Task description must be 1000 characters or fewer'],
    },
    dueDate: {
      type: String,
      required: [true, 'Due date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format'],
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = String(ret._id);
          delete ret._id;
        }
        return ret;
      },
    },
  },
);

taskSchema.index({ status: 1, priority: 1, dueDate: 1 });

export const TaskModel =
  (mongoose.models.Task as mongoose.Model<TaskDocument> | undefined) ??
  mongoose.model<TaskDocument>('Task', taskSchema);
