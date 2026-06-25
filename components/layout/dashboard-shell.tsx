"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { NavGroup } from "@/lib/nav-config";
import type { User } from "@/types/user";

type DashboardShellProps = {
  user: User;
  navGroups: NavGroup[];
  spaceLabel: string;
  spaceIcon?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardShell({
  user,
  navGroups,
  spaceLabel,
  spaceIcon,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        navGroups={navGroups}
        spaceLabel={spaceLabel}
        spaceIcon={spaceIcon}
      />
      <SidebarInset className="bg-[#F5F7FA]">
        <AppHeader user={user} title={spaceLabel} />
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
