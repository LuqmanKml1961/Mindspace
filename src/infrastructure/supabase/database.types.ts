export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          name_ciphertext: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name_ciphertext: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_ciphertext?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_checkins: {
        Row: {
          can_control_ciphertext: string | null;
          can_wait_ciphertext: string | null;
          checkin_date: string;
          created_at: string;
          id: string;
          occupying_mind_ciphertext: string | null;
          priority_task_id: string | null;
          priority_text_ciphertext: string | null;
          small_helpful_thing_ciphertext: string | null;
          updated_at: string;
          user_id: string;
          worries_ciphertext: string | null;
        };
        ComputedFields: never;
        Insert: {
          can_control_ciphertext?: string | null;
          can_wait_ciphertext?: string | null;
          checkin_date: string;
          created_at?: string;
          id?: string;
          occupying_mind_ciphertext?: string | null;
          priority_task_id?: string | null;
          priority_text_ciphertext?: string | null;
          small_helpful_thing_ciphertext?: string | null;
          updated_at?: string;
          user_id: string;
          worries_ciphertext?: string | null;
        };
        Update: {
          can_control_ciphertext?: string | null;
          can_wait_ciphertext?: string | null;
          checkin_date?: string;
          created_at?: string;
          id?: string;
          occupying_mind_ciphertext?: string | null;
          priority_task_id?: string | null;
          priority_text_ciphertext?: string | null;
          small_helpful_thing_ciphertext?: string | null;
          updated_at?: string;
          user_id?: string;
          worries_ciphertext?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_checkins_priority_task_fk";
            columns: ["priority_task_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          timezone: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          created_at: string;
          dismissed_at: string | null;
          id: string;
          remind_at: string;
          task_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          dismissed_at?: string | null;
          id?: string;
          remind_at: string;
          task_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          dismissed_at?: string | null;
          id?: string;
          remind_at?: string;
          task_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_task_fk";
            columns: ["task_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      tasks: {
        Row: {
          completed_at: string | null;
          created_at: string;
          due_date: string | null;
          due_time: string | null;
          id: string;
          notes_ciphertext: string | null;
          priority: string;
          source_thought_id: string | null;
          title_ciphertext: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          due_date?: string | null;
          due_time?: string | null;
          id?: string;
          notes_ciphertext?: string | null;
          priority?: string;
          source_thought_id?: string | null;
          title_ciphertext: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          due_date?: string | null;
          due_time?: string | null;
          id?: string;
          notes_ciphertext?: string | null;
          priority?: string;
          source_thought_id?: string | null;
          title_ciphertext?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_source_thought_fk";
            columns: ["source_thought_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "thoughts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      thoughts: {
        Row: {
          category_id: string | null;
          content_ciphertext: string;
          created_at: string;
          id: string;
          status: string;
          title_ciphertext: string | null;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          category_id?: string | null;
          content_ciphertext: string;
          created_at?: string;
          id?: string;
          status?: string;
          title_ciphertext?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          content_ciphertext?: string;
          created_at?: string;
          id?: string;
          status?: string;
          title_ciphertext?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "thoughts_category_fk";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      user_keys: {
        Row: {
          created_at: string;
          passphrase_iterations: number;
          passphrase_salt: string;
          passphrase_wrapped_key: string;
          recovery_iterations: number;
          recovery_salt: string;
          recovery_wrapped_key: string;
          updated_at: string;
          user_id: string;
          version: number;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          passphrase_iterations: number;
          passphrase_salt: string;
          passphrase_wrapped_key: string;
          recovery_iterations: number;
          recovery_salt: string;
          recovery_wrapped_key: string;
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          passphrase_iterations?: number;
          passphrase_salt?: string;
          passphrase_wrapped_key?: string;
          recovery_iterations?: number;
          recovery_salt?: string;
          recovery_wrapped_key?: string;
          updated_at?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
