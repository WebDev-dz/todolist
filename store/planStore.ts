import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
};

export type Plan = {
  id: string;
  title: string;
  icon: string;
  color: string;
  dueDate: Date;
  status: 'active' | 'completed';
  tasks: Task[];
  description?: string;
  createdAt: Date;
};

interface PlanStore {
  plans: Plan[];
  addPlan: (plan: Omit<Plan, 'id' | 'status' | 'createdAt'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;
  addTask: (planId: string, task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (planId: string, taskId: string, task: Partial<Task>) => void;
  deleteTask: (planId: string, taskId: string) => void;
  toggleTaskStatus: (planId: string, taskId: string) => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      plans: [],

      addPlan: (plan) => set((state) => ({
        plans: [...state.plans, {
          ...plan,
          id: Math.random().toString(36).substring(7),
          status: 'active',
          createdAt: new Date(),
        }]
      })),

      updatePlan: (id, updatedPlan) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === id ? { ...plan, ...updatedPlan } : plan
        )
      })),

      deletePlan: (id) => set((state) => ({
        plans: state.plans.filter((plan) => plan.id !== id)
      })),

      togglePlanStatus: (id) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === id
            ? { ...plan, status: plan.status === 'active' ? 'completed' : 'active' }
            : plan
        )
      })),

      addTask: (planId, task) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                tasks: [...plan.tasks, {
                  ...task,
                  id: Math.random().toString(36).substring(7),
                  completed: false,
                }]
              }
            : plan
        )
      })),

      updateTask: (planId, taskId, updatedTask) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                tasks: plan.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, ...updatedTask }
                    : task
                )
              }
            : plan
        )
      })),

      deleteTask: (planId, taskId) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                tasks: plan.tasks.filter((task) => task.id !== taskId)
              }
            : plan
        )
      })),

      toggleTaskStatus: (planId, taskId) => set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                tasks: plan.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
                )
              }
            : plan
        )
      })),
    }),
    {
      name: 'plans-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ plans: state.plans }),
    }
  )
);
