import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BellRing,
  CirclePlus,
  CreditCard,
  Database,
  FileText,
  GitBranch,
  LayoutDashboard,
  Layers,
  MessageSquareText,
  Plug,
  Radio,
  Sparkles,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';

const navigation = [
  { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard, hint: 'Overview' },
  { name: 'BRSR Readiness', href: '/dashboard/readiness', icon: ShieldCheck, hint: 'Live evidence' },
  { name: 'BRSR Filings', href: '/dashboard/reports', icon: FileText, hint: 'Annual draft' },
  { name: 'Channels', href: '/dashboard/channels', icon: Radio, hint: 'WhatsApp, email' },
  { name: 'Records', href: '/dashboard/data', icon: Database, hint: 'Evidence' },
  { name: 'Workflows', href: '/dashboard/workflows', icon: GitBranch, hint: 'Follow-ups' },
  { name: 'Templates', href: '/dashboard/templates', icon: Layers, hint: 'Journeys' },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug, hint: 'Sources' },
  { name: 'Automations', href: '/dashboard/workflow-rules', icon: Sparkles, hint: 'Agents' },
  { name: 'Team & Seats', href: '/dashboard/settings', icon: Users, hint: 'Allocate reviewers' },
];

export function Sidebar() {
  const { tenant, user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <aside className="sticky top-0 flex h-screen w-[290px] flex-col px-3 py-4">
      <div className="flex h-full flex-col rounded-[2rem] border border-white/60 bg-sidebar/90 p-3 shadow-[0_16px_50px_rgba(41,52,65,0.06)] backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            EN
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">EnovAIt</p>
            <p className="text-xs text-muted-foreground">India-first ESG workspace</p>
          </div>
        </div>

        <button className="mt-3 flex items-center gap-3 rounded-2xl border border-transparent bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-border">
          <CirclePlus className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">New filing thread</p>
            <p className="text-xs text-muted-foreground">Start FY 2025-26 BRSR intake</p>
          </div>
        </button>

        <div className="mt-6 px-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all',
                  isActive
                    ? 'bg-white text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:bg-white/75 hover:text-foreground'
                )
              }
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/50 text-primary transition-colors group-hover:bg-accent">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
              </div>
            </NavLink>
          ))}
        </nav>

        {isSuperAdmin ? (
          <>
            <div className="mt-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Platform</p>
            </div>
            <nav className="mt-2 space-y-1">
              <NavLink
                to="/dashboard/platform"
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all',
                    isActive
                      ? 'bg-white text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:bg-white/75 hover:text-foreground'
                  )
                }
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/50 text-primary transition-colors group-hover:bg-accent">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">Platform Console</p>
                  <p className="truncate text-xs text-muted-foreground">Subscriptions, logs</p>
                </div>
              </NavLink>
            </nav>
          </>
        ) : null}

        <div className="mt-4 rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Growth Plan</p>
              <p className="text-xs text-muted-foreground">Seats and subscription governed</p>
            </div>
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-muted px-3 py-2">
              <p className="text-muted-foreground">Entities</p>
              <p className="mt-1 font-semibold">12 / 25</p>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2">
              <p className="text-muted-foreground">Channels</p>
              <p className="mt-1 font-semibold">4 live</p>
            </div>
          </div>
          <NavLink
            to="/dashboard/settings"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95"
          >
            <BellRing className="h-4 w-4" />
            Open admin console
          </NavLink>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/70 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
            {tenant?.name?.[0] || 'E'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{tenant?.name || 'EnovAIt Workspace'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role || 'member'} access</p>
          </div>
          <MessageSquareText className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
