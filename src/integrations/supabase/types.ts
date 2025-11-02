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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          estado: string | null
          fecha: string | null
          id: string
          paciente_id: string | null
          tipo_alerta: string
        }
        Insert: {
          estado?: string | null
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          tipo_alerta: string
        }
        Update: {
          estado?: string | null
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          tipo_alerta?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asignaciones_tests: {
        Row: {
          analisis_ia: Json | null
          completado: boolean | null
          fecha_asignacion: string | null
          fecha_completado: string | null
          fecha_limite: string | null
          id: string
          observaciones_psicologo: string | null
          paciente_id: string
          psicologo_id: string
          test_id: string
        }
        Insert: {
          analisis_ia?: Json | null
          completado?: boolean | null
          fecha_asignacion?: string | null
          fecha_completado?: string | null
          fecha_limite?: string | null
          id?: string
          observaciones_psicologo?: string | null
          paciente_id: string
          psicologo_id: string
          test_id: string
        }
        Update: {
          analisis_ia?: Json | null
          completado?: boolean | null
          fecha_asignacion?: string | null
          fecha_completado?: string | null
          fecha_limite?: string | null
          id?: string
          observaciones_psicologo?: string | null
          paciente_id?: string
          psicologo_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests_psicologicos"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluaciones: {
        Row: {
          fecha: string | null
          id: string
          observacion: string | null
          paciente_id: string | null
          resultado_numerico: number
          tipo_prueba: string
        }
        Insert: {
          fecha?: string | null
          id?: string
          observacion?: string | null
          paciente_id?: string | null
          resultado_numerico: number
          tipo_prueba: string
        }
        Update: {
          fecha?: string | null
          id?: string
          observacion?: string | null
          paciente_id?: string | null
          resultado_numerico?: number
          tipo_prueba?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          contenido: string
          fecha: string | null
          id: string
          paciente_id: string | null
          psicologo_id: string | null
        }
        Insert: {
          contenido: string
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          psicologo_id?: string | null
        }
        Update: {
          contenido?: string
          fecha?: string | null
          id?: string
          paciente_id?: string | null
          psicologo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      preguntas_test: {
        Row: {
          created_at: string | null
          id: string
          opciones: Json | null
          orden: number
          test_id: string
          texto: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opciones?: Json | null
          orden: number
          test_id: string
          texto: string
          tipo?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opciones?: Json | null
          orden?: number
          test_id?: string
          texto?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_test_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests_psicologicos"
            referencedColumns: ["id"]
          },
        ]
      }
      respuestas_tests: {
        Row: {
          asignacion_id: string
          created_at: string | null
          id: string
          paciente_id: string
          pregunta_id: string
          respuesta: string
          valor_numerico: number | null
        }
        Insert: {
          asignacion_id: string
          created_at?: string | null
          id?: string
          paciente_id: string
          pregunta_id: string
          respuesta: string
          valor_numerico?: number | null
        }
        Update: {
          asignacion_id?: string
          created_at?: string | null
          id?: string
          paciente_id?: string
          pregunta_id?: string
          respuesta?: string
          valor_numerico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "respuestas_tests_asignacion_id_fkey"
            columns: ["asignacion_id"]
            isOneToOne: false
            referencedRelation: "asignaciones_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respuestas_tests_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas_test"
            referencedColumns: ["id"]
          },
        ]
      }
      sugerencias: {
        Row: {
          fecha: string | null
          id: string
          mensaje: string
          paciente_id: string | null
          psicologo_id: string | null
        }
        Insert: {
          fecha?: string | null
          id?: string
          mensaje: string
          paciente_id?: string | null
          psicologo_id?: string | null
        }
        Update: {
          fecha?: string | null
          id?: string
          mensaje?: string
          paciente_id?: string | null
          psicologo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugerencias_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugerencias_psicologo_id_fkey"
            columns: ["psicologo_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tests_psicologicos: {
        Row: {
          activo: boolean | null
          config_ia: Json | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          psicologo_id: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          config_ia?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          psicologo_id: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          config_ia?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          psicologo_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          codigo_psicologo: string | null
          created_at: string | null
          diagnostico: string | null
          edad: number | null
          email: string
          especialidad: string | null
          genero: string | null
          id: string
          institucion: string | null
          nombre: string
          numero_licencia: string | null
          proxima_cita: string | null
          rol: string
        }
        Insert: {
          codigo_psicologo?: string | null
          created_at?: string | null
          diagnostico?: string | null
          edad?: number | null
          email: string
          especialidad?: string | null
          genero?: string | null
          id?: string
          institucion?: string | null
          nombre: string
          numero_licencia?: string | null
          proxima_cita?: string | null
          rol: string
        }
        Update: {
          codigo_psicologo?: string | null
          created_at?: string | null
          diagnostico?: string | null
          edad?: number | null
          email?: string
          especialidad?: string | null
          genero?: string | null
          id?: string
          institucion?: string | null
          nombre?: string
          numero_licencia?: string | null
          proxima_cita?: string | null
          rol?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_statistics: {
        Row: {
          tests_completados: number | null
          tests_pendientes: number | null
          total_evaluaciones: number | null
          total_pacientes: number | null
          total_psicologos: number | null
          total_tests: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_psychologist_patients: {
        Args: never
        Returns: {
          codigo_psicologo: string
          edad: number
          genero: string
          id: string
          nombre: string
        }[]
      }
      get_user_psychologist_code: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_administrator: { Args: { _user_id: string }; Returns: boolean }
      is_psychologist: { Args: { _user_id: string }; Returns: boolean }
      psychologist_has_patient: {
        Args: { _patient_id: string; _psychologist_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "paciente" | "psicologo" | "administrador"
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
      app_role: ["paciente", "psicologo", "administrador"],
    },
  },
} as const
