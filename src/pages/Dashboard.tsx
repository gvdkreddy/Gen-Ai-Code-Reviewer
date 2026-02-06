import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Code2, CheckCircle, TrendingUp, Zap } from "lucide-react";
import type { CodeSubmission } from "@/lib/supabase";

export default function Dashboard() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageScore: 0,
    issuesFixed: 0,
    optimizations: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("code_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        const typedData = data as CodeSubmission[];
        setSubmissions(typedData);

        // Calculate stats
        const scores = typedData.filter((s) => s.score !== null).map((s) => s.score!);
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        const totalIssues = typedData.reduce((acc, s) => {
          const issues = s.issues_found as any[] | null;
          return acc + (issues?.length || 0);
        }, 0);

        setStats({
          totalReviews: typedData.length,
          averageScore: avgScore,
          issuesFixed: totalIssues,
          optimizations: typedData.filter((s) => s.optimized_code).length,
        });
      }
    }

    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, <span className="gradient-text">{profile?.display_name || "Developer"}</span>
          </h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Here's an overview of your code analysis activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <StatsCard
            title="Total Reviews"
            value={stats.totalReviews}
            subtitle="All time"
            icon={Code2}
          />
          <StatsCard
            title="Average Score"
            value={`${stats.averageScore}/100`}
            subtitle="Code quality"
            icon={TrendingUp}
            trend={stats.averageScore > 0 ? { value: 12, label: "from last month" } : undefined}
          />
          <StatsCard
            title="Issues Found"
            value={stats.issuesFixed}
            subtitle="Bugs & vulnerabilities"
            icon={CheckCircle}
          />
          <StatsCard
            title="Optimizations"
            value={stats.optimizations}
            subtitle="Code improvements"
            icon={Zap}
          />
        </div>

        {/* Recent Submissions */}
        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <RecentSubmissions submissions={submissions} />
        </div>
      </div>
    </AppLayout>
  );
}
