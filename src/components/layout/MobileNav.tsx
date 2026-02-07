import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Code2,
  LayoutDashboard,
  History,
  MessageSquare,
  LogOut,
  Shield,
  Zap,
  Send,
  Users,
  BarChart3,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
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

export function MobileNav() {
  const location = useLocation();
  const { profile, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);

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
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-background border-b border-border">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-semibold">TeamKronix</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="h-9 w-9"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">TeamKronix</h1>
                <p className="text-xs text-muted-foreground">AI Agent</p>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary glow-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom User Section */}
          <div className="absolute bottom-0 left-0 right-0 space-y-3 border-t border-sidebar-border p-4">
            {/* Settings */}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                location.pathname === "/settings"
                  ? "bg-sidebar-accent text-sidebar-primary glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
              )}
            >
              <Settings className={cn("h-5 w-5", location.pathname === "/settings" && "text-sidebar-primary")} />
              <span>Settings</span>
            </Link>

            {/* Profile */}
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
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
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
