import { Attachment, Subtask, Category } from "@/store/taskStore"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          sound_enabled: boolean;
          reminderTime: number;
          dailyDigest: boolean;
          dailyDigestTime: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled?: boolean;
          sound_enabled?: boolean;
          reminderTime?: number;
          dailyDigest?: boolean;
          dailyDigestTime?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          enabled?: boolean;
          sound_enabled?: boolean;
          reminderTime?: number;
          dailyDigest?: boolean;
          dailyDigestTime?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          date: string;
          read: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          date: string;
          read?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          date?: string;
          read?: boolean;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      scheduled_notifications: {
        Row: {
          id: string;
          task_id: string;
          scheduledTime: string;
          title: string;
          body: string;
          data: Json | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          scheduledTime: string;
          title: string;
          body: string;
          data?: Json | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          scheduledTime?: string;
          title?: string;
          body?: string;
          data?: Json | null;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_notificationsTask_id_fkey";
            columns: ["task_id"];
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          }
        ];
      };
      sync_metadata: {
        Row: {
          user_id: string;
          last_sync: string;
        };
        Insert: {
          user_id: string;
          last_sync?: string;
        };
        Update: {
          user_id?: string;
          last_sync?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sync_metadata_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          completed: boolean;
          startDate: string | null;
          startTime: string | null;
          alertTime: string | null;
          notes: string;
          createdAt: string;
          updatedAt: string;
          subtasks: Subtask[] | null;
          category: Category | null;
          attachments: Attachment[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          startDate?: string | null;
          startTime?: string | null;
          alertTime?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
          subtasks?: Subtask[] | null;
          category?: Category | null;
          attachments?: Attachment[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          startDate?: string | null;
          startTime?: string | null;
          alertTime?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
          subtasks?: Subtask[] | null;
          category?: Category | null;
          attachments?: Attachment[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};


type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never


  