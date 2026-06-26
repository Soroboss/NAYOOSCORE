"use client";

import { signOutAction } from "@/app/actions/auth";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { User } from "@/types/user";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  user: User;
  title?: string;
};

export function AppHeader({ user, title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#0B1D2A]/10 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-[#0B1D2A] hover:bg-[#F5F7FA]" />
        {title && (
          <h2 className="hidden text-sm font-semibold text-[#0B1D2A] sm:block">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#0B1D2A] hover:bg-[#F5F7FA]"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>
        <form action={signOutAction} className="hidden sm:block">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="gap-2 border-[#0B1D2A]/15 text-[#0B1D2A]"
          >
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </form>
        <UserNav user={user} />
      </div>
    </header>
  );
}
