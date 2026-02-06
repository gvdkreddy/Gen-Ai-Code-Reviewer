import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from "@/components/code/ScoreDisplay";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { CodeSubmission } from "@/lib/supabase";

interface RecentSubmissionsProps {
  submissions: CodeSubmission[];
  className?: string;
}

export function RecentSubmissions({ submissions, className }: RecentSubmissionsProps) {
  if (!submissions.length) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 md:p-8 text-center", className)}>
        <div className="mx-auto mb-4 flex h-12 md:h-16 w-12 md:w-16 items-center justify-center rounded-full bg-muted">
          <Code2 className="h-6 md:h-8 w-6 md:w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-base md:text-lg font-semibold">No submissions yet</h3>
        <p className="mb-4 text-xs md:text-sm text-muted-foreground">
          Start by analyzing your first piece of code
        </p>
        <Link to="/analyzer">
          <Button className="bg-gradient-primary text-sm">
            Analyze Code
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold">Recent Submissions</h3>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="text-primary text-xs md:text-sm">
            View All
            <ArrowRight className="ml-1 h-3 md:h-4 w-3 md:w-4" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border">
        {submissions.slice(0, 5).map((submission) => (
          <div
            key={submission.id}
            className="flex items-center gap-2 md:gap-4 p-3 md:p-4 transition-colors hover:bg-muted/30"
          >
            <ScoreDisplay score={submission.score || 0} size="sm" showLabel={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="secondary" className="text-xs capitalize">
                  {submission.language}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="truncate text-xs md:text-sm text-muted-foreground font-mono">
                {submission.original_code.slice(0, 50)}...
              </p>
            </div>
            <Link to={`/history/${submission.id}`}>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 md:h-10 md:w-10">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
