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
      EVALUACIONES: {
        Row: {
          created_at: string
          experiencia: string
          fecha: string
          id: string
          puntaje: number
          user_id: string
        }
        Insert: {
          created_at?: string
          experiencia: string
          fecha: string
          id?: string
          puntaje: number
          user_id?: string
        }
        Update: {
          created_at?: string
          experiencia?: string
          fecha?: string
          id?: string
          puntaje?: number
          user_id?: string
        }
        Relationships: []
      }
      evaluation_stats: {
        Row: {
          avg_score: number | null
          created_at: string
          id: string
          last_activity: string | null
          total_processes: number
          total_proponents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_score?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          total_processes?: number
          total_proponents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_score?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          total_processes?: number
          total_proponents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      process_data: {
        Row: {
          closing_date: string
          created_at: string
          experience: Json
          id: string
          minimum_salary: number | null
          process_name: string
          process_number: string
          scoring_criteria: Json
          total_contract_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          closing_date: string
          created_at?: string
          experience: Json
          id?: string
          minimum_salary?: number | null
          process_name: string
          process_number: string
          scoring_criteria: Json
          total_contract_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          closing_date?: string
          created_at?: string
          experience?: Json
          id?: string
          minimum_salary?: number | null
          process_name?: string
          process_number?: string
          scoring_criteria?: Json
          total_contract_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proponents: {
        Row: {
          contractors: Json
          created_at: string
          id: string
          is_plural: boolean
          name: string
          needs_subsanation: boolean
          partners: Json | null
          process_data_id: string
          requirements: Json
          rup: Json
          scoring: Json
          subsanation_details: string[] | null
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contractors?: Json
          created_at?: string
          id?: string
          is_plural?: boolean
          name: string
          needs_subsanation?: boolean
          partners?: Json | null
          process_data_id: string
          requirements: Json
          rup: Json
          scoring: Json
          subsanation_details?: string[] | null
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contractors?: Json
          created_at?: string
          id?: string
          is_plural?: boolean
          name?: string
          needs_subsanation?: boolean
          partners?: Json | null
          process_data_id?: string
          requirements?: Json
          rup?: Json
          scoring?: Json
          subsanation_details?: string[] | null
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proponents_process_data_id_fkey"
            columns: ["process_data_id"]
            isOneToOne: false
            referencedRelation: "process_data"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
