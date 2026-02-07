import { useState, useRef } from "react";
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
  Download,
} from "lucide-react";
import type { Issue, ReviewResult } from "@/lib/supabase";

/* ---------------- TYPES ---------------- */

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

/* ---------------- FILE EXT ---------------- */

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    csharp: "cs",
    php: "php",
    ruby: "rb",
    go: "go",
    rust: "rs",
  };
  return extensions[language?.toLowerCase()] || "txt";
};

/* ---------------- DOWNLOAD BUTTON ---------------- */

interface DownloadButtonProps {
  code: string;
  filename: string;
  label: string;
}

const DownloadButton = ({ code, filename, label }: DownloadButtonProps) => {
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
};

/* ---------------- MAIN ---------------- */

export default function Analyzer() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  /* Upload */
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; content: string; language?: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* Export toggles */
  const [showOriginalOptions, setShowOriginalOptions] = useState(false);
  const [showOptimizedOptions, setShowOptimizedOptions] = useState(false);
  const [showRewrittenOptions, setShowRewrittenOptions] = useState(false);

  /* ---------------- LANGUAGE INFER ---------------- */

  const inferLanguageFromName = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "php":
        return "php";
      case "c":
        return "c";
      case "cpp":
      case "cc":
      case "cxx":
      case "c++":
        return "cpp";
      case "cs":
        return "csharp";
      case "rb":
        return "ruby";
      case "html":
      case "css":
        return "html css";
      default:
        return "javascript";
    }
  };

  /* ---------------- READ FILES ---------------- */

  const readFiles = async (files: FileList | null) => {
    if (!files) return;

    const readers = Array.from(files).map(
      (f) =>
        new Promise<{
          name: string;
          content: string;
          language?: string;
        }>((res, rej) => {
          const r = new FileReader();
          r.onload = () =>
            res({
              name: f.name,
              content: String(r.result ?? ""),
              language: inferLanguageFromName(f.name),
            });
          r.onerror = rej;
          r.readAsText(f);
        })
    );

    try {
      const results = await Promise.all(readers);
      setUploadedFiles(results);

      if (results.length > 0) {
        setCode(results[0].content);
        setLanguage(results[0].language || "javascript");
      }

      toast({
        title: "Files loaded",
        description: `${results.length} file(s) prepared for analysis`,
      });
    } catch {
      toast({
        title: "File read failed",
        description: "Could not read one or more files",
        variant: "destructive",
      });
    }
  };

  /* ---------------- ANALYZE ---------------- */

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
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setResult(null);
    setUploadedFiles([]);
  };

  /* ---------------- UI ---------------- */

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Code Analyzer</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Paste your code for AI-powered review, optimization, and scoring
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">

            <Button variant="outline" onClick={clearAll}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.php,.c,.cpp,.cs,.rb,.html,.css,.json,.txt"
              onChange={(e) => readFiles(e.target.files)}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Files
            </Button>

            <Button
              onClick={analyzeCode}
              disabled={isAnalyzing || !code.trim()}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Analyze</span>
                  <span className="sm:hidden">Run</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* EDITOR + SCORE */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3 animate-slide-up">

          <div className="lg:col-span-2">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              title="Your Code"
              maxHeight="400px md:500px"
            />
          </div>

          <div style={{ animationDelay: "100ms" }}>
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h3 className="mb-4 text-base md:text-lg font-semibold">
                Code Score
              </h3>

              {result ? (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-center">
                    <ScoreDisplay score={result.score} size="md md:lg" />
                  </div>
                  <ScoreBreakdown scores={result.scores} />
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Submit code to see your score
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* EXPORT — FULL */}
        {result && (
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">

            <h3 className="font-semibold">Export Results & Analysis</h3>

            {/* ORIGINAL */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setShowOriginalOptions(!showOriginalOptions)
                }
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Export Original Code
              </button>

              {showOriginalOptions && (
                <div className="flex space-x-4 mt-2 ml-4">
                  <DownloadButton
                    code={code}
                    filename={`original_${Date.now()}.csv`}
                    label="Export as CSV"
                  />
                  <DownloadButton
                    code={code}
                    filename={`original_${Date.now()}.json`}
                    label="Export as JSON"
                  />
                  <DownloadButton
                    code={code}
                    filename={`original_${Date.now()}.txt`}
                    label="Export as Text"
                  />
                </div>
              )}
            </div>

            {/* OPTIMIZED */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setShowOptimizedOptions(!showOptimizedOptions)
                }
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Export Optimized Code
              </button>

              {showOptimizedOptions && (
                <div className="flex space-x-4 mt-2 ml-4">
                  <DownloadButton
                    code={result.optimizedCode}
                    filename={`optimized_${Date.now()}.csv`}
                    label="Export as CSV"
                  />
                  <DownloadButton
                    code={result.optimizedCode}
                    filename={`optimized_${Date.now()}.json`}
                    label="Export as JSON"
                  />
                  <DownloadButton
                    code={result.optimizedCode}
                    filename={`optimized_${Date.now()}.txt`}
                    label="Export as Text"
                  />
                </div>
              )}
            </div>

            {/* REWRITTEN */}
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setShowRewrittenOptions(!showRewrittenOptions)
                }
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Export Rewritten Code
              </button>

              {showRewrittenOptions && (
                <div className="flex space-x-4 mt-2 ml-4">
                  <DownloadButton
                    code={result.rewrittenCode}
                    filename={`rewritten_${Date.now()}.csv`}
                    label="Export as CSV"
                  />
                  <DownloadButton
                    code={result.rewrittenCode}
                    filename={`rewritten_${Date.now()}.json`}
                    label="Export as JSON"
                  />
                  <DownloadButton
                    code={result.rewrittenCode}
                    filename={`rewritten_${Date.now()}.txt`}
                    label="Export as Text"
                  />
                </div>
              )}
            </div>

          </div>
        )}

        {/* TABS */}
        {result && (
          <Tabs defaultValue="issues" className="w-full">

            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues"><Shield /> Issues</TabsTrigger>
              <TabsTrigger value="optimized"><Zap /> Optimized</TabsTrigger>
              <TabsTrigger value="rewritten"><Sparkles /> Rewritten</TabsTrigger>
              <TabsTrigger value="summary"><CheckCircle /> Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="mt-6">
              <IssuesList issues={result.issues} />
            </TabsContent>

            <TabsContent value="optimized" className="mt-6">
              <CodeComparison
                originalCode={code}
                improvedCode={result.optimizedCode}
                language={language}
                changes={[
                  "Improved time complexity",
                  "Reduced memory usage",
                  "Better algorithms",
                ]}
              />
            </TabsContent>

            <TabsContent value="rewritten" className="mt-6">
              <CodeComparison
                originalCode={code}
                improvedCode={result.rewrittenCode}
                language={language}
                changes={[
                  "Clean structure",
                  "Better naming",
                  "Modular design",
                  "Added comments",
                ]}
              />
            </TabsContent>

            {/* SUMMARY FULL */}
            <TabsContent value="summary" className="mt-6">
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">

                <h3 className="text-lg font-semibold">Review Summary</h3>
                <p className="text-muted-foreground">
                  {result.review.summary}
                </p>

                <div className="grid gap-4 md:grid-cols-2">

                  {result.review.improvements.length > 0 && (
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="font-medium text-success mb-2">
                        Improvements Made
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.review.improvements.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.review.securityIssues.length > 0 && (
                    <div className="rounded-lg bg-destructive/10 p-4">
                      <h4 className="font-medium text-destructive mb-2">
                        Security Issues
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.review.securityIssues.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.review.performanceIssues.length > 0 && (
                    <div className="rounded-lg bg-warning/10 p-4">
                      <h4 className="font-medium text-warning mb-2">
                        Performance Issues
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {result.review.performanceIssues.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.review.bestPractices.length > 0 && (
                    <div className="rounded-lg bg-info/10 p-4">
                      <h4 className="font-medium text-info mb-2">
                        Best Practices
                      </h4>
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
        )}

      </div>
    </AppLayout>
  );
}
