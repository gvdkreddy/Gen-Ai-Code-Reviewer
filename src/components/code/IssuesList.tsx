import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bug,
  Shield,
  Zap,
  Code,
  Lightbulb,
} from "lucide-react";
import type { Issue } from "@/lib/supabase";

interface IssuesListProps {
  issues: Issue[];
  className?: string;
}

const severityConfig = {
  critical: {
    className: "severity-critical",
    icon: AlertTriangle,
    label: "Critical",
  },
  high: {
    className: "severity-high",
    icon: AlertTriangle,
    label: "High",
  },
  medium: {
    className: "severity-medium",
    icon: AlertTriangle,
    label: "Medium",
  },
  low: {
    className: "severity-low",
    icon: AlertTriangle,
    label: "Low",
  },
};

const typeConfig = {
  bug: {
    icon: Bug,
    label: "Bug",
    color: "text-destructive",
  },
  security: {
    icon: Shield,
    label: "Security",
    color: "text-orange-400",
  },
  performance: {
    icon: Zap,
    label: "Performance",
    color: "text-warning",
  },
  style: {
    icon: Code,
    label: "Style",
    color: "text-info",
  },
  logic: {
    icon: Lightbulb,
    label: "Logic",
    color: "text-purple-400",
  },
};

export function IssuesList({ issues, className }: IssuesListProps) {
  if (!issues || issues.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6 text-center", className)}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
          <Shield className="h-6 w-6 text-success" />
        </div>
        <p className="font-medium text-foreground">No Issues Found</p>
        <p className="text-sm text-muted-foreground">Your code looks great!</p>
      </div>
    );
  }

  // Group issues by severity
  const groupedIssues = issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = acc[issue.severity] || [];
      acc[issue.severity].push(issue);
      return acc;
    },
    {} as Record<string, Issue[]>
  );

  const severityOrder = ["critical", "high", "medium", "low"];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">Issues Found ({issues.length})</h3>
        <div className="flex gap-2">
          {severityOrder.map((severity) => {
            const count = groupedIssues[severity]?.length || 0;
            if (count === 0) return null;
            const config = severityConfig[severity as keyof typeof severityConfig];
            return (
              <Badge key={severity} className={cn("text-xs", config.className)}>
                {count} {config.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {severityOrder.map((severity) => {
          const severityIssues = groupedIssues[severity];
          if (!severityIssues?.length) return null;

          return severityIssues.map((issue, idx) => {
            const sevConfig = severityConfig[issue.severity];
            const typeConf = typeConfig[issue.type];
            const TypeIcon = typeConf.icon;

            return (
              <div
                key={`${severity}-${idx}`}
                className="animate-fade-in rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5", typeConf.color)}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", sevConfig.className)}>
                        {sevConfig.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {typeConf.label}
                      </Badge>
                      {issue.line && (
                        <span className="text-xs text-muted-foreground">
                          Line {issue.line}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{issue.message}</p>
                    {issue.suggestion && (
                      <div className="rounded-md bg-muted/50 p-2">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-primary">Suggestion:</span>{" "}
                          {issue.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
