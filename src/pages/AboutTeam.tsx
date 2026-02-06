import { Users, Zap, Code2, Globe, Sparkles, Github } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: number;
  name: string;
  github: string;
}

const teamMembers: TeamMember[] = [
  { id: 1, name: "Gopavaram Venkata Dharani Kumar Reddy", github: "https://github.com/gvdkreddy" },
  { id: 2, name: "A. Dharinish", github: "https://github.com/Dharinish17" },
  { id: 3, name: "T Bhargav Reddy", github: "https://github.com/bhargavreddy-devhub" },
  { id: 4, name: "Sai Aditya Bhagavatula", github: "https://github.com/sai-aditya-bhagavatula" },
];

export default function AboutTeam() {
  return (
    <AppLayout>
      <div className="space-y-12 animate-fade-in">
        {/* Page Header */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary glow-primary">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">About Team</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Meet the innovators behind the AI Code Review & Rewrite Agent.
          </p>
        </div>

        {/* Team Overview Section */}
        <Card className="overflow-hidden border-border bg-card p-8 animate-slide-up">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-4">Team Overview</h2>
              <div className="h-1 w-16 bg-gradient-primary rounded"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {/* Team Name */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Team Name</p>
                </div>
                <p className="text-xl font-bold">Team Kronix</p>
              </div>

              {/* Team Size */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Team Size</p>
                </div>
                <p className="text-xl font-bold">4 Members</p>
              </div>

              {/* Problem Domain */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
                    <Zap className="h-5 w-5 text-info" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Domain</p>
                </div>
                <p className="text-xl font-bold">Generative AI</p>
              </div>

              {/* Problem Statement */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                    <Code2 className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Problem</p>
                </div>
                <p className="text-lg font-bold">AI Code Review</p>
              </div>

              {/* Website Name */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                    <Globe className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Website</p>
                </div>
                <p className="text-xl font-bold">TeamKronix</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Team Members Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Team Members</h2>
            <p className="mt-1 text-muted-foreground">Meet the talented developers behind our innovation</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <Card
                key={member.id}
                className="overflow-hidden border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:translate-y-[-4px] animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Avatar */}
                <div className="mb-4 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary glow-primary">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-sm font-bold leading-tight">{member.name}</h3>
                </div>

                {/* Social Links */}
                <div className="mt-4 flex justify-center gap-2 border-t border-border/50 pt-4">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Logo Section */}
        <Card className="overflow-hidden border-border bg-card p-8 animate-slide-up">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-4">Team Logo</h2>
              <div className="h-1 w-16 bg-gradient-primary rounded"></div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Glowing container */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 blur-xl group-hover:opacity-100 transition-all"></div>

                {/* Logo card */}
                <div className="relative rounded-2xl border border-primary/30 bg-muted/50 p-8 backdrop-blur-sm">
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gradient-primary/10">
                        <img src="/favicon.ico" alt="Team Kronix Logo"  />
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm text-muted-foreground font-medium">
                Official Team Kronix Logo
              </p>
              <Badge variant="outline" className="mt-3">
                Team Kronix © 2026
              </Badge>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="border-t border-border/50 pt-8 pb-4">
          <div className="flex flex-col items-center gap-4">
            <img src="/favicon.ico" alt="Team Kronix Logo" className="h-8 w-8" />
            <p className="text-center text-sm text-muted-foreground">
              Built with innovation by Team Kronix © 2026
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
