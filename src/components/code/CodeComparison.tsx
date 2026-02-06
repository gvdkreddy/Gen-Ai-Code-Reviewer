import { cn } from "@/lib/utils";
import { CodeEditor } from "./CodeEditor";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

interface CodeComparisonProps {
  originalCode: string;
  improvedCode: string;
  language: string;
  changes?: string[];
  className?: string;
}

export function CodeComparison({
  originalCode,
  improvedCode,
  language,
  changes = [],
  className,
}: CodeComparisonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {changes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {changes.slice(0, 5).map((change, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3 text-primary" />
              {change}
            </Badge>
          ))}
          {changes.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{changes.length - 5} more
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-muted-foreground">Original Code</span>
          </div>
          <CodeEditor
            value={originalCode}
            language={language}
            readOnly
            maxHeight="350px"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-muted-foreground">Improved Code</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <CodeEditor
            value={improvedCode}
            language={language}
            readOnly
            maxHeight="350px"
          />
        </div>
      </div>
    </div>
  );
}
