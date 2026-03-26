import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Layers, 
  FileText, 
  GitBranch, 
  Plug, 
  Database, 
  BarChart3, 
  Terminal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Modules', href: '/dashboard/modules', icon: Layers },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'Workflow Rules', href: '/dashboard/workflow-rules', icon: GitBranch },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Data Records', href: '/dashboard/data', icon: Database },
  { name: 'Workflows', href: '/dashboard/workflows', icon: GitBranch },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Channels Console', href: '/dashboard/channels', icon: Terminal },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const { tenant } = useAuthStore();

  return (
    <div className="flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
          E
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none">EnovAIt</span>
          <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">AI Layer Active</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="bg-accent/50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-accent transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {tenant?.name?.[0] || 'T'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold truncate">Monitoring {tenant?.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">Active Workspace</span>
            </div>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
