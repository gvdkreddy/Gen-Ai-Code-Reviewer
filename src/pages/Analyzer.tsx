import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CodeEditor } from "@/components/code/CodeEditor";
import { CodeComparison } from "@/components/code/CodeComparison";
import { ScoreDisplay, ScoreBreakdown } from "@/components/code/ScoreDisplay";
import { IssuesList } from "@/components/code/IssuesList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
} from "lucide-react";
import type { Issue, ReviewResult } from "@/lib/supabase";

type AnalysisResult = {
  score: number;
  scores: {
    quality: number;
    efficiency: number;
    security: number;
    readability: number;
    bestPractices: number;
  };
  issues: Issue[];
  review: ReviewResult;
  optimizedCode: string;
  rewrittenCode: string;
};

export default function Analyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("analyze-code", {
        body: { code, language },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const analysisResult = response.data as AnalysisResult;
      setResult(analysisResult);

      // Save to database
      if (user) {
        await supabase.from("code_submissions").insert({
          user_id: user.id,
          original_code: code,
          language,
          score: analysisResult.score,
          issues_found: analysisResult.issues,
          review_result: analysisResult.review,
          optimized_code: analysisResult.optimizedCode,
          rewritten_code: analysisResult.rewrittenCode,
        });
      }

      toast({
        title: "Analysis complete",
        description: `Your code scored ${analysisResult.score}/100`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setResult(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Code Analyzer</h1>
            <p className="text-muted-foreground">
              Paste your code for AI-powered review, optimization, and scoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll} disabled={isAnalyzing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={analyzeCode}
              disabled={isAnalyzing || !code.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Code Input */}
          <div className="lg:col-span-2 animate-slide-up">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              title="Your Code"
              maxHeight="500px"
            />
          </div>

          {/* Score Display */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Code Score</h3>
              {result ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <ScoreDisplay score={result.score} size="lg" />
                  </div>
                  <ScoreBreakdown scores={result.scores} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submit code to see your score
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-slide-up space-y-6">
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="issues" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Issues</span>
                </TabsTrigger>
                <TabsTrigger value="optimized" className="gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Optimized</span>
                </TabsTrigger>
                <TabsTrigger value="rewritten" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Rewritten</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-6">
                <IssuesList issues={result.issues} />
              </TabsContent>

              <TabsContent value="optimized" className="mt-6">
                <CodeComparison
                  originalCode={code}
                  improvedCode={result.optimizedCode}
                  language={language}
                  changes={["Improved time complexity", "Reduced memory usage", "Better algorithms"]}
                />
              </TabsContent>

              <TabsContent value="rewritten" className="mt-6">
                <CodeComparison
                  originalCode={code}
                  improvedCode={result.rewrittenCode}
                  language={language}
                  changes={["Clean structure", "Better naming", "Modular design", "Added comments"]}
                />
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Review Summary</h3>
                  <p className="mb-6 text-muted-foreground">{result.review.summary}</p>

                  <div className="grid gap-4 md:grid-cols-2">
                    {result.review.improvements.length > 0 && (
                      <div className="rounded-lg bg-muted/30 p-4">
                        <h4 className="mb-2 font-medium text-success">Improvements Made</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {result.review.improvements.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.review.securityIssues.length > 0 && (
                      <div className="rounded-lg bg-destructive/10 p-4">
                        <h4 className="mb-2 font-medium text-destructive">Security Issues</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {result.review.securityIssues.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.review.performanceIssues.length > 0 && (
                      <div className="rounded-lg bg-warning/10 p-4">
                        <h4 className="mb-2 font-medium text-warning">Performance Issues</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {result.review.performanceIssues.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.review.bestPractices.length > 0 && (
                      <div className="rounded-lg bg-info/10 p-4">
                        <h4 className="mb-2 font-medium text-info">Best Practices</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {result.review.bestPractices.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
