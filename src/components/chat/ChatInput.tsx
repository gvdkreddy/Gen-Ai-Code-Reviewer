import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Ask me anything about your code...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 border-t border-border bg-card p-2 md:p-4">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[36px] md:min-h-[44px] max-h-24 md:max-h-32 resize-none bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary text-sm"
        disabled={isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        className="h-9 md:h-11 w-9 md:w-11 shrink-0 bg-gradient-primary hover:opacity-90"
        size="icon"
      >
        {isLoading ? (
          <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin" />
        ) : (
          <Send className="h-4 md:h-5 w-4 md:w-5" />
        )}
      </Button>
    </div>
  );
}
