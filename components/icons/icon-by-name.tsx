"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  HandCoins,
  Headphones,
  Landmark,
  LayoutDashboard,
  LineChart,
  MapPin,
  Megaphone,
  Package,
  Percent,
  Receipt,
  ScrollText,
  Shield,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Truck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import type { IconName } from "@/lib/icon-names";

const ICON_MAP: Record<IconName, LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  building2: Building2,
  clipboardList: ClipboardList,
  users: Users,
  creditCard: CreditCard,
  target: Target,
  scrollText: ScrollText,
  headphones: Headphones,
  briefcase: Briefcase,
  barChart3: BarChart3,
  percent: Percent,
  handCoins: HandCoins,
  trendingUp: TrendingUp,
  receipt: Receipt,
  wallet: Wallet,
  lineChart: LineChart,
  megaphone: Megaphone,
  mapPin: MapPin,
  userCircle: UserCircle,
  stethoscope: Stethoscope,
  truck: Truck,
  folderOpen: FolderOpen,
  sparkles: Sparkles,
  landmark: Landmark,
  package: Package,
  fileText: FileText,
  shield: Shield,
};

type IconByNameProps = {
  name: IconName;
  className?: string;
};

export function IconByName({ name, className }: IconByNameProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
