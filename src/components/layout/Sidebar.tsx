import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Code2,
  LayoutDashboard,
  History,
  MessageSquare,
  LogOut,
  User,
  Shield,
  Zap,
  Send,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Code Analyzer", href: "/analyzer", icon: Code2 },
  { title: "History", href: "/history", icon: History },
  { title: "AI Support", href: "/chat", icon: MessageSquare },
  { title: "Feedback", href: "/feedback", icon: Send },
  { title: "About Team", href: "/about-team", icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, role, signOut } = useAuth();

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex-col">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">TeamKronix</h1>
            <p className="text-xs text-muted-foreground">AI Agent</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary glow-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          {/* Settings */}
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mb-3",
              location.pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-primary glow-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
            )}
          >
            <Settings className={cn("h-5 w-5", location.pathname === "/settings" && "text-sidebar-primary")} />
            Settings
          </Link>

          {/* Profile */}
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {profile?.display_name || "User"}
              </p>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs capitalize text-muted-foreground">{role}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
