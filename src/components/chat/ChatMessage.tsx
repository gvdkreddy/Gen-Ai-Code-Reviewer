import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-2 md:gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-7 md:h-8 w-7 md:w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary/20" : "bg-gradient-primary"
        )}
      >
        {isUser ? (
          <User className="h-3 md:h-4 w-3 md:w-4 text-primary" />
        ) : (
          <Bot className="h-3 md:h-4 w-3 md:w-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        )}
      >
        <div
          className={cn(
            "prose prose-sm max-w-none text-xs md:text-sm",
            isUser ? "prose-invert" : "prose-invert",
            isStreaming && "typing-cursor"
          )}
        >
          <ReactMarkdown
            components={{
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code
                    className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3">
                    <code className="font-mono text-xs" {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
