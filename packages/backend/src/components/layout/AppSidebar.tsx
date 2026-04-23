import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Database,
  FileText,
  Key,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Plug,
  Settings,
  ShieldAlert,
  Share2,
  Workflow,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "AI Assistant", href: "/ai", icon: MessageSquare },
      { label: "Readiness", href: "/readiness", icon: ShieldAlert },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Modules", href: "/modules", icon: Package },
      { label: "Templates", href: "/templates", icon: FileText },
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Review Queue", href: "/review", icon: ClipboardList },
    ],
  },
  {
    label: "Data & Reporting",
    items: [
      { label: "Records", href: "/data", icon: Database },
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Channels", href: "/channels", icon: Share2 },
    ],
  },
  {
    label: "Connectivity",
    items: [
      { label: "Integrations", href: "/integrations", icon: Plug },
      { label: "WhatsApp Setup", href: "/whatsapp-setup", icon: Zap },
      { label: "Email Templates", href: "/email-templates", icon: Mail },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Console", href: "/platform", icon: Settings },
      { label: "Secrets", href: "/secrets", icon: Key },
    ],
  },
];

export function AppSidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-[#101513] text-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4A6741] font-semibold text-white shadow-lg shadow-[#4A6741]/20">
            E
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">EnovAIt</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
              ESG intelligence layer
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-white/10 text-white shadow-inner"
                          : "text-white/55 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#4A6741] text-white">
                AU
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                Admin Workspace
              </p>
              <p className="truncate text-[11px] text-white/45">
                admin@enov360.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
