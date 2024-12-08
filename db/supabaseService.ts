// supabaseService.ts
import { Task } from "@/store/taskStore";
import { Database } from "@/types/supabase";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class SupabaseService {
    private client: SupabaseClient<Database> | null = null;
    private static instance: SupabaseService;
    private supabaseUrl: string = process.env.EXPO_PUBLIC_SUPABASE_URL! ;
    private supabaseAnonKey: string = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY! ;

  private constructor() {
    this.client = createClient(
      this.supabaseUrl,
      this.supabaseAnonKey
    );
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async syncTasks(tasks: Task[], userId: string): Promise<void> {
    try {
      // First, get the last sync timestamp from Supabase
      const supabase = await this.client!

    //   @ts-ignore
      const { data: syncData } = supabase
        .from('sync_metadata')
        .select('last_sync')
        .eq('user_id', userId)
        .single();

      const lastSync = syncData?.last_sync || new Date(0).toISOString();

      // Get tasks modified since last sync
      const modifiedTasks = tasks.filter(task => 
        new Date(task.updatedAt) > new Date(lastSync)
      );

      if (modifiedTasks.length > 0) {
        // Batch tasks into chunks of 100 for better performance
        const chunkSize = 100;
        for (let i = 0; i < modifiedTasks.length; i += chunkSize) {
          const chunk = modifiedTasks.slice(i, i + chunkSize);
          
          const { error } = await supabase
            .from('tasks')
            .upsert(
              chunk.map(task => ({
                ...task,
                user_id: userId,
                updatedAt: new Date().toISOString()
              })),
              { onConflict: 'id,user_id' }
            );

          if (error) throw error;
        }

        // Update sync metadata
        supabase
          .from('sync_metadata')
          .upsert({
            user_id: userId,
            last_sync: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    } catch (error) {
      console.error('Error syncing tasks:', error);
      throw error;
    }
  }

  async fetchTasks(userId: string): Promise<Task[]> {
    try {
      const supabase = this.client!
      const { data, error } = await supabase
        .from('tasks')
        .select("*")
        .eq('user_id', userId)
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
        const supabase = this.client!
      const { error } = await supabase
        .from('tasks')
        .delete()
        .match({ id: taskId, user_id: userId });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async setupRealtimeSync(userId: string, onTasksUpdate: (tasks: Task[]) => void): Promise<() => void> {
    const supabase = this.client!
    const channel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Fetch updated tasks when changes occur
          const tasks = await this.fetchTasks(userId);
          onTasksUpdate(tasks);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      channel.unsubscribe();
    };
  }
}