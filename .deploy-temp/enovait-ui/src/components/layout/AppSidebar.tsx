import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  FileText,
  Workflow,
  ClipboardList,
  Database,
  BarChart3,
  Share2,
  Plug,
  Settings,
  ShieldAlert,
  Key,
  HelpCircle,
  Mail,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { group: "Overview", links: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "AI Assistant", url: "/ai", icon: MessageSquare },
  ]},
  { group: "Governance", links: [
    { title: "Modules", url: "/modules", icon: Package },
    { title: "Templates", url: "/templates", icon: FileText },
    { title: "Workflows", url: "/workflows", icon: Workflow },
    { title: "Review Queue", url: "/review", icon: ClipboardList },
  ]},
  { group: "Data & Reporting", links: [
    { title: "Records / Data", url: "/data", icon: Database },
    { title: "Filings / Reports", url: "/reports", icon: BarChart3 },
    { title: "Channels", url: "/channels", icon: Share2 },
  ]},
  { group: "Connectivity", links: [
    { title: "Integrations", url: "/integrations", icon: Plug },
    { title: "WhatsApp Setup", url: "/whatsapp-setup", icon: Zap },
    { title: "Email Templates", url: "/email-templates", icon: Mail },
  ]},
  { group: "Platform", links: [
    { title: "Console", url: "/platform", icon: Settings },
    { title: "Secrets", url: "/secrets", icon: Key },
    { title: "Readiness", url: "/readiness", icon: ShieldAlert },
    { title: "Settings", url: "/settings", icon: Settings },
  ]},
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-brand-charcoal text-white">
      <SidebarHeader className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-green text-white font-bold text-sm">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight uppercase group-data-[collapsible=icon]:hidden">
            EnovAIt
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        {items.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold group-data-[collapsible=icon]:hidden">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.links.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200 px-3 py-2 flex items-center gap-3 rounded-md border-l-2 border-transparent",
                        location.pathname === item.url 
                          ? "bg-brand-green/20 text-white border-brand-green" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-500 text-white text-[10px]">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-semibold truncate text-white">Admin User</p>
            <p className="text-[10px] text-gray-500 truncate">admin@enov360.com</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
