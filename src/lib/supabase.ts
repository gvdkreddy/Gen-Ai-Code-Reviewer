import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type CodeSubmission = {
  id: string;
  user_id: string;
  original_code: string;
  language: string;
  review_result: ReviewResult | null;
  optimized_code: string | null;
  rewritten_code: string | null;
  score: number | null;
  issues_found: Issue[] | null;
  created_at: string;
  updated_at: string;
};

export type ReviewResult = {
  summary: string;
  improvements: string[];
  securityIssues: string[];
  performanceIssues: string[];
  bestPractices: string[];
};

export type Issue = {
  type: "bug" | "security" | "performance" | "style" | "logic";
  severity: "critical" | "high" | "medium" | "low";
  line?: number;
  message: string;
  suggestion?: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: "admin" | "developer";
};
