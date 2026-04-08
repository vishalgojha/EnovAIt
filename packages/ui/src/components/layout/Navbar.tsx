import React from 'react';
import { Bell, Command, LogOut, Search, Settings, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/store/auth';

export function Navbar() {
  const { user, clearAuth, tenant } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-[1.75rem] border border-white/65 bg-white/75 px-5 py-4 shadow-[0_10px_40px_rgba(28,39,51,0.05)] backdrop-blur-xl">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
        <div className="mt-1 flex items-center gap-2">
          <h1 className="truncate text-lg font-semibold tracking-tight">{tenant?.name || 'EnovAIt'}</h1>
          <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
            SaaS
          </span>
        </div>
      </div>

      <div className="mx-6 hidden max-w-xl flex-1 lg:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search filings, entities, records, workflows..."
            className="h-11 rounded-2xl border-white bg-muted/50 pl-9 shadow-none focus-visible:ring-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-2xl border border-white/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground md:flex">
          <Command className="h-3.5 w-3.5" />
          Quick command
        </div>

        <Button variant="ghost" size="icon" className="relative rounded-2xl bg-muted/40">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-2xl bg-muted/40">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => clearAuth()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
