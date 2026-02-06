import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CodeEditor } from "@/components/code/CodeEditor";
import { ScoreDisplay } from "@/components/code/ScoreDisplay";
import { IssuesList } from "@/components/code/IssuesList";
import { CodeComparison } from "@/components/code/CodeComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CodeSubmission } from "@/lib/supabase";

export default function HistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<CodeSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    if (!id) return;

    try {
      const { data } = await supabase
        .from("code_submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setSubmission(data as CodeSubmission);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }

    setLoading(false);
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

  if (!submission) {
    return (
      <AppLayout>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h3 className="mb-4 text-lg font-semibold">Submission not found</h3>
          <Button onClick={() => navigate("/history")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/history")}
              className="mb-2 md:mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Code Submission Details</h1>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <p className="text-xs md:text-sm text-muted-foreground">Overall Score</p>
              <div className="flex justify-end">
                <ScoreDisplay score={submission.score || 0} size="md md:lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize text-xs md:text-sm">
            {submission.language}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formatDistanceToNow(new Date(submission.created_at), {
              addSuffix: true,
            })}
          </Badge>
          {submission.issues_found && (
            <Badge variant="outline" className="text-xs">
              {(submission.issues_found as any[]).length} issues found
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="original" className="text-xs md:text-sm">Original</TabsTrigger>
            <TabsTrigger value="optimized" className="text-xs md:text-sm">Optimized</TabsTrigger>
            <TabsTrigger value="rewritten" className="hidden sm:inline-flex text-xs md:text-sm">Rewritten</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs md:text-sm">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="mt-4 md:mt-6">
            <CodeEditor
              value={submission.original_code}
              language={submission.language}
              readOnly
              title="Original Code"
              maxHeight="400px md:600px"
            />
          </TabsContent>

          <TabsContent value="optimized" className="mt-4 md:mt-6">
            {submission.optimized_code ? (
              <CodeComparison
                originalCode={submission.original_code}
                improvedCode={submission.optimized_code}
                language={submission.language}
                changes={["Improved time complexity", "Reduced memory usage"]}
              />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 md:p-12 text-center">
                <p className="text-xs md:text-sm text-muted-foreground">No optimized version available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewritten" className="mt-4 md:mt-6">
            {submission.review_result && (
              <CodeComparison
                originalCode={submission.original_code}
                improvedCode={
                  (submission.review_result as any)?.optimizedCode ||
                  submission.original_code
                }
                language={submission.language}
                changes={["Clean structure", "Better naming", "Modular design"]}
              />
            )}
          </TabsContent>

          <TabsContent value="issues" className="mt-4 md:mt-6">
            {submission.issues_found && (submission.issues_found as any[]).length > 0 ? (
              <IssuesList issues={submission.issues_found as any[]} />
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 md:p-12 text-center">
                <p className="text-xs md:text-sm text-muted-foreground">No issues found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
