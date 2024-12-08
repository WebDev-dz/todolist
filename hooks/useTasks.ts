import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { useSupabaseClient } from '@/db';
import { extendedClient } from '@/DbModule';

// Define base types from database schema
type Task = Database['public']['Tables']['tasks']['Row'];
// type Category = Database['public']['Tables']['categories']['Row'];
// type Subtask = Database['public']['Tables']['subtasks']['Row'];
// type Attachment = Database['public']['Tables']['attachments']['Row'];

// Define the combined task type with relationships
// interface TaskWithRelations extends Omit<Task, 'category_id'| 'user_id'> {
//   category: Category | null;
//   subtasks: Subtask[] | null;
//   attachments: Attachment[] | null;
// }

// Custom hook to fetch tasks with all relations
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useSupabaseClient()
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const tasks = await extendedClient.task.findMany()

      

      // const tasks = tasksData.map((t) => ({...t,category: t.category.at(0)}))
      setTasks(tasks);
    } catch (err) {
      console.log({err})
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch a single task by ID
  const fetchTaskById = async (taskId: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          completed,
          start_date,
          start_time,
          alert_time,
          notes,
          created_at,
          updated_at,
          category:categories!category_id(*),
          subtasks(
            id,
            title,
            completed,
            created_at,
            updated_at
          ),
          attachments(
            id,
            uri,
            type,
            name,
            size,
            created_at
          )
        `)
        .eq('id', taskId)
        .single();
      
        console.error({error})
      if (error) {
        throw error;
      }
      const task =  ({...data,category: data.category.at(0)})

      return task as TaskWithRelations;
    } catch (err) {
      return null;
    }
  };

  // Function to create a new task
  const createTask = async (
    taskData: {
      title: string;
      description?: string;
      category_id?: string;
      start_date?: string;
      start_time?: string;
      alert_time?: string;
      notes?: string;
    },
    subtasks?: { title: string; completed?: boolean }[],
    attachments?: { uri: string; type?: string; name: string; size?: number }[]
  ) => {
    try {
      // Insert the task first
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError || !newTask) {
        throw taskError;
      }

      // Insert subtasks if provided
      if (subtasks?.length) {
        const subtasksWithTaskId = subtasks.map(subtask => ({
          ...subtask,
          task_id: newTask.id
        }));

        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(subtasksWithTaskId);

        if (subtasksError) {
          throw subtasksError;
        }
      }

      // Insert attachments if provided
      if (attachments?.length) {
        const attachmentsWithTaskId = attachments.map(attachment => ({
          ...attachment,
          task_id: newTask.id
        }));

        const { error: attachmentsError } = await supabase
          .from('attachments')
          .insert(attachmentsWithTaskId);

        if (attachmentsError) {
          throw attachmentsError;
        }
      }

      // Refresh tasks after creation
      refreshTasks();
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  // Function to update a task
  const updateTask = async (
    taskId: string,
    taskData: {
      title?: string;
      description?: string;
      category_id?: string;
      completed?: boolean;
      start_date?: string;
      start_time?: string;
      alert_time?: string;
      notes?: string;
    },
    subtasks?: { title: string; completed?: boolean }[],
    attachments?: { uri: string; type?: string; name: string; size?: number }[]
  ) => {
    try {
      // Update the task
      const { error: taskError } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId);

      if (taskError) {
        throw taskError;
      }

      // Update subtasks if provided
      if (subtasks !== undefined) {
        // Delete existing subtasks
        await supabase
          .from('subtasks')
          .delete()
          .eq('task_id', taskId);

        if (subtasks.length) {
          const subtasksWithTaskId = subtasks.map(subtask => ({
            ...subtask,
            task_id: taskId
          }));

          const { error: subtasksError } = await supabase
            .from('subtasks')
            .insert(subtasksWithTaskId);

          if (subtasksError) {
            throw subtasksError;
          }
        }
      }

      // Update attachments if provided
      if (attachments !== undefined) {
        // Delete existing attachments
        await supabase
          .from('attachments')
          .delete()
          .eq('task_id', taskId);

        if (attachments.length) {
          const attachmentsWithTaskId = attachments.map(attachment => ({
            ...attachment,
            task_id: taskId
          }));

          const { error: attachmentsError } = await supabase
            .from('attachments')
            .insert(attachmentsWithTaskId);

          if (attachmentsError) {
            throw attachmentsError;
          }
        }
      }

      // Refresh tasks after update
      refreshTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete a task (will cascade delete related subtasks and attachments)
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Refresh tasks after deletion
      refreshTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const refreshTasks = () => {
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask
  };
};