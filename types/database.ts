export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customer_activity_events: {
        Row: {
          created_at: string
          customer_id: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["customer_activity_kind"]
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description: string
          id?: string
          kind: Database["public"]["Enums"]["customer_activity_kind"]
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["customer_activity_kind"]
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_activity_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          cancelled_at: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          mrr: number
          name: string
          plan_name: Database["public"]["Enums"]["plan_name"]
          status: Database["public"]["Enums"]["customer_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          mrr?: number
          name: string
          plan_name?: Database["public"]["Enums"]["plan_name"]
          status?: Database["public"]["Enums"]["customer_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          mrr?: number
          name?: string
          plan_name?: Database["public"]["Enums"]["plan_name"]
          status?: Database["public"]["Enums"]["customer_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      metric_points: {
        Row: {
          active_users: number
          arpu: number
          churn_rate: number
          created_at: string
          date: string
          id: string
          mrr: number
          tenant_id: string
        }
        Insert: {
          active_users?: number
          arpu?: number
          churn_rate?: number
          created_at?: string
          date: string
          id?: string
          mrr?: number
          tenant_id: string
        }
        Update: {
          active_users?: number
          arpu?: number
          churn_rate?: number
          created_at?: string
          date?: string
          id?: string
          mrr?: number
          tenant_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          href: string
          id: string
          read_at: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          href?: string
          id?: string
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          href?: string
          id?: string
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          tenant_id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_plan: Database["public"]["Enums"]["plan_name"]
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          billing_plan?: Database["public"]["Enums"]["plan_name"]
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          billing_plan?: Database["public"]["Enums"]["plan_name"]
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["team_member_role"]
          status: Database["public"]["Enums"]["team_invite_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_invite_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["team_invite_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      customer_activity_kind:
        | "created"
        | "plan"
        | "status"
        | "mrr"
        | "note"
        | "cancelled"
      customer_status: "active" | "trial" | "cancelled" | "archived"
      notification_severity: "info" | "warning" | "success"
      plan_name: "Basic" | "Plus" | "Premium"
      team_invite_status: "pending" | "accepted" | "revoked"
      team_member_role: "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_activity_kind: [
        "created",
        "plan",
        "status",
        "mrr",
        "note",
        "cancelled",
      ],
      customer_status: ["active", "trial", "cancelled", "archived"],
      notification_severity: ["info", "warning", "success"],
      plan_name: ["Basic", "Plus", "Premium"],
      team_invite_status: ["pending", "accepted", "revoked"],
      team_member_role: ["admin", "member", "viewer"],
    },
  },
} as const
