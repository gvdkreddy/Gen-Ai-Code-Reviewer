import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScoreDisplay } from "@/components/code/ScoreDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { Search, ArrowRight, Code2, Trash2 } from "lucide-react";
import type { CodeSubmission } from "@/lib/supabase";

export default function History() {
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("code_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setSubmissions(data as CodeSubmission[]);
    }
    setLoading(false);
  };

  const deleteSubmission = async (id: string) => {
    await supabase.from("code_submissions").delete().eq("id", id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.language.toLowerCase().includes(search.toLowerCase()) ||
      s.original_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Code History</h1>
            <p className="text-muted-foreground">
              View and manage your past code submissions
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Code2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No submissions found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Start analyzing code to see your history"}
            </p>
            {!search && (
              <Link to="/analyzer">
                <Button className="bg-gradient-primary">
                  Analyze Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission, index) => (
              <div
                key={submission.id}
                className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <ScoreDisplay
                    score={submission.score || 0}
                    size="sm"
                    showLabel={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {submission.language}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(submission.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {submission.issues_found && (
                        <Badge variant="outline" className="text-xs">
                          {(submission.issues_found as any[]).length} issues
                        </Badge>
                      )}
                    </div>
                    <pre className="truncate font-mono text-sm text-muted-foreground max-w-2xl">
                      {submission.original_code.slice(0, 150)}...
                    </pre>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteSubmission(submission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/history/${submission.id}`}>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
