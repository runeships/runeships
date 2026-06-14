/**
 * Hand-written analogue of `npx supabase gen types typescript --linked`.
 *
 * Regenerate from the live schema once the Supabase CLI is linked
 * (`supabase link --project-ref kbokzwvnqeuxkcxigkdh`). Until then,
 * keep this file in sync manually with `db/migrations/*.sql`.
 *
 * Schemas covered:
 * - 001_waitlist                       → public.waitlist
 * - 002_company_leads                  → public.company_leads
 * - 003_create_profiles                → public.profiles
 * - 004_create_companies               → public.companies
 * - 005_create_tasks                   → public.tasks
 * - 006_create_submissions             → public.submissions
 * - 007_create_feedback                → public.feedback
 * - 009_add_specific_skills             → public.profiles.specific_skills
 * - 010_add_task_category               → public.tasks.category
 * - 011_grant_service_role              → GRANTs only, no schema change
 * - 012_create_regrade_requests         → public.regrade_requests
 * - 013_add_admin_flag                  → public.profiles.is_admin
 * - 014_add_notification_prefs          → public.profiles.notify_on_feedback
 * - 015_user_aggregates_fn              → public.get_user_aggregates() rpc
 * - 016_add_seed_and_visibility         → profiles.is_seed + .leaderboard_visible
 * - 017_grant_service_role_writes       → GRANTs only, no schema change
 * - 018_update_veganuno_task            → content swap, no schema change
 * - 019_add_task_dataset_url            → tasks.dataset_url + .dataset_label
 * - 022_add_evaluation_mode             → tasks.evaluation_mode
 * - 024_add_new_task_notification_pref  → profiles.notify_on_new_tasks
 * - 026_company_users_schema            → profiles.account_type/company_id/
 *                                         notify_on_new_submission +
 *                                         companies.industry/size_band/
 *                                         website/owner_email/task_categories +
 *                                         tasks.created_by/attachments/is_demo
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Submission modes a task can require. */
export type SubmissionMode = "text_only" | "link_only" | "text_and_link";

/** Fixed task categories — used for icon mapping + dashboard filtering. */
export type TaskCategory =
  | "writing"
  | "deck"
  | "code"
  | "spreadsheet"
  | "strategy"
  | "design";

export interface Database {
  public: {
    Tables: {
      // ─── 001 ────────────────────────────────────────────────────────
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          email?: string;
          source?: string;
          created_at?: string;
        };
      };

      // ─── 002 ────────────────────────────────────────────────────────
      company_leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          company_name: string;
          task_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company_name: string;
          task_description?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company_name?: string;
          task_description?: string | null;
          created_at?: string;
        };
      };

      // ─── 003 ────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          school: string | null;
          graduation_year: number | null;
          career_tracks: string[];
          specific_skills: string[];
          self_rated_strategy: number;
          self_rated_execution: number;
          self_rated_communication: number;
          self_rated_technical: number;
          self_rated_creativity: number;
          onboarding_completed: boolean;
          is_admin: boolean;
          notify_on_feedback: boolean;
          notify_on_new_tasks: boolean;
          notify_on_new_submission: boolean;
          account_type: "student" | "company";
          company_id: string | null;
          is_seed: boolean;
          leaderboard_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          school?: string | null;
          graduation_year?: number | null;
          career_tracks?: string[];
          specific_skills?: string[];
          self_rated_strategy?: number;
          self_rated_execution?: number;
          self_rated_communication?: number;
          self_rated_technical?: number;
          self_rated_creativity?: number;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          notify_on_feedback?: boolean;
          notify_on_new_tasks?: boolean;
          notify_on_new_submission?: boolean;
          account_type?: "student" | "company";
          company_id?: string | null;
          is_seed?: boolean;
          leaderboard_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          school?: string | null;
          graduation_year?: number | null;
          career_tracks?: string[];
          specific_skills?: string[];
          self_rated_strategy?: number;
          self_rated_execution?: number;
          self_rated_communication?: number;
          self_rated_technical?: number;
          self_rated_creativity?: number;
          onboarding_completed?: boolean;
          is_admin?: boolean;
          notify_on_feedback?: boolean;
          notify_on_new_tasks?: boolean;
          notify_on_new_submission?: boolean;
          account_type?: "student" | "company";
          company_id?: string | null;
          is_seed?: boolean;
          leaderboard_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ─── 004 ────────────────────────────────────────────────────────
      companies: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          industry: string | null;
          logo_url: string | null;
          website_url: string | null;
          is_practice: boolean;
          size_band: string | null;
          website: string | null;
          owner_email: string | null;
          task_categories: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_practice?: boolean;
          size_band?: string | null;
          website?: string | null;
          owner_email?: string | null;
          task_categories?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          industry?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_practice?: boolean;
          size_band?: string | null;
          website?: string | null;
          owner_email?: string | null;
          task_categories?: string[] | null;
          created_at?: string;
        };
      };

      // ─── 005 ────────────────────────────────────────────────────────
      tasks: {
        Row: {
          id: string;
          company_id: string;
          slug: string;
          title: string;
          brief: string;
          submission_mode: SubmissionMode;
          estimated_time: string | null;
          weight_strategy: number;
          weight_execution: number;
          weight_communication: number;
          weight_technical: number;
          weight_creativity: number;
          order_index: number;
          is_published: boolean;
          category: TaskCategory;
          dataset_url: string | null;
          dataset_label: string | null;
          evaluation_mode: "ai" | "human";
          created_by: string | null;
          attachments: Json;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          slug: string;
          title: string;
          brief: string;
          submission_mode: SubmissionMode;
          estimated_time?: string | null;
          weight_strategy?: number;
          weight_execution?: number;
          weight_communication?: number;
          weight_technical?: number;
          weight_creativity?: number;
          order_index?: number;
          is_published?: boolean;
          category?: TaskCategory;
          dataset_url?: string | null;
          dataset_label?: string | null;
          evaluation_mode?: "ai" | "human";
          created_by?: string | null;
          attachments?: Json;
          is_demo?: boolean;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          company_id?: string;
          slug?: string;
          title?: string;
          brief?: string;
          submission_mode?: SubmissionMode;
          estimated_time?: string | null;
          weight_strategy?: number;
          weight_execution?: number;
          weight_communication?: number;
          weight_technical?: number;
          weight_creativity?: number;
          order_index?: number;
          is_published?: boolean;
          category?: TaskCategory;
          dataset_url?: string | null;
          dataset_label?: string | null;
          evaluation_mode?: "ai" | "human";
          created_by?: string | null;
          attachments?: Json;
          is_demo?: boolean;
          created_at?: string;
        };
      };

      // ─── 006 ────────────────────────────────────────────────────────
      submissions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          submission_title: string;
          submission_body: string | null;
          supporting_link: string | null;
          link_access_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          submission_title: string;
          submission_body?: string | null;
          supporting_link?: string | null;
          link_access_confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          submission_title?: string;
          submission_body?: string | null;
          supporting_link?: string | null;
          link_access_confirmed?: boolean;
          created_at?: string;
        };
      };

      // ─── 007 ────────────────────────────────────────────────────────
      feedback: {
        Row: {
          id: string;
          submission_id: string;
          score_strategy: number;
          score_execution: number;
          score_communication: number;
          score_technical: number;
          score_creativity: number;
          total_score: number;
          qualitative_feedback: string;
          model_used: string;
          generated_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          score_strategy: number;
          score_execution: number;
          score_communication: number;
          score_technical: number;
          score_creativity: number;
          total_score: number;
          qualitative_feedback: string;
          model_used?: string;
          generated_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          submission_id?: string;
          score_strategy?: number;
          score_execution?: number;
          score_communication?: number;
          score_technical?: number;
          score_creativity?: number;
          total_score?: number;
          qualitative_feedback?: string;
          model_used?: string;
          generated_at?: string;
        };
      };

      // ─── 012 ────────────────────────────────────────────────────────
      regrade_requests: {
        Row: {
          id: string;
          submission_id: string;
          user_id: string;
          reason: string | null;
          status: "pending" | "resolved" | "declined";
          resolved_at: string | null;
          admin_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          user_id: string;
          reason?: string | null;
          status?: "pending" | "resolved" | "declined";
          resolved_at?: string | null;
          admin_note?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          id?: string;
          submission_id?: string;
          user_id?: string;
          reason?: string | null;
          status?: "pending" | "resolved" | "declined";
          resolved_at?: string | null;
          admin_note?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_aggregates: {
        Args: Record<string, never>;
        Returns: Array<{
          user_id: string;
          strategy: number;
          execution: number;
          communication: number;
          technical: number;
          creativity: number;
          task_count: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ─── Helper aliases for common access patterns ───────────────────────── */

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdatableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
