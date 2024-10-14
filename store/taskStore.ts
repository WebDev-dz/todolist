import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

// Supabase setup (replace with your actual Supabase URL and anon key)
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

// Define types (Subtask, Attachment, and Task remain the same as before)
export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Attachment = {
  id: string;
  uri: string;
  type?: string;
  name: string;
  size?: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  startDate: string | null;
  startTime: string | null;
  notes: string;
  attachments: Attachment[];
  alertTime: string | null;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
};

// Enhanced TaskStore type
export type TaskStore = {
  tasks: Task[];
  generatedByAi: Task[];
  selectedTask: Task | null;
  setTasks: (tasks: Task[]) => void;
  setGeneratedByAi: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  setSelectedTask: (taskId: string | null) => void;
  clearSelectedTask: () => void;
  addSubtask: (taskId: string, subtask: Subtask) => void;
  updateSubtask: (taskId: string, updatedSubtask: Subtask) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addAttachment: (taskId: string, attachment: Attachment) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
  backupToSupabase: () => Promise<void>;
  checkAndTriggerAlerts: () => Promise<void>;
};

// Background task for daily backups
const BACKGROUND_FETCH_TASK = 'background-fetch';
const BACKGROUND_NOTIFICATION_TASK = 'background_notification_task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const store = useTaskStore.getState();
    await store.backupToSupabase();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({data, error, executionInfo}) => {
  try {
    const store = useTaskStore.getState();
    store.checkAndTriggerAlerts();
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});



// Register the background fetch task
export async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60 * 24, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (err) {
    console.log("Task Register failed:", err);
  }
}

// Register the background notification task
export async function registerBackgroundNotificationAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (err) {
    console.log("Task Register failed:", err);
  }
}



// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    
  }),

});

// Create the enhanced Zustand store with persistence
export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      generatedByAi: [],
      selectedTask: null,
      setGeneratedByAi : (tasks) => set({generatedByAi: tasks}),
      setTasks: (tasks) => set({ tasks }),

      addTask: (newTask) => set((state) => ({ tasks: [...state.tasks, newTask] })),

      updateTask: (updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task)
      })),

      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId)
      })),

      setSelectedTask: (taskId) => set((state) => ({
        selectedTask: state.tasks.find((task) => task.id === taskId) || null
      })),

      clearSelectedTask: () => set({ selectedTask: null }),

      addSubtask: (taskId, subtask) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: [...task.subtasks, subtask] }
            : task
        )
      })),

      updateSubtask: (taskId, updatedSubtask) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === updatedSubtask.id ? updatedSubtask : subtask
                ),
              }
            : task
        )
      })),

      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
              }
            : task
        )
      })),

      addAttachment: (taskId, attachment) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, attachments: [...task.attachments, attachment] }
            : task
        )
      })),

      deleteAttachment: (taskId, attachmentId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                attachments: task.attachments.filter((att) => att.id !== attachmentId),
              }
            : task
        )
      })),

      backupToSupabase: async () => {
        const { tasks } = get();
        const { data, error } = await supabase
          .from('tasks_backup')
          .upsert({ user_id: 'current_user_id', tasks: tasks }, { onConflict: 'user_id' });
        
        if (error) {
          console.error('Error backing up to Supabase:', error);
        } else {
          console.log('Backup to Supabase successful');
        }
      },
      checkAndTriggerAlerts: async () => {
        const { tasks } = get();
        const now = new Date();
        
        for (const task of tasks) {
          if (task.alertTime && new Date(task.alertTime) <= now && !task.completed) {
            await Notifications.scheduleNotificationAsync({
              
              content: {
                title: "Task Alert",
                body: `It's time for your task: ${task.title}`,
              },
              trigger: null, // Send immediately
            });

            // Update the task to mark the alert as triggered
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === task.id ? { ...t, alertTime: null } : t
              ),
            }));
          }
        }
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
     
      
    }
  )
);

// Call this function when your app starts
// registerBackgroundFetchAsync();
