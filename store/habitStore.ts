import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Notifications from 'expo-notifications';
import { SupabaseService } from "@/db/supabaseService";
import NetInfo from "@react-native-community/netinfo";

// Types
export type Habit = {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  streak: number;
  completedDates: string[]; // Store dates as ISO strings
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  reminderTime?: string; // Store as ISO string
  startDate: string; // Store as ISO string
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  weeklyDays?: number [] 
  userId?: string;
};

export type HabitStore = {
  userId: string | undefined;
  habits: Habit[];
  selectedHabit: Habit | null;
  
  // Basic CRUD
  setUserId: (userId?: string) => void;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (updatedHabit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  
  // Habit tracking
  markHabitComplete: (habitId: string, date: string) => void;
  markHabitIncomplete: (habitId: string, date: string) => void;
  getHabitStreak: (habitId: string) => number;
  markHabitAsComplete: (habitId: string) => void;
  
  // Filtering and stats
  getHabitsByFrequency: (frequency: Habit['frequency']) => Habit[];
  getHabitsByCategory: (category: string) => Habit[];
  getCompletedHabits: (date: string) => Habit[];
  getHabitCompletionRate: (habitId: string, days: number) => number;
  
  // Selection
  setSelectedHabit: (habitId: string | null) => void;
  clearSelectedHabit: () => void;
  
  // Sync and backup
  backupToSupabase: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
};

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      userId: undefined,
      habits: [],
      selectedHabit: null,

      setUserId: (userId) => set({ userId }),
      
      setHabits: (habits) => set({ habits }),

      addHabit: async (newHabit) => {
        try {
          set((state) => ({ habits: [...state.habits, newHabit] }));
          
          // Schedule notification if reminderTime exists
          if (newHabit.reminderTime) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Habit Reminder",
                body: `Time for your habit: ${newHabit.title}`,
              },
              trigger: {
                hour: new Date(newHabit.reminderTime).getHours(),
                minute: new Date(newHabit.reminderTime).getMinutes(),
                repeats: true,
              },
            });
          }

          // Sync with Supabase if online
          const netInfo = await NetInfo.fetch();
        //   if (netInfo.isConnected && get().userId) {
        //     const supabaseService = SupabaseService.getInstance();
        //     await supabaseService.createHabit(newHabit, get().userId!);
        //   }
        } catch (error) {
          console.error('Error adding habit:', error);
        }
      },

      updateHabit: async (updatedHabit) => {
        try {
          set((state) => ({
            habits: state.habits.map((habit) =>
              habit.id === updatedHabit.id ? updatedHabit : habit
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

      deleteHabit: async (habitId) => {
        try {
          set((state) => ({
            habits: state.habits.filter((habit) => habit.id !== habitId),
          }));

          // Sync with Supabase if online
          const netInfo = await NetInfo.fetch();
        //   if (netInfo.isConnected && get().userId) {
        //     const supabaseService = SupabaseService.getInstance();
        //     await supabaseService.deleteHabit(habitId, get().userId!);
        //   }
        } catch (error) {
          console.error('Error deleting habit:', error);
        }
      },

      markHabitComplete: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  completedDates: [...habit.completedDates, date],
                  streak: habit.streak + 1,
                }
              : habit
          ),
        }));
      },

      markHabitIncomplete: (habitId, date) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  completedDates: habit.completedDates.filter((d) => d !== date),
                  streak: Math.max(0, habit.streak - 1),
                }
              : habit
          ),
        }));
      },

      getHabitStreak: (habitId) => {
        const habit = get().habits.find((h) => h.id === habitId);
        return habit?.streak || 0;
      },

      getHabitsByFrequency: (frequency) => {
        return get().habits.filter((habit) => habit.frequency === frequency);
      },

      getHabitsByCategory: (category) => {
        return get().habits.filter((habit) => habit.category === category);
      },

      getCompletedHabits: (date) => {
        return get().habits.filter((habit) =>
          habit.completedDates.includes(date)
        );
      },

      getHabitCompletionRate: (habitId, days) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return 0;

        const today = new Date();
        const completedInRange = habit.completedDates.filter((date) => {
          const completedDate = new Date(date);
          const diffTime = Math.abs(today.getTime() - completedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= days;
        });

        return (completedInRange.length / days) * 100;
      },

      setSelectedHabit: (habitId) => {
        const selectedHabit = habitId
          ? get().habits.find((h) => h.id === habitId) || null
          : null;
        set({ selectedHabit });
      },

      clearSelectedHabit: () => set({ selectedHabit: null }),

      backupToSupabase: async () => {
        try {
          const { habits, userId } = get();
          if (!userId) return;

          const { error } = await supabase
            .from('habits')
            .upsert(
              habits.map((habit) => ({
                ...habit,
                user_id: userId,
              }))
            );

          if (error) throw error;
        } catch (error) {
          console.error('Error backing up to Supabase:', error);
        }
      },

      syncWithSupabase: async () => {
        try {
          const { userId } = get();
          if (!userId) return;

          const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId);

          if (error) throw error;
          if (data) {
            set({ habits: data });
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },

      markHabitAsComplete: (habitId) => set((state) => ({
        habits: state.habits.map(habit => 
          habit.id === habitId 
            ? { ...habit, streak: habit.streak + 1, completedDates: [...habit.completedDates, new Date().toISOString()] }
            : habit
        )
      })),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
