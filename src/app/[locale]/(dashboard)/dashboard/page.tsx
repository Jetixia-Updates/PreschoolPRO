"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Plus,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Calendar,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Baby,
  CreditCard,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";

// ── Animation variants ──────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

type DateRange = "today" | "week" | "month" | "year";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, info, warning, dismiss } = useToast();

  const [dateRange, setDateRange] = useState<DateRange>("month");

  // ── Helper ──────────────────────────────────────────────────────
  const nav = (path: string) => router.push(`/${locale}${path}`);

  // ── Translations ────────────────────────────────────────────────
  const t = {
    welcome: isRTL ? "مرحباً، أحمد" : "Welcome back, Ahmed",
    subtitle: isRTL
      ? "إليك نظرة عامة على منصتك التعليمية"
      : "Here's an overview of your educational platform",
    totalStudents: isRTL ? "إجمالي الطلاب" : "Total Students",
    totalTeachers: isRTL ? "إجمالي المعلمين" : "Total Teachers",
    activeClasses: isRTL ? "الفصول النشطة" : "Active Classes",
    monthlyRevenue: isRTL ? "الإيرادات الشهرية" : "Monthly Revenue",
    recentActivity: isRTL ? "النشاط الأخير" : "Recent Activity",
    upcomingEvents: isRTL ? "الأحداث القادمة" : "Upcoming Events",
    todayAttendance: isRTL ? "حضور اليوم" : "Today's Attendance",
    developmentAlerts: isRTL ? "تنبيهات التطور" : "Development Alerts",
    quickActions: isRTL ? "إجراءات سريعة" : "Quick Actions",
    addStudent: isRTL ? "إضافة طالب" : "Add Student",
    takeAttendance: isRTL ? "تسجيل الحضور" : "Take Attendance",
    sendMessage: isRTL ? "إرسال رسالة" : "Send Message",
    viewReports: isRTL ? "عرض التقارير" : "View Reports",
    isced010: isRTL ? "الطفولة المبكرة" : "Early Childhood",
    isced020: isRTL ? "ما قبل الابتدائي" : "Pre-Primary",
    present: isRTL ? "حاضر" : "Present",
    absent: isRTL ? "غائب" : "Absent",
    viewAll: isRTL ? "عرض الكل" : "View All",
    today: isRTL ? "اليوم" : "Today",
    week: isRTL ? "أسبوع" : "Week",
    month: isRTL ? "شهر" : "Month",
    year: isRTL ? "سنة" : "Year",
  };

  // ── Stats data ──────────────────────────────────────────────────
  const stats = [
    {
      title: t.totalStudents,
      value: "247",
      change: "+12 this month",
      changeType: "positive" as const,
      icon: Users,
      iconColor: "bg-blue-100 text-blue-600",
      href: "/dashboard/students",
    },
    {
      title: t.totalTeachers,
      value: "18",
      change: "+2 new hires",
      changeType: "positive" as const,
      icon: GraduationCap,
      iconColor: "bg-purple-100 text-purple-600",
      href: "/dashboard/teachers",
    },
    {
      title: t.activeClasses,
      value: "12",
      change: "Full capacity",
      changeType: "neutral" as const,
      icon: BookOpen,
      iconColor: "bg-green-100 text-green-600",
      href: "/dashboard/classes",
    },
    {
      title: t.monthlyRevenue,
      value: "$45,280",
      change: "+8.2% vs last month",
      changeType: "positive" as const,
      icon: DollarSign,
      iconColor: "bg-amber-100 text-amber-600",
      href: "/dashboard/billing",
    },
  ];

  // ── Quick actions ───────────────────────────────────────────────
  const quickActions = [
    {
      label: t.addStudent,
      icon: Plus,
      color: "bg-blue-100 text-blue-600",
      action: () => {
        nav("/dashboard/students?action=add");
        success(
          isRTL ? "إضافة طالب" : "Add Student",
          isRTL ? "جارٍ فتح نموذج إضافة طالب..." : "Opening add student form..."
        );
      },
    },
    {
      label: t.takeAttendance,
      icon: ClipboardList,
      color: "bg-green-100 text-green-600",
      action: () => {
        nav("/dashboard/classes");
        info(
          isRTL ? "تسجيل الحضور" : "Take Attendance",
          isRTL ? "جارٍ فتح صفحة الفصول..." : "Opening classes page..."
        );
      },
    },
    {
      label: t.sendMessage,
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-600",
      action: () => {
        nav("/dashboard/messages");
        info(
          isRTL ? "إرسال رسالة" : "Send Message",
          isRTL ? "جارٍ فتح الرسائل..." : "Opening messages..."
        );
      },
    },
    {
      label: t.viewReports,
      icon: BarChart3,
      color: "bg-amber-100 text-amber-600",
      action: () => {
        nav("/dashboard/reports");
        info(
          isRTL ? "عرض التقارير" : "View Reports",
          isRTL ? "جارٍ فتح التقارير..." : "Opening reports..."
        );
      },
    },
  ];

  // ── Recent activity data ────────────────────────────────────────
  const recentActivities = [
    {
      id: 1,
      type: "enrollment",
      text: isRTL
        ? "تم تسجيل طالب جديد: سارة أحمد"
        : "New student enrolled: Sara Ahmed",
      time: isRTL ? "منذ 5 دقائق" : "5 min ago",
      icon: Baby,
      color: "text-blue-600",
      bg: "bg-blue-100",
      href: "/dashboard/students",
    },
    {
      id: 2,
      type: "assessment",
      text: isRTL
        ? "تم إكمال تقييم لـ عمر خالد"
        : "Assessment completed for Omar Khalid",
      time: isRTL ? "منذ 15 دقيقة" : "15 min ago",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
      href: "/dashboard/development",
    },
    {
      id: 3,
      type: "payment",
      text: isRTL
        ? "تم استلام دفعة من عائلة الحسن"
        : "Payment received from Al-Hassan family",
      time: isRTL ? "منذ 30 دقيقة" : "30 min ago",
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-100",
      href: "/dashboard/billing",
    },
    {
      id: 4,
      type: "message",
      text: isRTL
        ? "رسالة جديدة من ولي الأمر"
        : "New message sent to parent group",
      time: isRTL ? "منذ ساعة" : "1 hour ago",
      icon: MessageCircle,
      color: "text-purple-600",
      bg: "bg-purple-100",
      href: "/dashboard/messages",
    },
    {
      id: 5,
      type: "alert",
      text: isRTL
        ? "تنبيه: تأخر في التطور المعرفي"
        : "Alert: Cognitive development delay detected",
      time: isRTL ? "منذ ساعتين" : "2 hours ago",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      href: "/dashboard/development",
    },
  ];

  // ── Upcoming events ─────────────────────────────────────────────
  const upcomingEvents = [
    {
      id: 1,
      title: isRTL ? "اجتماع أولياء الأمور" : "Parent-Teacher Meeting",
      date: "Feb 18, 2026",
      time: "10:00 AM",
      type: "meeting",
    },
    {
      id: 2,
      title: isRTL
        ? "رحلة ميدانية - حديقة الحيوانات"
        : "Field Trip - Zoo Visit",
      date: "Feb 20, 2026",
      time: "9:00 AM",
      type: "trip",
    },
    {
      id: 3,
      title: isRTL ? "يوم الصحة السنوي" : "Annual Health Day",
      date: "Feb 25, 2026",
      time: "8:30 AM",
      type: "health",
    },
  ];

  // ── Development alerts ──────────────────────────────────────────
  const developmentAlerts = [
    {
      student: isRTL ? "ليلى محمد" : "Layla Mohammed",
      domain: isRTL ? "اللغة والتواصل" : "Language & Communication",
      status: "delayed",
      age: "3y 2m",
    },
    {
      student: isRTL ? "يوسف علي" : "Youssef Ali",
      domain: isRTL ? "المهارات الحركية" : "Physical & Motor",
      status: "attention",
      age: "2y 8m",
    },
  ];

  // ── Date range handler ──────────────────────────────────────────
  const handleDateRange = (range: DateRange) => {
    setDateRange(range);
    const labels: Record<DateRange, string> = {
      today: isRTL ? "اليوم" : "Today",
      week: isRTL ? "هذا الأسبوع" : "This Week",
      month: isRTL ? "هذا الشهر" : "This Month",
      year: isRTL ? "هذا العام" : "This Year",
    };
    info(
      isRTL ? "تم تحديث الفترة" : "Date Range Updated",
      isRTL
        ? `عرض البيانات لـ: ${labels[range]}`
        : `Showing data for: ${labels[range]}`
    );
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Welcome Header + Date Filter ─── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.welcome}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Date range filter */}
            <div className="flex items-center rounded-xl border bg-card p-1">
              {(["today", "week", "month", "year"] as DateRange[]).map(
                (range) => (
                  <button
                    key={range}
                    onClick={() => handleDateRange(range)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      dateRange === range
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t[range]}
                  </button>
                )
              )}
            </div>
            <Badge variant="info" className="px-3 py-1">
              <Calendar className="me-1 h-3 w-3" />
              {new Date().toLocaleDateString(
                locale === "ar" ? "ar-SA" : "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            variants={fadeInUp}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => {
              nav(stat.href);
              info(
                stat.title,
                isRTL ? `جارٍ الانتقال إلى ${stat.title}...` : `Navigating to ${stat.title}...`
              );
            }}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <div className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <div className="flex items-center gap-1">
                      {stat.changeType === "positive" && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      {stat.changeType === "negative" && (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <p
                        className={`text-xs font-medium ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>
                  )}
                </div>
                <div className={`rounded-2xl p-3 ${stat.iconColor}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── ISCED Distribution + Attendance + Quick Actions ─── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ISCED Distribution Card */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {isRTL ? "توزيع البرامج" : "Program Distribution"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  nav("/dashboard/students");
                  info(
                    isRTL ? "عرض الطلاب" : "View Students",
                    isRTL
                      ? "جارٍ فتح صفحة الطلاب..."
                      : "Opening students page..."
                  );
                }}
                className="text-xs"
              >
                {t.viewAll}
                <ChevronRight className="ms-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">{t.isced010}</span>
                  </div>
                  <span className="text-sm font-semibold">142</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: "57%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-sm">{t.isced020}</span>
                  </div>
                  <span className="text-sm font-semibold">105</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: "43%" }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "الإجمالي" : "Total"}
                </span>
                <span className="text-lg font-bold">247</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Attendance */}
        <motion.div {...fadeInUp} transition={{ delay: 0.35 }}>
          <Card
            className="h-full cursor-pointer transition-transform hover:scale-[1.01]"
            onClick={() => {
              nav("/dashboard/classes");
              info(
                isRTL ? "الحضور" : "Attendance",
                isRTL
                  ? "جارٍ فتح صفحة الفصول..."
                  : "Opening classes page..."
              );
            }}
          >
            <CardHeader>
              <CardTitle className="text-base">{t.todayAttendance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-40">
                  <svg
                    className="h-40 w-40 -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-muted"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      className="text-green-500"
                      initial={{ strokeDasharray: 314, strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 47 }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">85%</span>
                    <span className="text-xs text-muted-foreground">
                      {t.present}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>
                    {t.present}: 210
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>
                    {t.absent}: 37
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-blue-600" />
                {t.quickActions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all hover:bg-muted"
                >
                  <div className={`rounded-xl p-2 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {action.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Recent Activity + Events + Alerts ─── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{t.recentActivity}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  nav("/dashboard/reports");
                  info(
                    isRTL ? "عرض الكل" : "View All",
                    isRTL
                      ? "جارٍ فتح التقارير..."
                      : "Opening reports page..."
                  );
                }}
                className="text-xs"
              >
                {t.viewAll}
                <ChevronRight className="ms-1 h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, i) => (
                  <motion.button
                    key={activity.id}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    onClick={() => {
                      nav(activity.href);
                      info(activity.text);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl p-3 text-start transition-all hover:bg-muted"
                  >
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${activity.bg} ${activity.color}`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Development Alerts + Upcoming Events sidebar */}
        <div className="space-y-4">
          {/* Development Alerts */}
          <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  {t.developmentAlerts}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    nav("/dashboard/development");
                    warning(
                      isRTL ? "تنبيهات التطور" : "Development Alerts",
                      isRTL
                        ? "جارٍ فتح صفحة التطور..."
                        : "Opening development page..."
                    );
                  }}
                  className="text-xs"
                >
                  {t.viewAll}
                  <ChevronRight className="ms-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {developmentAlerts.map((alert, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    onClick={() => {
                      nav("/dashboard/development");
                      warning(
                        alert.student,
                        `${alert.domain} — ${isRTL ? "يحتاج متابعة" : "Needs follow-up"}`
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-start transition-all hover:border-amber-300 hover:bg-amber-100"
                  >
                    <Avatar name={alert.student} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {alert.student}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.domain}
                      </p>
                    </div>
                    <Badge variant="warning">{alert.age}</Badge>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div {...fadeInUp} transition={{ delay: 0.55 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {t.upcomingEvents}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    nav("/dashboard/calendar");
                    info(
                      isRTL ? "التقويم" : "Calendar",
                      isRTL
                        ? "جارٍ فتح التقويم..."
                        : "Opening calendar..."
                    );
                  }}
                  className="text-xs"
                >
                  {t.viewAll}
                  <ChevronRight className="ms-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, i) => (
                  <motion.button
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 + i * 0.08 }}
                    onClick={() => {
                      nav("/dashboard/calendar");
                      info(
                        event.title,
                        `${event.date} — ${event.time}`
                      );
                    }}
                    className="flex w-full items-start gap-3 rounded-xl p-2 text-start transition-all hover:bg-muted"
                  >
                    <div className="flex flex-col items-center rounded-lg bg-blue-100 px-2 py-1">
                      <span className="text-xs font-bold text-blue-600">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                      <span className="text-[10px] text-blue-600">
                        {event.date.split(" ")[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="me-1 inline h-3 w-3" />
                        {event.time}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ─── Toast Notifications ─── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
