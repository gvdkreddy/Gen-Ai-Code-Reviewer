import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  title,
  showLineNumbers = true,
  className,
  maxHeight = "400px",
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 16);
  const lineHeightRem = 1.5; // corresponds to Tailwind's leading-6 (1.5rem)
  const contentMinHeight = `${lineCount * lineHeightRem}rem`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore clipboard errors
    }
  };

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Window dots */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-warning/60" />
            <div className="h-3 w-3 rounded-full bg-success/60" />
          </div>
          {title && <span className="text-sm font-medium text-muted-foreground">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          {onLanguageChange && !readOnly && (
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {readOnly && (
            <span className="text-xs text-muted-foreground capitalize">{language}</span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Code area */}
      <div
        className="custom-scrollbar overflow-auto bg-muted/30"
        style={{ maxHeight, minHeight: contentMinHeight }}
      >
        <div className="flex" style={{ minHeight: contentMinHeight }}>
          {showLineNumbers && (
            <div className="sticky left-0 flex-shrink-0 select-none border-r border-border bg-muted/50 px-3 py-4 text-right font-mono text-xs text-muted-foreground">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <div className="flex-1 p-4">
            {readOnly ? (
              <pre
                className="font-mono text-sm leading-6 text-foreground whitespace-pre-wrap break-all"
                style={{ minHeight: contentMinHeight }}
              >
                {value || "// No code"}
              </pre>
            ) : (
              <textarea
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full resize-none bg-transparent font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                style={{ minHeight: contentMinHeight }}
                placeholder="// Paste your code here..."
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
