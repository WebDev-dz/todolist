import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";
import { Category } from './taskStore';
import NetInfo from "@react-native-community/netinfo";

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string // ISO Format;
  progress: number;
  category: Category;
  status: 'not-started' | 'in-progress' | 'completed';
  milestones: Milestone[];
  notes: string
  createdAt: string // ISO Format
}

interface GoalStore {
  goals: Goal[];
  markGoalAsComplete: (goalId: string) => void;
  addGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoal: (updatedGoal: Goal) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => void;
  updateGoalStatus: (goalId: string, status: Goal['status']) => void;
  addMilestone: (goalId: string, milestone: Omit<Milestone, 'id'>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  refreshGoals: () => Promise<void>;
  getGoalById: (goalId: string) => Goal | undefined
}

export const useGoalStore = create<GoalStore>()(
  persist<GoalStore>((set, get) => ({
    goals: [],
    addGoal: (goal) => {
      set((state) => ({ goals: [...state.goals, goal] }))
    },
    updateGoal: async (updatedGoal) => {
      try {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === updatedGoal.id ? updatedGoal : goal
          ),
        }));

        // Sync with Supabase if online
        const netInfo = await NetInfo.fetch();
      //   if (netInfo.isConnected && get().userId) {
      //     const supabaseService = SupabaseService.getInstance();
      //     await supabaseService.updateHabit(updatedHabit, get().userId!);
      //   }
      } catch (error) {
        console.error('Error updating habit:', error);
      }
    },
    markGoalAsComplete: (goalId) => set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === goalId 
          ? { ...goal, status: 'completed', progress: 100 }
          : goal
      )
    })),
    updateGoalProgress: (goalId, progress) => set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? { ...goal, progress }
          : goal
      )
    })),
    updateGoalStatus: (goalId, status) => set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? { ...goal, status }
          : goal
      )
    })),
    deleteGoal: (goalId) => {
      set({ goals: get().goals.filter(goal => goal.id !== goalId) })
    },
    addMilestone: (goalId, milestone) => set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: [...goal.milestones, { ...milestone, id: crypto.randomUUID() }]
            }
          : goal
      )
    })),
    toggleMilestone: (goalId, milestoneId) => set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map(m =>
                m.id === milestoneId
                  ? { ...m, isCompleted: !m.isCompleted }
                  : m
              )
            }
          : goal
      )
    })),
    deleteMilestone: (goalId, milestoneId) => set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.filter(m => m.id !== milestoneId)
            }
          : goal
      )
    })),
    getGoalById: (goalId) => {
      return get().goals.find(goal => goal.id === goalId)
    },
    refreshGoals: async () => {
      const freshGoals = await fetch('/api/goals').then(res => res.json());
      set({ goals: freshGoals });
    },
  }), {
    name: 'goal-storage',
    storage: createJSONStorage(() => AsyncStorage),
  })
);
