"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParentChildren } from "@/hooks/use-parent-children";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Plus,
  FileText,
  DollarSign,
  Heart,
  Baby,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bell,
  Star,
  AlertCircle,
  CheckCircle,
  Utensils,
  Moon,
  Camera,
  CreditCard,
} from "lucide-react";

/* ─── animation presets ─── */
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ─── types ─── */
interface Child {
  name: string;
  classroom: string;
  age: string;
}

interface Family {
  id: number;
  parentName: string;
  email: string;
  children: Child[];
  phone: string;
  paymentStatus: "paid" | "pending" | "overdue";
  lastContact: string;
  monthlyAmount: number;
}

interface DailyReport {
  id: number;
  child: string;
  date: string;
  time: string;
  mood: "happy" | "neutral" | "sad";
  mealStatus: string;
  napTime: string;
  activity: string;
  note: string;
  photos: number;
  sleepQuality: string;
}

interface PaymentRecord {
  id: number;
  familyId: number;
  familyName: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending" | "failed";
}

export default function ParentsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { data: session } = useSession();
  const { isParentView, myChildrenNames, isMyChild } = useParentChildren();
  const { toasts, success, error, info, warning, dismiss } = useToast();

  /* ─── translations ─── */
  const t = {
    title: isRTL ? "بوابة أولياء الأمور" : "Parent Portal",
    subtitle: isRTL
      ? "إدارة التواصل مع أولياء الأمور"
      : "Manage parent communications and engagement",
    totalFamilies: isRTL ? "إجمالي العائلات" : "Total Families",
    activeParents: isRTL ? "أولياء أمور نشطون" : "Active Parents",
    messagesThisWeek: isRTL ? "رسائل هذا الأسبوع" : "Messages This Week",
    paymentsDue: isRTL ? "دفعات مستحقة" : "Payments Due",
    childrenOverview: isRTL ? "نظرة عامة على الأطفال" : "Children Overview",
    dailyReports: isRTL ? "التقارير اليومية" : "Daily Reports",
    payments: isRTL ? "المدفوعات" : "Payments",
    paid: isRTL ? "مدفوع" : "Paid",
    pending: isRTL ? "معلق" : "Pending",
    overdue: isRTL ? "متأخر" : "Overdue",
    sendMessage: isRTL ? "إرسال رسالة" : "Send Message",
    callParent: isRTL ? "اتصال" : "Call",
    emailParent: isRTL ? "بريد إلكتروني" : "Email",
    viewReport: isRTL ? "عرض التقرير" : "View Report",
    today: isRTL ? "اليوم" : "Today",
    mood: isRTL ? "المزاج" : "Mood",
    meals: isRTL ? "الوجبات" : "Meals",
    nap: isRTL ? "القيلولة" : "Nap",
    activities: isRTL ? "الأنشطة" : "Activities",
    notes: isRTL ? "ملاحظات" : "Notes",
    sendAnnouncement: isRTL ? "إعلان عام" : "Send Announcement",
    addReport: isRTL ? "إضافة تقرير" : "Add Report",
    subject: isRTL ? "الموضوع" : "Subject",
    message: isRTL ? "الرسالة" : "Message",
    recipient: isRTL ? "المستلم" : "Recipient",
    announcementTitle: isRTL ? "عنوان الإعلان" : "Announcement Title",
    content: isRTL ? "المحتوى" : "Content",
    priority: isRTL ? "الأولوية" : "Priority",
    normal: isRTL ? "عادي" : "Normal",
    urgent: isRTL ? "عاجل" : "Urgent",
    targetGroup: isRTL ? "المجموعة المستهدفة" : "Target Group",
    allParents: isRTL ? "جميع أولياء الأمور" : "All Parents",
    specificClass: isRTL ? "فصل محدد" : "Specific Class",
    student: isRTL ? "الطالب" : "Student",
    date: isRTL ? "التاريخ" : "Date",
    sleep: isRTL ? "النوم" : "Sleep",
    sendReminder: isRTL ? "إرسال تذكير" : "Send Reminder",
    markPaid: isRTL ? "تعيين كمدفوع" : "Mark as Paid",
    recentTransactions: isRTL ? "المعاملات الأخيرة" : "Recent Transactions",
    paymentStatus: isRTL ? "حالة المدفوعات" : "Payment Status",
    myChildPortal: isRTL ? "بوابة طفلي" : "My Child's Portal",
    myChildSubtitle: isRTL
      ? "التقارير اليومية والصحة والمدفوعات لطفلك"
      : "Daily reports, health, and payments for your child",
    myChildTab: isRTL ? "طفلي" : "My Child",
    myChildrenTab: isRTL ? "أطفالي" : "My Children",
    healthTab: isRTL ? "الصحة" : "Health",
    viewFullHealthReport: isRTL ? "عرض التقرير الصحي الكامل" : "View full Health report",
    uploadDailyHomework: isRTL ? "رفع الواجب اليومي" : "Upload daily homework",
  };

  /* ─── state: mock data ─── */
  const [families, setFamilies] = useState<Family[]>([
    {
      id: 1,
      parentName: isRTL ? "أحمد وسارة العمري" : "Ahmed & Sara Al-Omari",
      email: "ahmed.sara@email.com",
      children: [
        {
          name: isRTL ? "يوسف" : "Youssef",
          classroom: isRTL ? "النجوم ب" : "Stars B",
          age: "4y 7m",
        },
        {
          name: isRTL ? "ليلى" : "Layla",
          classroom: isRTL ? "عباد الشمس أ" : "Sunflowers A",
          age: "2y 1m",
        },
      ],
      phone: "+966501112222",
      paymentStatus: "paid",
      lastContact: isRTL ? "منذ يوم" : "1 day ago",
      monthlyAmount: 7000,
    },
    {
      id: 2,
      parentName: isRTL ? "خالد ونورة الحسن" : "Khalid & Noura Al-Hassan",
      email: "khalid.noura@email.com",
      children: [
        {
          name: isRTL ? "عمر" : "Omar",
          classroom: isRTL ? "النجوم ب" : "Stars B",
          age: "4y 7m",
        },
      ],
      phone: "+966503334444",
      paymentStatus: "pending",
      lastContact: isRTL ? "منذ 3 أيام" : "3 days ago",
      monthlyAmount: 3500,
    },
    {
      id: 3,
      parentName: isRTL ? "محمد ومنى السعيد" : "Mohammed & Muna Al-Saeed",
      email: "mohammed.muna@email.com",
      children: [
        {
          name: isRTL ? "سارة" : "Sara",
          classroom: isRTL ? "الفراشات أ" : "Butterflies A",
          age: "3y 11m",
        },
      ],
      phone: "+966505556666",
      paymentStatus: "paid",
      lastContact: isRTL ? "منذ ساعتين" : "2 hours ago",
      monthlyAmount: 3500,
    },
    {
      id: 4,
      parentName: isRTL ? "علي ودانة إبراهيم" : "Ali & Dana Ibrahim",
      email: "ali.dana@email.com",
      children: [
        {
          name: isRTL ? "آدم" : "Adam",
          classroom: isRTL ? "أقواس قزح ج" : "Rainbows C",
          age: "4y 5m",
        },
      ],
      phone: "+966507778888",
      paymentStatus: "overdue",
      lastContact: isRTL ? "منذ أسبوع" : "1 week ago",
      monthlyAmount: 3500,
    },
    {
      id: 5,
      parentName: isRTL ? "فهد وريم الحربي" : "Fahad & Reem Al-Harbi",
      email: "fahad.reem@email.com",
      children: [
        {
          name: isRTL ? "نور" : "Noor",
          classroom: isRTL ? "الفراشات أ" : "Butterflies A",
          age: "3y 8m",
        },
        {
          name: isRTL ? "زين" : "Zain",
          classroom: isRTL ? "الفراشات أ" : "Butterflies A",
          age: "3y 0m",
        },
      ],
      phone: "+966509990000",
      paymentStatus: "paid",
      lastContact: isRTL ? "اليوم" : "Today",
      monthlyAmount: 7000,
    },
  ]);

  const [dailyReports, setDailyReports] = useState<DailyReport[]>([
    {
      id: 1,
      child: isRTL ? "يوسف أحمد" : "Youssef Ahmed",
      date: "2026-02-15",
      time: "12:30 PM",
      mood: "happy",
      mealStatus: isRTL ? "أكل جيداً" : "Ate well",
      napTime: "1h 30m",
      activity: isRTL ? "الرسم والتلوين" : "Painting & Coloring",
      note: isRTL
        ? "شارك بنشاط في حلقة الصباح"
        : "Actively participated in morning circle",
      photos: 3,
      sleepQuality: isRTL ? "جيد" : "Good",
    },
    {
      id: 2,
      child: isRTL ? "عمر خالد" : "Omar Khalid",
      date: "2026-02-15",
      time: "12:15 PM",
      mood: "neutral",
      mealStatus: isRTL ? "أكل قليلاً" : "Ate a little",
      napTime: "45m",
      activity: isRTL ? "البناء بالمكعبات" : "Block Building",
      note: isRTL
        ? "كان هادئاً اليوم، يفضل اللعب الفردي"
        : "Was quiet today, preferred solo play",
      photos: 1,
      sleepQuality: isRTL ? "متوسط" : "Fair",
    },
    {
      id: 3,
      child: isRTL ? "سارة أحمد" : "Sara Ahmed",
      date: "2026-02-15",
      time: "12:45 PM",
      mood: "happy",
      mealStatus: isRTL ? "أكلت كل شيء" : "Ate everything",
      napTime: "2h",
      activity: isRTL ? "اللعب في الخارج" : "Outdoor Play",
      note: isRTL
        ? "تعلمت كلمات جديدة اليوم"
        : "Learned new words today",
      photos: 5,
      sleepQuality: isRTL ? "ممتاز" : "Excellent",
    },
    {
      id: 4,
      child: isRTL ? "آدم إبراهيم" : "Adam Ibrahim",
      date: "2026-02-15",
      time: "11:50 AM",
      mood: "sad",
      mealStatus: isRTL ? "رفض الأكل" : "Refused to eat",
      napTime: "30m",
      activity: isRTL ? "القصة والقراءة" : "Storytime & Reading",
      note: isRTL
        ? "يبدو أنه لا يشعر بحالة جيدة، يرجى المراقبة"
        : "Seemed unwell, please monitor at home",
      photos: 0,
      sleepQuality: isRTL ? "ضعيف" : "Poor",
    },
    {
      id: 5,
      child: isRTL ? "نور فهد" : "Noor Fahad",
      date: "2026-02-15",
      time: "1:00 PM",
      mood: "happy",
      mealStatus: isRTL ? "أكلت معظم الطعام" : "Ate most of the food",
      napTime: "1h 45m",
      activity: isRTL ? "الموسيقى والغناء" : "Music & Singing",
      note: isRTL
        ? "كانت سعيدة جداً اليوم وتفاعلت مع الجميع"
        : "Very happy today, interacted with everyone",
      photos: 4,
      sleepQuality: isRTL ? "جيد" : "Good",
    },
    {
      id: 6,
      child: isRTL ? "ليلى أحمد" : "Layla Ahmed",
      date: "2026-02-15",
      time: "1:10 PM",
      mood: "happy",
      mealStatus: isRTL ? "أكلت جيداً" : "Ate well",
      napTime: "2h 15m",
      activity: isRTL ? "اللعب بالرمل" : "Sand Play",
      note: isRTL
        ? "استمتعت باللعب مع أصدقائها"
        : "Enjoyed playing with her friends",
      photos: 2,
      sleepQuality: isRTL ? "ممتاز" : "Excellent",
    },
  ]);

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
    {
      id: 1,
      familyId: 1,
      familyName: isRTL ? "أحمد وسارة العمري" : "Ahmed & Sara Al-Omari",
      amount: 7000,
      date: "2026-02-01",
      method: isRTL ? "تحويل بنكي" : "Bank Transfer",
      status: "completed",
    },
    {
      id: 2,
      familyId: 3,
      familyName: isRTL ? "محمد ومنى السعيد" : "Mohammed & Muna Al-Saeed",
      amount: 3500,
      date: "2026-02-03",
      method: isRTL ? "بطاقة ائتمان" : "Credit Card",
      status: "completed",
    },
    {
      id: 3,
      familyId: 2,
      familyName: isRTL ? "خالد ونورة الحسن" : "Khalid & Noura Al-Hassan",
      amount: 3500,
      date: "2026-02-10",
      method: isRTL ? "تحويل بنكي" : "Bank Transfer",
      status: "pending",
    },
  ]);

  /* ─── dialog state ─── */
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState<
    "normal" | "urgent"
  >("normal");
  const [announcementTarget, setAnnouncementTarget] = useState<
    "all" | "specific"
  >("all");

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStudent, setReportStudent] = useState("");
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportMood, setReportMood] = useState<"happy" | "neutral" | "sad">(
    "happy"
  );
  const [reportMeals, setReportMeals] = useState("");
  const [reportActivities, setReportActivities] = useState("");
  const [reportSleep, setReportSleep] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false);
  const [homeworkChild, setHomeworkChild] = useState("");
  const [homeworkNotes, setHomeworkNotes] = useState("");

  /* ─── Parent view: only my family, my children's reports, my payments ─────── */
  const familiesForView = useMemo(() => {
    if (!isParentView || !session?.user) return families;
    const parentName = session.user.name ?? "Parent";
    const parentEmail = session.user.email ?? "";
    return [
      {
        id: 0,
        parentName: isRTL ? `عائلتي` : "My Family",
        email: parentEmail,
        children: myChildrenNames.map((name) => ({
          name,
          classroom: isRTL ? "—" : "—",
          age: "",
        })),
        phone: "",
        paymentStatus: "paid" as const,
        lastContact: isRTL ? "—" : "—",
        monthlyAmount: 0,
      },
    ];
  }, [isParentView, session?.user?.name, session?.user?.email, families, myChildrenNames, isRTL]);

  const dailyReportsForView = useMemo(
    () =>
      isParentView
        ? dailyReports.filter((r) => isMyChild(r.child))
        : dailyReports,
    [isParentView, dailyReports, isMyChild]
  );

  const paymentHistoryForView = useMemo(() => {
    if (!isParentView || !session?.user?.name) return paymentHistory;
    const firstName = session.user.name.split(" ")[0]?.toLowerCase() ?? "";
    return paymentHistory.filter((p) =>
      p.familyName.toLowerCase().includes(firstName)
    );
  }, [isParentView, session?.user?.name, paymentHistory]);

  /* ─── all students for dropdown (staff: all; parent: only my children) ───── */
  const allStudents = useMemo(
    () =>
      isParentView
        ? myChildrenNames.map((n) => `${n} (—)`)
        : families.flatMap((f) =>
            f.children.map((c) => `${c.name} (${c.classroom})`)
          ),
    [isParentView, families, myChildrenNames]
  );

  /* ─── helpers ─── */
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {t.paid}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            {t.pending}
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {t.overdue}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTransactionBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {isRTL ? "مكتمل" : "Completed"}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            {t.pending}
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {isRTL ? "فشل" : "Failed"}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "neutral":
        return "😐";
      case "sad":
        return "😢";
      default:
        return "😊";
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case "happy":
        return isRTL ? "سعيد" : "Happy";
      case "neutral":
        return isRTL ? "عادي" : "Neutral";
      case "sad":
        return isRTL ? "حزين" : "Sad";
      default:
        return "";
    }
  };

  /* ─── dialog handlers ─── */
  const handleSendMessage = () => {
    if (!messageRecipient || !messageSubject || !messageBody) {
      warning(
        isRTL ? "حقول مفقودة" : "Missing Fields",
        isRTL ? "يرجى ملء جميع الحقول" : "Please fill in all fields"
      );
      return;
    }
    success(
      isRTL ? "تم إرسال الرسالة" : "Message Sent",
      isRTL
        ? `تم إرسال الرسالة إلى ${messageRecipient}`
        : `Message sent to ${messageRecipient}`
    );
    setMessageDialogOpen(false);
    setMessageRecipient("");
    setMessageSubject("");
    setMessageBody("");
  };

  const handleSendAnnouncement = () => {
    if (!announcementTitle || !announcementContent) {
      warning(
        isRTL ? "حقول مفقودة" : "Missing Fields",
        isRTL ? "يرجى ملء جميع الحقول" : "Please fill in all fields"
      );
      return;
    }
    success(
      isRTL ? "تم إرسال الإعلان" : "Announcement Sent",
      isRTL
        ? `تم إرسال "${announcementTitle}" إلى ${
            announcementTarget === "all"
              ? "جميع أولياء الأمور"
              : "فصل محدد"
          }`
        : `"${announcementTitle}" sent to ${
            announcementTarget === "all" ? "all parents" : "specific class"
          }`
    );
    setAnnouncementDialogOpen(false);
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setAnnouncementPriority("normal");
    setAnnouncementTarget("all");
  };

  const handleAddReport = () => {
    if (!reportStudent || !reportMeals || !reportActivities) {
      warning(
        isRTL ? "حقول مفقودة" : "Missing Fields",
        isRTL
          ? "يرجى ملء الحقول المطلوبة"
          : "Please fill in required fields"
      );
      return;
    }
    const newReport: DailyReport = {
      id: dailyReports.length + 1,
      child: reportStudent.split(" (")[0],
      date: reportDate,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      mood: reportMood,
      mealStatus: reportMeals,
      napTime: reportSleep || "N/A",
      activity: reportActivities,
      note: reportNotes || (isRTL ? "لا ملاحظات" : "No notes"),
      photos: 0,
      sleepQuality: reportSleep || "N/A",
    };
    setDailyReports((prev) => [newReport, ...prev]);
    success(
      isRTL ? "تم إضافة التقرير" : "Report Added",
      isRTL
        ? `تم إضافة تقرير يومي لـ ${newReport.child}`
        : `Daily report added for ${newReport.child}`
    );
    setReportDialogOpen(false);
    setReportStudent("");
    setReportDate(new Date().toISOString().split("T")[0]);
    setReportMood("happy");
    setReportMeals("");
    setReportActivities("");
    setReportSleep("");
    setReportNotes("");
  };

  const handleOpenMessage = (parentName: string) => {
    setMessageRecipient(parentName);
    setMessageDialogOpen(true);
  };

  const handleViewReport = (report: DailyReport) => {
    setViewingReport(report);
    setViewReportDialogOpen(true);
  };

  const handleMarkPaid = (familyId: number) => {
    setFamilies((prev) =>
      prev.map((f) =>
        f.id === familyId ? { ...f, paymentStatus: "paid" as const } : f
      )
    );
    const family = familiesForView.find((f) => f.id === familyId);
    success(
      isRTL ? "تم تحديث الدفع" : "Payment Updated",
      isRTL
        ? `تم تعيين ${family?.parentName} كمدفوع`
        : `${family?.parentName} marked as paid`
    );
  };

  const handleSendReminder = (family: Family) => {
    info(
      isRTL ? "تم إرسال التذكير" : "Reminder Sent",
      isRTL
        ? `تم إرسال تذكير بالدفع إلى ${family.parentName}`
        : `Payment reminder sent to ${family.parentName}`
    );
  };

  const handleSubmitHomework = () => {
    if (!homeworkChild.trim()) {
      error(isRTL ? "الرجاء اختيار الطفل" : "Please select your child");
      return;
    }
    success(
      isRTL ? "تم رفع الواجب" : "Homework Submitted",
      isRTL
        ? `تم رفع الواجب اليومي لـ ${homeworkChild}`
        : `Daily homework submitted for ${homeworkChild}`
    );
    setHomeworkDialogOpen(false);
    setHomeworkChild("");
    setHomeworkNotes("");
  };

  /* ─── shared input class ─── */
  const inputClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
  const selectClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white";
  const textareaClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors min-h-[80px] resize-y";

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isParentView ? t.myChildPortal : t.title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isParentView ? t.myChildSubtitle : t.subtitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setMessageDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              {t.sendMessage}
            </Button>
            {isParentView ? (
              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  setHomeworkChild(myChildrenNames[0] ?? "");
                  setHomeworkNotes("");
                  setHomeworkDialogOpen(true);
                }}
              >
                <FileText className="h-4 w-4" />
                {t.uploadDailyHomework}
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2"
                onClick={() => setAnnouncementDialogOpen(true)}
              >
                <Send className="h-4 w-4" />
                {t.sendAnnouncement}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Stats ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isParentView ? (
          <>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <StatCard
                title={myChildrenNames.length > 1 ? t.myChildrenTab : t.myChildTab}
                value={String(myChildrenNames.length)}
                change={t.childrenOverview}
                changeType="positive"
                icon={Baby}
                iconColor="bg-primary/10 text-primary"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
              <StatCard
                title={t.dailyReports}
                value={String(dailyReportsForView.length)}
                change={t.today}
                changeType="positive"
                icon={FileText}
                iconColor="bg-secondary/10 text-secondary"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <StatCard
                title={t.healthTab}
                value="—"
                change={t.viewFullHealthReport}
                changeType="positive"
                icon={Heart}
                iconColor="bg-accent/10 text-accent"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
              <StatCard
                title={t.paymentStatus}
                value={familiesForView[0]?.paymentStatus === "paid" ? t.paid : familiesForView[0]?.paymentStatus === "overdue" ? t.overdue : t.pending}
                change={t.recentTransactions}
                changeType={familiesForView[0]?.paymentStatus === "paid" ? "positive" : "negative"}
                icon={CreditCard}
                iconColor="bg-warning/10 text-warning"
              />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <StatCard
                title={t.totalFamilies}
                value="189"
                change="+5 this month"
                changeType="positive"
                icon={Users}
                iconColor="bg-primary/10 text-primary"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
              <StatCard
                title={t.activeParents}
                value="342"
                change="92% engagement"
                changeType="positive"
                icon={Heart}
                iconColor="bg-secondary/10 text-secondary"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <StatCard
                title={t.messagesThisWeek}
                value="87"
                change="+12 vs last week"
                changeType="positive"
                icon={MessageSquare}
                iconColor="bg-accent/10 text-accent"
              />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
              <StatCard
                title={t.paymentsDue}
                value="12"
                change="3 overdue"
                changeType="negative"
                icon={CreditCard}
                iconColor="bg-warning/10 text-warning"
              />
            </motion.div>
          </>
        )}
      </div>

      {/* ─── Tabs ─── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Tabs defaultValue="children">
          <TabsList>
            <TabsTrigger value="children" className="gap-1.5">
              <Baby className="h-4 w-4" />
              {isParentView
                ? (myChildrenNames.length > 1 ? t.myChildrenTab : t.myChildTab)
                : t.childrenOverview}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <FileText className="h-4 w-4" />
              {t.dailyReports}
            </TabsTrigger>
            {isParentView && (
              <TabsTrigger value="health" className="gap-1.5">
                <Heart className="h-4 w-4" />
                {t.healthTab}
              </TabsTrigger>
            )}
            <TabsTrigger value="payments" className="gap-1.5">
              <DollarSign className="h-4 w-4" />
              {t.payments}
            </TabsTrigger>
          </TabsList>

          {/* ─── Children Overview Tab ─── */}
          <TabsContent value="children">
            <div className="space-y-4">
              {familiesForView.map((family, i) => (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Parent info */}
                        <div className="flex items-center gap-3 sm:w-64 min-w-0">
                          <Avatar name={family.parentName} size="lg" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {family.parentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {family.phone}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {family.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              <Clock className="inline h-3 w-3 mr-0.5" />
                              {family.lastContact}
                            </p>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2">
                            {family.children.map((child, ci) => (
                              <div
                                key={ci}
                                className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2"
                              >
                                <Baby className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {child.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {child.classroom} · {child.age}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!isParentView && getPaymentBadge(family.paymentStatus)}

                          <Button
                            variant="ghost"
                            size="icon"
                            title={t.sendMessage}
                            onClick={() =>
                              handleOpenMessage(family.parentName)
                            }
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>

                          {!isParentView && (
                            <>
                              <a href={`tel:${family.phone}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={t.callParent}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </a>
                              <a href={`mailto:${family.email}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title={t.emailParent}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Daily Reports Tab ─── */}
          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t.today} —{" "}
                  {new Date().toLocaleDateString(
                    isRTL ? "ar-SA" : "en-US",
                    { weekday: "long", month: "long", day: "numeric" }
                  )}
                </h3>
                {isParentView ? (
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setHomeworkChild(myChildrenNames[0] ?? "");
                      setHomeworkNotes("");
                      setHomeworkDialogOpen(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {t.uploadDailyHomework}
                  </Button>
                ) : (
                  <Button
                    className="gap-2"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t.addReport}
                  </Button>
                )}
              </div>

              {dailyReportsForView.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar name={report.child} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold">{report.child}</p>
                              <p className="text-xs text-muted-foreground">
                                {report.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-2xl"
                                title={getMoodLabel(report.mood)}
                              >
                                {getMoodEmoji(report.mood)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getMoodLabel(report.mood)}
                              </Badge>
                            </div>
                          </div>

                          {/* Summary grid */}
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                              <Utensils className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.meals}
                                </p>
                                <p className="text-xs font-medium">
                                  {report.mealStatus}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                              <Moon className="h-4 w-4 text-indigo-500" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.nap}
                                </p>
                                <p className="text-xs font-medium">
                                  {report.napTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.activities}
                                </p>
                                <p className="text-xs font-medium">
                                  {report.activity}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                              <Camera className="h-4 w-4 text-pink-500" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">
                                  {isRTL ? "صور" : "Photos"}
                                </p>
                                <p className="text-xs font-medium">
                                  {report.photos}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Notes (always visible) */}
                          <div className="mt-3 rounded-lg bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {t.notes}
                            </p>
                            <p className="text-sm">{report.note}</p>
                          </div>

                          {/* Expand / View full report (staff only) */}
                          {!isParentView && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() =>
                                  setExpandedReportId(
                                    expandedReportId === report.id
                                      ? null
                                      : report.id
                                  )
                                }
                              >
                                {expandedReportId === report.id ? (
                                  <>
                                    <ChevronUp className="h-3 w-3" />
                                    {isRTL ? "إخفاء التفاصيل" : "Hide Details"}
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3" />
                                    {isRTL ? "عرض التفاصيل" : "Show Details"}
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleViewReport(report)}
                              >
                                <FileText className="h-3 w-3" />
                                {t.viewReport}
                              </Button>
                            </div>
                          )}

                          {/* Expanded section */}
                          {expandedReportId === report.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-3 rounded-xl border bg-muted/20 p-4 space-y-3"
                            >
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {t.sleep}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {report.sleepQuality}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {t.date}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {report.date}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {t.mood}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {getMoodEmoji(report.mood)}{" "}
                                    {getMoodLabel(report.mood)}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {isRTL ? "صور مرفقة" : "Attached Photos"}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {report.photos}{" "}
                                    {isRTL ? "صور" : "photos"}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {isRTL
                                    ? "ملاحظات كاملة"
                                    : "Full Notes"}
                                </p>
                                <p className="text-sm leading-relaxed">
                                  {report.note}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Payments Tab ─── */}
          <TabsContent value="payments">
            <div className="space-y-6">
              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {t.paymentStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {familiesForView.map((family, i) => (
                      <motion.div
                        key={family.id}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={family.parentName} size="sm" />
                          <div>
                            <p className="text-sm font-medium">
                              {family.parentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {family.children.length}{" "}
                              {family.children.length > 1
                                ? isRTL
                                  ? "أطفال"
                                  : "children"
                                : isRTL
                                ? "طفل"
                                : "child"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-end">
                            <p className="text-sm font-bold">
                              {family.monthlyAmount} SAR
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? "شهري" : "monthly"}
                            </p>
                          </div>
                          {getPaymentBadge(family.paymentStatus)}

                          {/* Action buttons based on status (staff only) */}
                          {!isParentView && family.paymentStatus === "overdue" && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => handleSendReminder(family)}
                              >
                                <Bell className="h-3 w-3" />
                                {t.sendReminder}
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => handleMarkPaid(family.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                                {t.markPaid}
                              </Button>
                            </div>
                          )}
                          {!isParentView && family.paymentStatus === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => handleSendReminder(family)}
                              >
                                <Bell className="h-3 w-3" />
                                {t.sendReminder}
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => handleMarkPaid(family.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                                {t.markPaid}
                              </Button>
                            </div>
                          )}
                          {family.paymentStatus === "paid" && (
                            <Badge
                              variant="success"
                              className="gap-1 ml-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {isRTL ? "سداد كامل" : "Fully Paid"}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.recentTransactions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentHistoryForView.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-muted/50 p-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {tx.familyName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.date} · {tx.method}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold">
                            {tx.amount} SAR
                          </p>
                          {getTransactionBadge(tx.status)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Health Tab (parent view only) ─── */}
          {isParentView && (
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {t.healthTab} – {myChildrenNames.join(", ")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "سجلات التطعيمات والحوادث والحساسية لطفلك. للعرض الكامل استخدم قسم الصحة من القائمة لاحقاً عند تفعيله."
                      : "Vaccinations, incidents, and allergies for your child. Full health records are view-only from the Health section when available."}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "عرض السجلات الصحية للقراءة فقط." : "Health records are view-only."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>

      {/* ═══════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════ */}

      {/* ─── Send Message Dialog ─── */}
      <FormDialog
        open={messageDialogOpen}
        title={t.sendMessage}
        description={
          isRTL
            ? "أرسل رسالة مباشرة إلى ولي الأمر"
            : "Send a direct message to a parent"
        }
        onClose={() => {
          setMessageDialogOpen(false);
          setMessageRecipient("");
          setMessageSubject("");
          setMessageBody("");
        }}
        onSubmit={handleSendMessage}
        submitLabel={isRTL ? "إرسال" : "Send"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        <div className="space-y-4">
          <FormField label={t.recipient} required>
            <select
              className={selectClass}
              value={messageRecipient}
              onChange={(e) => setMessageRecipient(e.target.value)}
            >
              <option value="">
                {isRTL ? "اختر ولي أمر..." : "Select a parent..."}
              </option>
              {familiesForView.map((f) => (
                <option key={f.id} value={f.parentName}>
                  {f.parentName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t.subject} required>
            <input
              type="text"
              className={inputClass}
              placeholder={
                isRTL ? "موضوع الرسالة..." : "Message subject..."
              }
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
            />
          </FormField>
          <FormField label={t.message} required>
            <textarea
              className={textareaClass}
              placeholder={
                isRTL ? "اكتب رسالتك هنا..." : "Type your message here..."
              }
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── Send Announcement Dialog ─── */}
      <FormDialog
        open={announcementDialogOpen}
        title={t.sendAnnouncement}
        description={
          isRTL
            ? "أرسل إعلاناً لأولياء الأمور"
            : "Broadcast an announcement to parents"
        }
        onClose={() => {
          setAnnouncementDialogOpen(false);
          setAnnouncementTitle("");
          setAnnouncementContent("");
          setAnnouncementPriority("normal");
          setAnnouncementTarget("all");
        }}
        onSubmit={handleSendAnnouncement}
        submitLabel={isRTL ? "إرسال الإعلان" : "Send Announcement"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
        size="lg"
      >
        <div className="space-y-4">
          {/* Priority indicator */}
          {announcementPriority === "urgent" && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {isRTL
                ? "سيتم إرسال هذا الإعلان كعاجل مع إشعار فوري"
                : "This announcement will be sent as urgent with immediate notification"}
            </div>
          )}
          <FormField label={t.announcementTitle} required>
            <input
              type="text"
              className={inputClass}
              placeholder={
                isRTL ? "عنوان الإعلان..." : "Announcement title..."
              }
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
            />
          </FormField>
          <FormField label={t.content} required>
            <textarea
              className={textareaClass}
              rows={4}
              placeholder={
                isRTL
                  ? "اكتب محتوى الإعلان..."
                  : "Write the announcement content..."
              }
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t.priority} required>
              <select
                className={selectClass}
                value={announcementPriority}
                onChange={(e) =>
                  setAnnouncementPriority(
                    e.target.value as "normal" | "urgent"
                  )
                }
              >
                <option value="normal">{t.normal}</option>
                <option value="urgent">{t.urgent}</option>
              </select>
            </FormField>
            <FormField label={t.targetGroup} required>
              <select
                className={selectClass}
                value={announcementTarget}
                onChange={(e) =>
                  setAnnouncementTarget(
                    e.target.value as "all" | "specific"
                  )
                }
              >
                <option value="all">{t.allParents}</option>
                <option value="specific">{t.specificClass}</option>
              </select>
            </FormField>
          </div>
        </div>
      </FormDialog>

      {/* ─── Add Daily Report Dialog ─── */}
      <FormDialog
        open={reportDialogOpen}
        title={t.addReport}
        description={
          isRTL
            ? "إضافة تقرير يومي جديد لطالب"
            : "Add a new daily report for a student"
        }
        onClose={() => {
          setReportDialogOpen(false);
          setReportStudent("");
          setReportDate(new Date().toISOString().split("T")[0]);
          setReportMood("happy");
          setReportMeals("");
          setReportActivities("");
          setReportSleep("");
          setReportNotes("");
        }}
        onSubmit={handleAddReport}
        submitLabel={isRTL ? "إضافة التقرير" : "Add Report"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t.student} required>
              <select
                className={selectClass}
                value={reportStudent}
                onChange={(e) => setReportStudent(e.target.value)}
              >
                <option value="">
                  {isRTL ? "اختر طالب..." : "Select a student..."}
                </option>
                {allStudents.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t.date} required>
              <input
                type="date"
                className={inputClass}
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label={t.mood} required>
            <div className="flex gap-3">
              {(["happy", "neutral", "sad"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setReportMood(m)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                    reportMood === m
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{getMoodEmoji(m)}</span>
                  {getMoodLabel(m)}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={t.meals} required>
            <input
              type="text"
              className={inputClass}
              placeholder={
                isRTL ? "مثال: أكل جيداً" : "e.g., Ate well, Ate a little"
              }
              value={reportMeals}
              onChange={(e) => setReportMeals(e.target.value)}
            />
          </FormField>
          <FormField label={t.activities} required>
            <input
              type="text"
              className={inputClass}
              placeholder={
                isRTL
                  ? "مثال: الرسم، البناء بالمكعبات"
                  : "e.g., Painting, Block Building"
              }
              value={reportActivities}
              onChange={(e) => setReportActivities(e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t.sleep}>
              <input
                type="text"
                className={inputClass}
                placeholder={isRTL ? "مثال: 1 ساعة 30 دقيقة" : "e.g., 1h 30m"}
                value={reportSleep}
                onChange={(e) => setReportSleep(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label={t.notes}>
            <textarea
              className={textareaClass}
              placeholder={
                isRTL
                  ? "ملاحظات إضافية عن يوم الطالب..."
                  : "Additional notes about the student's day..."
              }
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── Upload Daily Homework Dialog (parent only) ─── */}
      <FormDialog
        open={homeworkDialogOpen}
        title={t.uploadDailyHomework}
        description={
          isRTL
            ? "اختر الطفل وأضف ملاحظات أو مرفقات للواجب اليومي"
            : "Select your child and add notes for the daily homework"
        }
        onClose={() => {
          setHomeworkDialogOpen(false);
          setHomeworkChild("");
          setHomeworkNotes("");
        }}
        onSubmit={handleSubmitHomework}
        submitLabel={isRTL ? "رفع الواجب" : "Submit Homework"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        <div className="space-y-4">
          <FormField label={isRTL ? "الطفل" : "Child"} required>
            <select
              className={selectClass}
              value={homeworkChild}
              onChange={(e) => setHomeworkChild(e.target.value)}
            >
              <option value="">
                {isRTL ? "اختر طفلك..." : "Select your child..."}
              </option>
              {myChildrenNames.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t.notes}>
            <textarea
              className={textareaClass}
              placeholder={
                isRTL
                  ? "ملاحظات أو وصف الواجب..."
                  : "Notes or description of the homework..."
              }
              value={homeworkNotes}
              onChange={(e) => setHomeworkNotes(e.target.value)}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── View Daily Report Dialog ─── */}
      <FormDialog
        open={viewReportDialogOpen}
        title={
          viewingReport
            ? `${isRTL ? "تقرير يومي:" : "Daily Report:"} ${viewingReport.child}`
            : t.viewReport
        }
        description={
          viewingReport
            ? `${viewingReport.date} — ${viewingReport.time}`
            : ""
        }
        onClose={() => {
          setViewReportDialogOpen(false);
          setViewingReport(null);
        }}
        onSubmit={() => {
          setViewReportDialogOpen(false);
          setViewingReport(null);
        }}
        submitLabel={isRTL ? "إغلاق" : "Close"}
        cancelLabel={isRTL ? "إغلاق" : "Close"}
        size="lg"
      >
        {viewingReport && (
          <div className="space-y-5">
            {/* Mood */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4">
              <span className="text-4xl">
                {getMoodEmoji(viewingReport.mood)}
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{t.mood}</p>
                <p className="text-lg font-semibold">
                  {getMoodLabel(viewingReport.mood)}
                </p>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.meals}
                  </p>
                </div>
                <p className="font-semibold">{viewingReport.mealStatus}</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.nap}
                  </p>
                </div>
                <p className="font-semibold">{viewingReport.napTime}</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.activities}
                  </p>
                </div>
                <p className="font-semibold">{viewingReport.activity}</p>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.sleep}
                  </p>
                </div>
                <p className="font-semibold">
                  {viewingReport.sleepQuality}
                </p>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-pink-500" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "صور مرفقة" : "Attached Photos"}
                </p>
              </div>
              <p className="font-semibold">
                {viewingReport.photos}{" "}
                {isRTL ? "صور" : "photos"}
              </p>
            </div>

            {/* Notes */}
            <div className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  {t.notes}
                </p>
              </div>
              <p className="leading-relaxed">{viewingReport.note}</p>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ─── Toast Container ─── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
