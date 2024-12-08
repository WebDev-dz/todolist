import { z } from "zod";

// First, let's define schemas for nested types like Attachment and Subtask
const AttachmentSchema = z.object({
  
  id: z.string(),
  uri: z.string(),
  type: z.string().optional(),
  name: z.string(),
  size: z.number().optional()
  
});


const CategorySchema = z.object({
  label: z.string(),
  icon: z.string(),
  theme: z.string()
})

const SubtaskSchema = z.object({
  // Define properties of Subtask here
  // For example:
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  // Add more fields as needed
});

// Now, let's define the main Task schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  startDate: z.string().nullable(),
  startTime: z.string().nullable(),
  notes: z.string(),
  attachments: z.array(AttachmentSchema),
  alertTime: z.string().nullable(),
  subtasks: z.array(SubtaskSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: CategorySchema.optional()
});

// Define the Task type from the schema
export type Task = z.infer<typeof TaskSchema>;

// Optional: Create a function to validate a task
export function validateTask(task: unknown): Task {
  return TaskSchema.parse(task);
}

// Optional: Create a function to partially validate a task (useful for updates)
export function validatePartialTask(task: unknown): Partial<Task> {
  return TaskSchema.partial().parse(task);
}


export const defaultTask : Task = {
  id: (new Date()).toString(),
  title: "Task",
  description: "",
  completed: false,
  startDate: (new Date()).toString(),
  startTime: (new Date()).toString(),
  notes:"",
  attachments: [],
  alertTime: null,
  subtasks: [],
  createdAt: (new Date()).toString(),
  updatedAt: (new Date()).toString(),



}

export const GoalSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
  milestones: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    dueDate: z.string(),
    completed: z.boolean().optional().default(false)
  })),
  completed: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});