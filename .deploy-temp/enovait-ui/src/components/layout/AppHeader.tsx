import { Bell, Search, Command, User, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-gray-400" />
        <div className="hidden items-center text-sm text-gray-500 gap-2 md:flex">
          <span>Organization</span>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="font-medium text-gray-900">EnovAIt Workspace</span>
        </div>
        
        <div className="ml-8 relative hidden md:block">
          <Input 
            placeholder="Search workflows, data, or reports..." 
            className="w-96 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs focus-visible:ring-1 focus-visible:ring-brand-green"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <Button className="px-4 py-1.5 bg-brand-green text-white text-xs font-semibold rounded shadow-sm hover:bg-brand-green/90">
          New Filing
        </Button>
      </div>
    </header>
  );
}
