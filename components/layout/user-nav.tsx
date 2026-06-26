"use client";

import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/nav-config";
import { getSettingsPath } from "@/lib/settings-path";
import type { User } from "@/types/user";
import { LogOut, Settings, UserRound } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserNav({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-2 py-1.5 hover:bg-[#F5F7FA]"
        >
          <Avatar className="size-8 border border-[#00BFA6]/30">
            <AvatarFallback className="bg-[#0B1D2A] text-xs text-white">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-[#0B1D2A]">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-2">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-[#0077B6]" />
            <span className="font-medium">{user.full_name}</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-[#00BFA6]/10 text-[#00BFA6] hover:bg-[#00BFA6]/10"
          >
            {ROLE_LABELS[user.role] ?? user.role}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getSettingsPath(user.role)} className="flex items-center gap-2">
            <Settings className="size-4" />
            Paramètres
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 text-destructive"
            >
              <LogOut className="size-4" />
              Se déconnecter
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
