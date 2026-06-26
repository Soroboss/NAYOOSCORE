"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { NavGroup } from "@/lib/nav-config";
import { IconByName } from "@/components/icons/icon-by-name";

import type { IconName } from "@/lib/icon-names";
import { Settings2 } from "lucide-react";

type AppSidebarProps = {
  navGroups: NavGroup[];
  spaceLabel: string;
  spaceIcon?: IconName;
};

export function AppSidebar({ navGroups, spaceLabel, spaceIcon }: AppSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar className="border-r border-white/10 bg-[#0B1D2A] text-white">
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size="sm" variant="light" className="items-start" />
        </Link>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#132B49] px-3 py-2 text-xs font-medium text-white/90">
          {spaceIcon ? (
            <IconByName name={spaceIcon} className="size-4 text-[#00BFA6]" />
          ) : (
            <IconByName name="shield" className="size-4 text-[#00BFA6]" />
          )}
          <span>{spaceLabel}</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navGroups.map((group, index) => (
          <SidebarGroup key={group.label ?? `group-${index}`}>
            {group.label && (
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-white/40">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      className="text-white/80 hover:bg-[#132B49] hover:text-white data-[active=true]:bg-[#00BFA6]/15 data-[active=true]:text-[#00BFA6]"
                    >
                      <Link href={item.href}>
                        <IconByName name={item.icon} className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Settings2 className="size-3.5" />
          <span>Nayooscore v0.1</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
