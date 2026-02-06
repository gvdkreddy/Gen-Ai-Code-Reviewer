import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, AlertCircle, CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function Feedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize EmailJS with public key
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // EmailJS configuration
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name,
          email: email,
          from_email: email,
          message: message,
          user_id: user?.id || "Anonymous",
          reply_to: email,
          to_email: "kronix2077@gmail.com",
        }
      );

      console.log("Email sent successfully:", response);

      toast({
        title: "Feedback sent successfully!",
        description: "Thank you for your feedback. We'll review it shortly.",
      });

      // Clear form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending feedback:", error);
      
      let errorMessage = "Failed to send feedback. Please try again.";
      if (error.text) {
        errorMessage = `Error: ${error.text}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary glow-primary">
              <MessageSquare className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Send Us Your Feedback</h1>
          <p className="mt-2 text-muted-foreground">
            We'd love to hear your thoughts, suggestions, or report any issues you've
            encountered.
          </p>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-8">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50"
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Your Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50"
              disabled={isSubmitting}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-base font-medium">
              Your Feedback
            </Label>
            <Textarea
              id="message"
              placeholder="Share your thoughts, suggestions, or report any issues..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-32 resize-none bg-muted/50"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Feedback
              </>
            )}
          </Button>
        </form>

        {/* Info Box */}
        <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">We value your input</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your feedback helps us improve the platform. Whether it's a bug report,
                feature request, or general suggestion, please don't hesitate to share.
              </p>
            </div>
          </div>
        </div>

        {/* Response Time Info */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-6 text-center">
          <CheckCircle className="mx-auto mb-3 h-6 w-6 text-success" />
          <p className="text-sm text-muted-foreground">
            We typically respond to feedback within 24-48 hours.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
