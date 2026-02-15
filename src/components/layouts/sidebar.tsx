"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  UserCheck,
  Heart,
  CreditCard,
  MessageCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Calendar,
  Baby,
  Stethoscope,
  Globe,
  Menu,
  X,
} from "lucide-react";

interface SidebarItem {
  label: string;
  labelAr: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    labelAr: "الطلاب",
    href: "/dashboard/students",
    icon: Baby,
  },
  {
    label: "Development",
    labelAr: "التطور",
    href: "/dashboard/development",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "ASSISTANT_TEACHER"],
  },
  {
    label: "Classes",
    labelAr: "الفصول",
    href: "/dashboard/classes",
    icon: School,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "ASSISTANT_TEACHER"],
  },
  {
    label: "Teachers",
    labelAr: "المعلمون",
    href: "/dashboard/teachers",
    icon: GraduationCap,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  },
  {
    label: "Parents",
    labelAr: "أولياء الأمور",
    href: "/dashboard/parents",
    icon: Users,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
  },
  {
    label: "Curriculum",
    labelAr: "المنهج",
    href: "/dashboard/curriculum",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
  },
  {
    label: "Health & Safety",
    labelAr: "الصحة والسلامة",
    href: "/dashboard/health",
    icon: Stethoscope,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "HEALTH_SUPERVISOR", "TEACHER"],
  },
  {
    label: "Billing",
    labelAr: "الفواتير",
    href: "/dashboard/billing",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"],
  },
  {
    label: "Messages",
    labelAr: "الرسائل",
    href: "/dashboard/messages",
    icon: MessageCircle,
  },
  {
    label: "Calendar",
    labelAr: "التقويم",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    label: "Reports",
    labelAr: "التقارير",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "ACCOUNTANT"],
  },
  {
    label: "Settings",
    labelAr: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  },
];

interface SidebarProps {
  locale: string;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export function Sidebar({ locale, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isRTL = locale === "ar";

  const filteredItems = sidebarItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: isRTL ? "مدير النظام" : "Super Admin",
    SCHOOL_ADMIN: isRTL ? "مدير المدرسة" : "School Admin",
    TEACHER: isRTL ? "معلم" : "Teacher",
    ASSISTANT_TEACHER: isRTL ? "معلم مساعد" : "Assistant Teacher",
    PARENT: isRTL ? "ولي أمر" : "Parent",
    ACCOUNTANT: isRTL ? "محاسب" : "Accountant",
    HEALTH_SUPERVISOR: isRTL ? "مشرف صحي" : "Health Supervisor",
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
          E
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="truncate text-lg font-bold text-foreground">
              {isRTL ? "منصة التعليم" : "EduPlatform"}
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const isActive = pathname === `/${locale}${item.href}` ||
            pathname.startsWith(`/${locale}${item.href}/`);
          const Icon = item.icon;
          const label = isRTL ? item.labelAr : item.label;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar name={user.name} src={user.avatar} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabels[user.role] || user.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <div className="hidden border-t p-2 lg:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
          {!collapsed && (
            <span className="ms-2">{isRTL ? "طي" : "Collapse"}</span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="fixed start-4 top-4 z-50 rounded-xl bg-card p-2 shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex flex-col border-e bg-card transition-all duration-300 lg:relative",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          isRTL && !mobileOpen && "translate-x-full lg:translate-x-0",
          isRTL && mobileOpen && "translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
