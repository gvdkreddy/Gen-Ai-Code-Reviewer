import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreDisplay({
  score,
  size = "md",
  showLabel = true,
  className,
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Work";
  };

  const getGradient = (score: number) => {
    if (score >= 90) return "from-success to-emerald-400";
    if (score >= 70) return "from-emerald-400 to-success";
    if (score >= 50) return "from-warning to-amber-400";
    return "from-destructive to-red-400";
  };

  const sizeClasses = {
    sm: "h-16 w-16 text-xl",
    md: "h-24 w-24 text-3xl",
    lg: "h-32 w-32 text-4xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-4 border-border bg-card",
          sizeClasses[size]
        )}
      >
        {/* Circular progress background */}
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 283} 283`}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(175 80% 60%)" />
            </linearGradient>
          </defs>
        </svg>
        <span className={cn("font-bold", getScoreColor(score))}>{score}</span>
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium", getScoreColor(score))}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

interface ScoreBreakdownProps {
  scores: {
    quality: number;
    efficiency: number;
    security: number;
    readability: number;
    bestPractices: number;
  };
  className?: string;
}

export function ScoreBreakdown({ scores, className }: ScoreBreakdownProps) {
  const categories = [
    { label: "Code Quality", value: scores.quality },
    { label: "Efficiency", value: scores.efficiency },
    { label: "Security", value: scores.security },
    { label: "Readability", value: scores.readability },
    { label: "Best Practices", value: scores.bestPractices },
  ];

  const getColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-emerald-400";
    if (score >= 50) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {categories.map((cat) => (
        <div key={cat.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{cat.label}</span>
            <span className="font-medium">{cat.value}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getColor(cat.value))}
              style={{ width: `${cat.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
