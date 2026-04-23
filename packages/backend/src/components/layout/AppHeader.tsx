import { Bell, Search, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const shortcuts = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI", href: "/ai" },
  { label: "Modules", href: "/modules" },
  { label: "Readiness", href: "/readiness" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Live ESG workspace
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto md:hidden">
            {shortcuts.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-white/70 text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-2 hidden max-w-xl md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search disclosures, workflows, or evidence"
                className="h-11 border-white/10 bg-white/70 pl-10 shadow-sm shadow-black/5 backdrop-blur"
              />
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {shortcuts.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-white/10 bg-white/60"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button className="h-10 rounded-full bg-[#101513] px-4 text-sm font-medium text-white hover:bg-[#101513]/90">
            New filing
          </Button>
        </div>
      </div>
    </header>
  );
}
