import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '@/lib/store/auth';

export function DashboardLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-5">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto mt-4 max-w-[1380px] rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_70px_rgba(28,39,51,0.08)] backdrop-blur-xl md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
