import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CodeSubmission } from "@/lib/supabase";

interface LanguageAnalytics {
  language: string;
  totalReviews: number;
  averageScore: number;
  commonIssues: { type: string; count: number }[];
  optimizationsCount: number;
  recentReviews: string[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  "html css": "HTML+CSS",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
};

const LANGUAGE_COLORS: Record<string, string> = {
  "html css": "from-orange-500 to-red-500",
  javascript: "from-yellow-400 to-yellow-600",
  typescript: "from-blue-500 to-blue-700",
  python: "from-blue-400 to-yellow-400",
  java: "from-red-500 to-orange-600",
  c: "from-slate-500 to-slate-700",
  cpp: "from-cyan-500 to-blue-600",
  csharp: "from-purple-500 to-pink-500",
  go: "from-cyan-400 to-cyan-600",
  rust: "from-orange-600 to-red-600",
  php: "from-indigo-500 to-purple-600",
  ruby: "from-red-600 to-red-800",
};

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<LanguageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("code_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const submissions = data as CodeSubmission[];
        const languageGroups: Record<string, CodeSubmission[]> = {};

        // Group submissions by language
        submissions.forEach((submission) => {
          const lang = submission.language.toLowerCase();
          if (!languageGroups[lang]) {
            languageGroups[lang] = [];
          }
          languageGroups[lang].push(submission);
        });

        // Calculate analytics per language
        const analyticsData = Object.entries(languageGroups).map(([lang, subs]) => {
          const averageScore =
            subs.reduce((sum, s) => sum + (s.score || 0), 0) / (subs.length || 1);

          // Count issue types
          const issueMap: Record<string, number> = {};
          subs.forEach((sub) => {
            const issues = sub.issues_found as any[];
            if (Array.isArray(issues)) {
              issues.forEach((issue) => {
                const type = issue.type || "unknown";
                issueMap[type] = (issueMap[type] || 0) + 1;
              });
            }
          });

          const commonIssues = Object.entries(issueMap)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          // Count optimizations
          const optimizationsCount = subs.filter((s) => s.optimized_code).length;

          // Get recent reviews
          const recentReviews = subs
            .slice(0, 3)
            .map((s) => {
              const review = s.review_result as any;
              return review?.summary || "No summary";
            })
            .filter((r) => r !== "No summary");

          return {
            language: lang,
            totalReviews: subs.length,
            averageScore: Math.round(averageScore),
            commonIssues,
            optimizationsCount,
            recentReviews,
          };
        });

        // Sort by total reviews
        analyticsData.sort((a, b) => b.totalReviews - a.totalReviews);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center px-4">
          <div className="mb-4 md:mb-6 flex justify-center">
            <div className="flex h-12 md:h-16 w-12 md:w-16 items-center justify-center rounded-2xl bg-gradient-primary glow-primary">
              <BarChart3 className="h-6 md:h-8 w-6 md:w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Code Review Analytics</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
            Programming language-wise code quality analysis and insights
          </p>
        </div>

        {/* Empty State */}
        {analytics.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 md:p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 md:h-12 w-10 md:w-12 text-muted-foreground" />
            <h3 className="mb-2 text-base md:text-lg font-semibold">No data available</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Start analyzing code to see language-wise analytics
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            {analytics.map((lang) => (
              <Card
                key={lang.language}
                className="overflow-hidden border-border bg-card p-4 md:p-6 transition-all hover:border-primary/30 animate-slide-up"
              >
                {/* Language Header */}
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`flex h-8 md:h-10 w-8 md:w-10 items-center justify-center rounded-lg bg-gradient-to-br ${
                        LANGUAGE_COLORS[lang.language] || "from-gray-500 to-gray-700"
                      }`}
                    >
                      <span className="text-xs font-bold text-white">
                        {LANGUAGE_LABELS[lang.language]?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold">
                        {LANGUAGE_LABELS[lang.language] || lang.language}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {lang.totalReviews} review{lang.totalReviews !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Average Score</p>
                    <div className="flex h-9 md:h-10 w-9 md:w-10 items-center justify-center rounded-lg bg-gradient-primary text-sm md:text-lg font-bold text-primary-foreground">
                      {lang.averageScore}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Total Reviews</p>
                    <p className="text-xl md:text-2xl font-bold">{lang.totalReviews}</p>
                  </div>
                  <div className="rounded-lg bg-success/10 p-3">
                    <p className="text-xs text-muted-foreground">Optimizations</p>
                    <p className="text-xl md:text-2xl font-bold text-success">{lang.optimizationsCount}</p>
                  </div>
                </div>

                {/* Common Issues */}
                <div className="mb-4 md:mb-6">
                  <h4 className="mb-2 md:mb-3 text-xs md:text-sm font-semibold">Common Issues Found</h4>
                  {lang.commonIssues.length > 0 ? (
                    <div className="space-y-2">
                      {lang.commonIssues.map((issue) => (
                        <div key={issue.type} className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize text-xs">
                            {issue.type}
                          </Badge>
                          <span className="text-xs font-medium">{issue.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No issues found</p>
                  )}
                </div>

                {/* Recent Reviews */}
                <div>
                  <h4 className="mb-2 md:mb-3 text-xs md:text-sm font-semibold">Recent Feedback</h4>
                  {lang.recentReviews.length > 0 ? (
                    <div className="space-y-2">
                      {lang.recentReviews.slice(0, 2).map((review, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground line-clamp-2">
                          "{review}"
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews available</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
