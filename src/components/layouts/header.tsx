"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Globe,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  X,
  MessageSquare,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface HeaderProps {
  locale: string;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const mockNotifications = [
  { id: 1, title: "New student enrolled", desc: "Sara Ahmed was enrolled in Sunshine Room", time: "2 min ago", read: false, link: "/dashboard/students" },
  { id: 2, title: "Assessment completed", desc: "Omar Hassan - Cognitive domain", time: "15 min ago", read: false, link: "/dashboard/development" },
  { id: 3, title: "Payment received", desc: "$450 from Al-Rashid family", time: "1 hour ago", read: false, link: "/dashboard/billing" },
  { id: 4, title: "Staff meeting reminder", desc: "Tomorrow at 9:00 AM", time: "2 hours ago", read: true, link: "/dashboard/calendar" },
  { id: 5, title: "New message", desc: "From Ms. Fatima Ali", time: "3 hours ago", read: true, link: "/dashboard/messages" },
];

export function Header({ locale, user }: HeaderProps) {
  const isRTL = locale === "ar";
  const otherLocale = locale === "ar" ? "en" : "ar";
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: (typeof notifications)[0]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setNotifOpen(false);
    router.push(`/${locale}${notif.link}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-lg lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4 ps-12 lg:ps-0">
        <div className="hidden lg:block">
          <p className="text-sm text-muted-foreground">
            {isRTL ? "مرحبًا" : "Welcome back"},
          </p>
          <p className="font-semibold">{user.name}</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Link
          href={`/${otherLocale}/dashboard`}
          className="flex items-center"
        >
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Globe className="h-5 w-5" />
          </Button>
          <span className="hidden text-sm font-medium sm:inline">
            {locale === "ar" ? "EN" : "عربي"}
          </span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className={cn(
                "absolute top-full z-50 mt-2 w-80 rounded-2xl border bg-white shadow-xl",
                isRTL ? "left-0" : "right-0"
              )}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold text-sm">
                    {isRTL ? "الإشعارات" : "Notifications"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {isRTL ? "قراءة الكل" : "Mark all read"}
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                        !notif.read && "bg-blue-50/50"
                      )}
                    >
                      <div className={cn(
                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                        notif.read ? "bg-gray-300" : "bg-blue-500"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-sm truncate",
                          !notif.read ? "font-semibold" : "font-medium text-gray-700"
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{notif.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t p-2">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      router.push(`/${locale}/dashboard/messages`);
                    }}
                    className="w-full rounded-xl py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {isRTL ? "عرض الكل" : "View All Notifications"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-xl px-2"
            >
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="hidden text-start sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56">
            <DropdownMenuLabel>
              {isRTL ? "حسابي" : "My Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/dashboard/settings`)}
            >
              <User className="me-2 h-4 w-4" />
              {isRTL ? "الملف الشخصي" : "Profile"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/dashboard/settings`)}
            >
              <Settings className="me-2 h-4 w-4" />
              {isRTL ? "الإعدادات" : "Settings"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/${locale}/dashboard/messages`)}
            >
              <MessageSquare className="me-2 h-4 w-4" />
              {isRTL ? "الرسائل" : "Messages"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => router.push(`/${locale}/login`)}
            >
              <LogOut className="me-2 h-4 w-4" />
              {isRTL ? "تسجيل الخروج" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
