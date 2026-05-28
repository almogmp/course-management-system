/**
 * טיפוסי מסד נתונים של Supabase (חלקי — יורחב עם supabase gen types).
 * כולל את טבלת profiles לצורך אימות והרשאות.
 */
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
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "instructor";
          approval_status: "pending" | "approved" | "rejected";
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "instructor";
          approval_status?: "pending" | "approved" | "rejected";
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "instructor";
          approval_status?: "pending" | "approved" | "rejected";
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      instructors: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          phone: string;
          email: string;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          phone: string;
          email: string;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          phone?: string;
          email?: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      institutions: {
        Row: {
          id: string;
          name: string;
          city: string;
          address: string;
          phone: string;
          coordinator: string;
          notes: string | null;
          primary_supplier_id: string | null;
          is_own_supplier: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          address: string;
          phone: string;
          coordinator: string;
          notes?: string | null;
          primary_supplier_id?: string | null;
          is_own_supplier?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          address?: string;
          phone?: string;
          coordinator?: string;
          notes?: string | null;
          primary_supplier_id?: string | null;
          is_own_supplier?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      primary_suppliers: {
        Row: {
          id: string;
          name: string;
          contact_name: string;
          phone: string;
          email: string;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_name: string;
          phone: string;
          email: string;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_name?: string;
          phone?: string;
          email?: string;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          name: string;
          institution_id: string;
          primary_supplier_id: string;
          coordinator: string;
          lead_instructor_id: string;
          instructor_hourly_wage: number;
          company_hourly_rate: number;
          instructor_hours: number;
          company_hours: number;
          status: Database["public"]["Enums"]["course_status"];
          school_year: string;
          coordinator_id: string | null;
          target_instructor_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution_id: string;
          primary_supplier_id: string;
          coordinator: string;
          coordinator_id?: string | null;
          lead_instructor_id: string;
          instructor_hourly_wage: number;
          company_hourly_rate: number;
          instructor_hours: number;
          company_hours: number;
          status?: Database["public"]["Enums"]["course_status"];
          school_year: string;
          target_instructor_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution_id?: string;
          primary_supplier_id?: string;
          coordinator?: string;
          lead_instructor_id?: string;
          instructor_hourly_wage?: number;
          company_hourly_rate?: number;
          instructor_hours?: number;
          company_hours?: number;
          status?: Database["public"]["Enums"]["course_status"];
          school_year?: string;
          coordinator_id?: string | null;
          target_instructor_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      institution_coordinators: {
        Row: {
          id: string;
          institution_id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          expense_date: string;
          category: string;
          description: string;
          amount: number;
          paid_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expense_date: string;
          category: string;
          description: string;
          amount: number;
          paid_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expense_date?: string;
          category?: string;
          description?: string;
          amount?: number;
          paid_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      session_series: {
        Row: {
          id: string;
          course_id: string;
          start_date: string;
          end_date: string;
          weekdays: number[];
          start_time: string;
          end_time: string;
          assigned_instructor_id: string;
          instructor_hours: number;
          company_hours: number;
          default_status: Database["public"]["Enums"]["session_status"];
          institution_hourly_rate: number | null;
          instructor_hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          start_date: string;
          end_date: string;
          weekdays: number[];
          start_time: string;
          end_time: string;
          assigned_instructor_id: string;
          instructor_hours: number;
          company_hours: number;
          default_status?: Database["public"]["Enums"]["session_status"];
          institution_hourly_rate?: number | null;
          instructor_hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          start_date?: string;
          end_date?: string;
          weekdays?: number[];
          start_time?: string;
          end_time?: string;
          assigned_instructor_id?: string;
          instructor_hours?: number;
          company_hours?: number;
          default_status?: Database["public"]["Enums"]["session_status"];
          institution_hourly_rate?: number | null;
          instructor_hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_series_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_series_assigned_instructor_id_fkey";
            columns: ["assigned_instructor_id"];
            isOneToOne: false;
            referencedRelation: "instructors";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          id: string;
          course_id: string;
          series_id: string | null;
          session_date: string;
          start_time: string;
          end_time: string;
          instructor_hours: number;
          company_hours: number;
          status: Database["public"]["Enums"]["session_status"];
          admin_note: string | null;
          substitute_instructor_id: string | null;
          cancellation_reason: string | null;
          status_marked_at: string | null;
          status_marked_by: string | null;
          actual_arrival_time: string | null;
          actual_start_time: string | null;
          actual_end_time: string | null;
          school_year: string;
          institution_hourly_rate: number | null;
          instructor_hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          series_id?: string | null;
          session_date: string;
          start_time: string;
          end_time: string;
          instructor_hours: number;
          company_hours: number;
          status?: Database["public"]["Enums"]["session_status"];
          admin_note?: string | null;
          substitute_instructor_id?: string | null;
          cancellation_reason?: string | null;
          status_marked_at?: string | null;
          status_marked_by?: string | null;
          actual_arrival_time?: string | null;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          school_year: string;
          institution_hourly_rate?: number | null;
          instructor_hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          series_id?: string | null;
          session_date?: string;
          start_time?: string;
          end_time?: string;
          instructor_hours?: number;
          company_hours?: number;
          status?: Database["public"]["Enums"]["session_status"];
          admin_note?: string | null;
          substitute_instructor_id?: string | null;
          cancellation_reason?: string | null;
          status_marked_at?: string | null;
          status_marked_by?: string | null;
          actual_arrival_time?: string | null;
          actual_start_time?: string | null;
          actual_end_time?: string | null;
          school_year?: string;
          institution_hourly_rate?: number | null;
          instructor_hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "session_series";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_substitute_instructor_id_fkey";
            columns: ["substitute_instructor_id"];
            isOneToOne: false;
            referencedRelation: "instructors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sessions_status_marked_by_fkey";
            columns: ["status_marked_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "instructor";
      approval_status: "pending" | "approved" | "rejected";
      course_status: "active" | "frozen" | "ended" | "archived";
      session_status:
        | "planned"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "deferred";
      audit_action: string;
      audit_entity: string;
      notification_type: string;
    };
    CompositeTypes: Record<string, never>;
  };
};
