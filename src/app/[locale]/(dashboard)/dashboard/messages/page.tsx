"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  MoreVertical,
  Paperclip,
  MessageSquare,
  Bell,
  ChevronLeft,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────
interface Message {
  id: number;
  sender: string;
  isMe: boolean;
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
}

interface Conversation {
  id: number;
  name: string;
  role: "parent" | "teacher" | "admin";
  lastMessage: string;
  time: string;
  unread: number;
  starred: boolean;
  online: boolean;
  messages: Message[];
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: "high" | "medium" | "low";
  targetAudience: string;
}

// ─── Animation helpers ──────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Initial mock data builders (locale-aware) ─────────────────────
function buildConversations(isRTL: boolean): Conversation[] {
  return [
    {
      id: 1,
      name: isRTL ? "أحمد العمري" : "Ahmed Al-Omari",
      role: "parent",
      lastMessage: isRTL ? "شكراً لكم على التحديث عن يوسف" : "Thank you for the update about Youssef",
      time: "10:30 AM",
      unread: 0,
      starred: true,
      online: true,
      messages: [
        { id: 1, sender: isRTL ? "أحمد العمري" : "Ahmed Al-Omari", isMe: false, text: isRTL ? "السلام عليكم، أريد الاستفسار عن تطور يوسف في مجال اللغة" : "Hello, I'd like to ask about Youssef's language development progress", time: "10:15 AM", status: "read" },
        { id: 2, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "وعليكم السلام، يوسف يحقق تقدماً جيداً في اللغة. نلاحظ تحسناً ملحوظاً في تكوين الجمل" : "Hello! Youssef is making good progress in language. We've noticed significant improvement in sentence formation", time: "10:20 AM", status: "read" },
        { id: 3, sender: isRTL ? "أحمد العمري" : "Ahmed Al-Omari", isMe: false, text: isRTL ? "هل هناك أنشطة يمكننا ممارستها في المنزل لدعم تطوره؟" : "Are there any activities we can do at home to support his development?", time: "10:25 AM", status: "read" },
        { id: 4, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "بالطبع! أنصح بقراءة القصص يومياً لمدة 15 دقيقة والتحدث معه عن يومه" : "Of course! I recommend 15 minutes of daily story reading and discussing his day", time: "10:28 AM", status: "delivered" },
        { id: 5, sender: isRTL ? "أحمد العمري" : "Ahmed Al-Omari", isMe: false, text: isRTL ? "شكراً لكم على التحديث عن يوسف" : "Thank you for the update about Youssef", time: "10:30 AM", status: "read" },
      ],
    },
    {
      id: 2,
      name: isRTL ? "نورة الحسن" : "Noura Al-Hassan",
      role: "parent",
      lastMessage: isRTL ? "هل يمكنني الحصول على تقرير عمر الأسبوعي؟" : "Can I get Omar's weekly report?",
      time: "9:45 AM",
      unread: 2,
      starred: false,
      online: false,
      messages: [
        { id: 1, sender: isRTL ? "نورة الحسن" : "Noura Al-Hassan", isMe: false, text: isRTL ? "مرحباً، كيف حال عمر اليوم؟" : "Hi, how is Omar doing today?", time: "9:30 AM", status: "read" },
        { id: 2, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "عمر بخير، استمتع بالأنشطة الفنية اليوم" : "Omar is fine, he enjoyed the art activities today", time: "9:35 AM", status: "read" },
        { id: 3, sender: isRTL ? "نورة الحسن" : "Noura Al-Hassan", isMe: false, text: isRTL ? "هل يمكنني الحصول على تقرير عمر الأسبوعي؟" : "Can I get Omar's weekly report?", time: "9:45 AM", status: "read" },
      ],
    },
    {
      id: 3,
      name: isRTL ? "أ. فاطمة الزهراء" : "Ms. Fatima Al-Zahra",
      role: "teacher",
      lastMessage: isRTL ? "تم تحديث خطة الدرس للأسبوع القادم" : "Updated lesson plan for next week",
      time: "Yesterday",
      unread: 0,
      starred: false,
      online: true,
      messages: [
        { id: 1, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "هل أكملتِ خطة الدرس؟" : "Have you completed the lesson plan?", time: "2:00 PM", status: "read" },
        { id: 2, sender: isRTL ? "أ. فاطمة الزهراء" : "Ms. Fatima Al-Zahra", isMe: false, text: isRTL ? "نعم، سأرسلها لكِ الآن" : "Yes, I'll send it to you now", time: "2:15 PM", status: "read" },
        { id: 3, sender: isRTL ? "أ. فاطمة الزهراء" : "Ms. Fatima Al-Zahra", isMe: false, text: isRTL ? "تم تحديث خطة الدرس للأسبوع القادم" : "Updated lesson plan for next week", time: "2:30 PM", status: "read" },
        { id: 4, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "شكراً، سأراجعها" : "Thanks, I'll review it", time: "2:45 PM", status: "delivered" },
      ],
    },
    {
      id: 4,
      name: isRTL ? "علي إبراهيم" : "Ali Ibrahim",
      role: "parent",
      lastMessage: isRTL ? "آدم لن يحضر غداً بسبب موعد طبي" : "Adam won't attend tomorrow due to medical appointment",
      time: "Yesterday",
      unread: 1,
      starred: false,
      online: false,
      messages: [
        { id: 1, sender: isRTL ? "علي إبراهيم" : "Ali Ibrahim", isMe: false, text: isRTL ? "مساء الخير" : "Good evening", time: "5:00 PM", status: "read" },
        { id: 2, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "مساء النور، كيف يمكنني مساعدتك؟" : "Good evening, how can I help you?", time: "5:05 PM", status: "read" },
        { id: 3, sender: isRTL ? "علي إبراهيم" : "Ali Ibrahim", isMe: false, text: isRTL ? "آدم لن يحضر غداً بسبب موعد طبي" : "Adam won't attend tomorrow due to medical appointment", time: "5:10 PM", status: "read" },
      ],
    },
    {
      id: 5,
      name: isRTL ? "أ. نورة القحطاني" : "Ms. Noura Al-Qahtani",
      role: "teacher",
      lastMessage: isRTL ? "نحتاج مواد إضافية لنشاط الفن" : "Need additional materials for art activity",
      time: "Feb 13",
      unread: 0,
      starred: true,
      online: false,
      messages: [
        { id: 1, sender: isRTL ? "أ. نورة القحطاني" : "Ms. Noura Al-Qahtani", isMe: false, text: isRTL ? "مرحباً، أردت إخبارك أننا نحتاج مواد إضافية" : "Hi, I wanted to let you know we need additional materials", time: "11:00 AM", status: "read" },
        { id: 2, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "ما المواد التي تحتاجينها؟" : "What materials do you need?", time: "11:15 AM", status: "read" },
        { id: 3, sender: isRTL ? "أ. نورة القحطاني" : "Ms. Noura Al-Qahtani", isMe: false, text: isRTL ? "نحتاج مواد إضافية لنشاط الفن" : "Need additional materials for art activity", time: "11:30 AM", status: "read" },
      ],
    },
    {
      id: 6,
      name: isRTL ? "فهد الحربي" : "Fahad Al-Harbi",
      role: "parent",
      lastMessage: isRTL ? "متى اجتماع أولياء الأمور القادم؟" : "When is the next parent-teacher meeting?",
      time: "Feb 12",
      unread: 0,
      starred: false,
      online: false,
      messages: [
        { id: 1, sender: isRTL ? "فهد الحربي" : "Fahad Al-Harbi", isMe: false, text: isRTL ? "السلام عليكم" : "Hello", time: "3:00 PM", status: "read" },
        { id: 2, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "وعليكم السلام" : "Hello!", time: "3:05 PM", status: "read" },
        { id: 3, sender: isRTL ? "فهد الحربي" : "Fahad Al-Harbi", isMe: false, text: isRTL ? "متى اجتماع أولياء الأمور القادم؟" : "When is the next parent-teacher meeting?", time: "3:10 PM", status: "read" },
        { id: 4, sender: isRTL ? "أنت" : "You", isMe: true, text: isRTL ? "سيكون يوم الأربعاء 18 فبراير الساعة 10 صباحاً" : "It will be on Wednesday, Feb 18 at 10 AM", time: "3:15 PM", status: "delivered" },
        { id: 5, sender: isRTL ? "فهد الحربي" : "Fahad Al-Harbi", isMe: false, text: isRTL ? "شكراً جزيلاً" : "Thank you very much", time: "3:20 PM", status: "read" },
      ],
    },
  ];
}

function buildAnnouncements(isRTL: boolean): Announcement[] {
  return [
    {
      id: 1,
      title: isRTL ? "اجتماع أولياء الأمور" : "Parent-Teacher Meeting",
      content: isRTL
        ? "يسرنا دعوتكم لاجتماع أولياء الأمور يوم الأربعاء 18 فبراير الساعة 10 صباحاً. يرجى تأكيد الحضور."
        : "We're pleased to invite you to the parent-teacher meeting on Wednesday, Feb 18 at 10 AM. Please confirm attendance.",
      date: "Feb 15, 2026",
      author: isRTL ? "الإدارة" : "Administration",
      priority: "high",
      targetAudience: isRTL ? "جميع أولياء الأمور" : "All Parents",
    },
    {
      id: 2,
      title: isRTL ? "رحلة ميدانية لحديقة الحيوانات" : "Zoo Field Trip",
      content: isRTL
        ? "سيتم تنظيم رحلة ميدانية لحديقة الحيوانات يوم الجمعة 20 فبراير. رسوم المشاركة 50 ريال."
        : "A zoo field trip is scheduled for Friday, Feb 20. Participation fee is 50 SAR. Please send the consent form.",
      date: "Feb 14, 2026",
      author: isRTL ? "أ. فاطمة الزهراء" : "Ms. Fatima Al-Zahra",
      priority: "medium",
      targetAudience: isRTL ? "فصل الفراشات أ" : "Butterflies A Class",
    },
    {
      id: 3,
      title: isRTL ? "يوم الصحة السنوي" : "Annual Health Day",
      content: isRTL
        ? "يسعدنا الإعلان عن يوم الصحة السنوي في 25 فبراير. سيتضمن فحوصات طبية مجانية لجميع الطلاب."
        : "We're happy to announce the Annual Health Day on Feb 25. Free medical checkups for all students.",
      date: "Feb 13, 2026",
      author: isRTL ? "الإدارة" : "Administration",
      priority: "high",
      targetAudience: isRTL ? "الجميع" : "Everyone",
    },
    {
      id: 4,
      title: isRTL ? "تحديث سياسة الزي المدرسي" : "Uniform Policy Update",
      content: isRTL
        ? "يرجى ملاحظة التحديثات على سياسة الزي المدرسي بدءاً من مارس. يمكنكم مراجعة التفاصيل على البوابة."
        : "Please note updates to the school uniform policy starting March. You can review details on the portal.",
      date: "Feb 12, 2026",
      author: isRTL ? "الإدارة" : "Administration",
      priority: "low",
      targetAudience: isRTL ? "الجميع" : "Everyone",
    },
  ];
}

// ─── Component ──────────────────────────────────────────────────────
export default function MessagesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, dismiss } = useToast();

  // ── Core state ──────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>(() => buildConversations(isRTL));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => buildAnnouncements(isRTL));
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  // ── Dialog state ────────────────────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceContent, setAnnounceContent] = useState("");
  const [announcePriority, setAnnouncePriority] = useState<"high" | "medium" | "low">("medium");
  const [announceAudience, setAnnounceAudience] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [moreMenuId, setMoreMenuId] = useState<number | null>(null);

  // ── Refs ────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Scroll to bottom when messages change ──────────────────────
  const activeConv = conversations.find((c) => c.id === selectedConversation) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length, selectedConversation]);

  // ── Translations ───────────────────────────────────────────────
  const t = {
    title: isRTL ? "التواصل" : "Communication",
    subtitle: isRTL ? "إدارة الرسائل والإعلانات" : "Manage messages and announcements",
    inbox: isRTL ? "البريد الوارد" : "Inbox",
    announcements: isRTL ? "الإعلانات" : "Announcements",
    compose: isRTL ? "رسالة جديدة" : "New Message",
    search: isRTL ? "البحث في الرسائل..." : "Search messages...",
    newAnnouncement: isRTL ? "إعلان جديد" : "New Announcement",
    typeMessage: isRTL ? "اكتب رسالة..." : "Type a message...",
    send: isRTL ? "إرسال" : "Send",
    parent: isRTL ? "ولي أمر" : "Parent",
    teacher: isRTL ? "معلم" : "Teacher",
    admin: isRTL ? "إدارة" : "Admin",
    online: isRTL ? "متصل الآن" : "Online",
    offline: isRTL ? "غير متصل" : "Offline",
    selectConversation: isRTL ? "اختر محادثة للبدء" : "Select a conversation to start",
    selectConversationDesc: isRTL ? "اختر محادثة من القائمة لعرض الرسائل" : "Choose a conversation from the list to view messages",
    noResults: isRTL ? "لا توجد نتائج" : "No results found",
    recipient: isRTL ? "المستلم" : "Recipient",
    subject: isRTL ? "الموضوع" : "Subject",
    message: isRTL ? "الرسالة" : "Message",
    announcementTitle: isRTL ? "العنوان" : "Title",
    content: isRTL ? "المحتوى" : "Content",
    priority: isRTL ? "الأولوية" : "Priority",
    targetAudience: isRTL ? "الجمهور المستهدف" : "Target Audience",
    high: isRTL ? "عالية" : "High",
    medium: isRTL ? "متوسطة" : "Medium",
    low: isRTL ? "منخفضة" : "Low",
    deleteConversation: isRTL ? "حذف المحادثة" : "Delete Conversation",
    deleteConfirm: isRTL ? "هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this conversation? This action cannot be undone.",
    delete: isRTL ? "حذف" : "Delete",
    cancel: isRTL ? "إلغاء" : "Cancel",
    starConversation: isRTL ? "تمييز بنجمة" : "Star",
    unstarConversation: isRTL ? "إزالة النجمة" : "Unstar",
    markRead: isRTL ? "تعيين كمقروء" : "Mark as Read",
    markUnread: isRTL ? "تعيين كغير مقروء" : "Mark as Unread",
    back: isRTL ? "رجوع" : "Back",
  };

  // ── Contacts list for compose dialog ───────────────────────────
  const contacts = useMemo(() => conversations.map((c) => ({ id: c.id, name: c.name, role: c.role })), [conversations]);

  // ── Filtered conversations ─────────────────────────────────────
  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  // ── Unread count ───────────────────────────────────────────────
  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unread, 0), [conversations]);

  // ── Helpers ────────────────────────────────────────────────────
  const now = () => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  const nextMsgId = (msgs: Message[]) => (msgs.length > 0 ? Math.max(...msgs.map((m) => m.id)) + 1 : 1);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "parent":
        return <Badge variant="info">{t.parent}</Badge>;
      case "teacher":
        return <Badge variant="secondary">{t.teacher}</Badge>;
      case "admin":
        return <Badge variant="default">{t.admin}</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">{t.high}</Badge>;
      case "medium":
        return <Badge variant="warning">{t.medium}</Badge>;
      case "low":
        return <Badge variant="success">{t.low}</Badge>;
      default:
        return null;
    }
  };

  // ── Actions ────────────────────────────────────────────────────
  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    setMoreMenuId(null);
    // Mark as read when selecting
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConversation) return;
    const text = replyText.trim();
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedConversation) return c;
        const newMsg: Message = {
          id: nextMsgId(c.messages),
          sender: isRTL ? "أنت" : "You",
          isMe: true,
          text,
          time: now(),
          status: "sent",
        };
        return { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: now() };
      })
    );
    setReplyText("");
    success(isRTL ? "تم الإرسال" : "Message Sent", isRTL ? "تم إرسال رسالتك بنجاح" : "Your message has been sent successfully");
  };

  const handleToggleStar = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = !c.starred;
        return { ...c, starred: next };
      })
    );
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      const willStar = !conv.starred;
      success(
        willStar ? (isRTL ? "تم التمييز بنجمة" : "Starred") : (isRTL ? "تمت إزالة النجمة" : "Unstarred"),
        willStar
          ? (isRTL ? `تم تمييز محادثة ${conv.name} بنجمة` : `Conversation with ${conv.name} starred`)
          : (isRTL ? `تمت إزالة النجمة من محادثة ${conv.name}` : `Conversation with ${conv.name} unstarred`)
      );
    }
    setMoreMenuId(null);
  };

  const handleDeleteConversation = () => {
    if (deleteTarget === null) return;
    const conv = conversations.find((c) => c.id === deleteTarget);
    setConversations((prev) => prev.filter((c) => c.id !== deleteTarget));
    if (selectedConversation === deleteTarget) setSelectedConversation(null);
    setDeleteTarget(null);
    setMoreMenuId(null);
    if (conv) {
      success(isRTL ? "تم الحذف" : "Deleted", isRTL ? `تم حذف المحادثة مع ${conv.name}` : `Conversation with ${conv.name} deleted`);
    }
  };

  const handleToggleRead = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, unread: c.unread === 0 ? 1 : 0 };
      })
    );
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      const wasUnread = conv.unread > 0;
      success(
        wasUnread ? (isRTL ? "تم التعيين كمقروء" : "Marked as Read") : (isRTL ? "تم التعيين كغير مقروء" : "Marked as Unread"),
        wasUnread
          ? (isRTL ? `تم تعيين محادثة ${conv.name} كمقروءة` : `Conversation with ${conv.name} marked as read`)
          : (isRTL ? `تم تعيين محادثة ${conv.name} كغير مقروءة` : `Conversation with ${conv.name} marked as unread`)
      );
    }
    setMoreMenuId(null);
  };

  const handleComposeSubmit = () => {
    if (!composeRecipient || !composeBody.trim()) return;
    const contact = contacts.find((c) => c.id === Number(composeRecipient));
    if (!contact) return;

    const existingConv = conversations.find((c) => c.id === contact.id);
    if (existingConv) {
      // Add message to existing conversation
      const newMsg: Message = {
        id: nextMsgId(existingConv.messages),
        sender: isRTL ? "أنت" : "You",
        isMe: true,
        text: composeSubject ? `[${composeSubject}] ${composeBody.trim()}` : composeBody.trim(),
        time: now(),
        status: "sent",
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: composeBody.trim(), time: now() }
            : c
        )
      );
      setSelectedConversation(contact.id);
    }

    setComposeOpen(false);
    setComposeRecipient("");
    setComposeSubject("");
    setComposeBody("");
    success(isRTL ? "تم الإرسال" : "Message Sent", isRTL ? `تم إرسال رسالة إلى ${contact.name}` : `Message sent to ${contact.name}`);
  };

  const handleAnnounceSubmit = () => {
    if (!announceTitle.trim() || !announceContent.trim() || !announceAudience.trim()) return;
    const newAnnouncement: Announcement = {
      id: Math.max(...announcements.map((a) => a.id), 0) + 1,
      title: announceTitle.trim(),
      content: announceContent.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: isRTL ? "أنت" : "You",
      priority: announcePriority,
      targetAudience: announceAudience.trim(),
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setAnnounceOpen(false);
    setAnnounceTitle("");
    setAnnounceContent("");
    setAnnouncePriority("medium");
    setAnnounceAudience("");
    success(isRTL ? "تم النشر" : "Announcement Published", isRTL ? "تم نشر الإعلان بنجاح" : "Your announcement has been published successfully");
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setAnnounceOpen(true)}>
              <Bell className="h-4 w-4" />
              {t.newAnnouncement}
            </Button>
            <Button size="lg" className="gap-2" onClick={() => setComposeOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.compose}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inbox" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              {t.inbox}
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ms-1 h-5 w-5 justify-center p-0 text-[10px]">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1.5">
              <Bell className="h-4 w-4" />
              {t.announcements}
            </TabsTrigger>
          </TabsList>

          {/* ─── Inbox Tab ────────────────────────────────────── */}
          <TabsContent value="inbox">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* ── Conversation List ───────────────────────────── */}
              <Card className={`lg:col-span-1 ${selectedConversation !== null ? "hidden lg:block" : ""}`}>
                <CardHeader className="pb-3">
                  <Input
                    placeholder={t.search}
                    icon={<Search className="h-4 w-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1 max-h-[520px] overflow-y-auto">
                    {filteredConversations.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-40" />
                        <p className="text-sm">{t.noResults}</p>
                      </div>
                    )}
                    {filteredConversations.map((conv, i) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <button
                          onClick={() => handleSelectConversation(conv.id)}
                          className={`w-full flex items-start gap-3 rounded-xl p-3 text-start transition-all hover:bg-muted ${
                            selectedConversation === conv.id ? "bg-muted ring-1 ring-primary/20" : ""
                          }`}
                        >
                          <div className="relative">
                            <Avatar name={conv.name} size="sm" />
                            {conv.online && (
                              <div className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold" : "font-medium"}`}>
                                {conv.name}
                              </p>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0 ms-2">{conv.time}</span>
                            </div>
                            <div className="flex items-center gap-1">{getRoleBadge(conv.role)}</div>
                            <p className={`text-xs truncate mt-1 ${conv.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                              {conv.lastMessage}
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            {conv.starred && <Star className="h-3 w-3 fill-warning text-warning" />}
                            {conv.unread > 0 && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {conv.unread}
                              </div>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ── Chat Area ───────────────────────────────────── */}
              <Card className={`lg:col-span-2 ${selectedConversation === null ? "hidden lg:block" : ""}`}>
                {activeConv ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="border-b py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSelectedConversation(null)}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Avatar name={activeConv.name} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{activeConv.name}</p>
                              {getRoleBadge(activeConv.role)}
                            </div>
                            <p className={`text-xs ${activeConv.online ? "text-success" : "text-muted-foreground"}`}>
                              {activeConv.online ? t.online : t.offline}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStar(activeConv.id)}
                            title={activeConv.starred ? t.unstarConversation : t.starConversation}
                          >
                            <Star className={`h-4 w-4 ${activeConv.starred ? "fill-warning text-warning" : ""}`} />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMoreMenuId(moreMenuId === activeConv.id ? null : activeConv.id)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {moreMenuId === activeConv.id && (
                              <div className="absolute end-0 top-full z-20 mt-1 w-48 rounded-xl border bg-card p-1 shadow-lg">
                                <button
                                  onClick={() => handleToggleRead(activeConv.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Circle className="h-4 w-4" />
                                  {activeConv.unread > 0 ? t.markRead : t.markUnread}
                                </button>
                                <button
                                  onClick={() => handleToggleStar(activeConv.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <Star className="h-4 w-4" />
                                  {activeConv.starred ? t.unstarConversation : t.starConversation}
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget(activeConv.id);
                                    setMoreMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t.delete}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="p-4">
                      <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                        {activeConv.messages.map((msg, i) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <div
                                className={`mt-1 flex items-center justify-end gap-1 ${
                                  msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-[10px]">{msg.time}</span>
                                {msg.isMe &&
                                  (msg.status === "read" ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : msg.status === "delivered" ? (
                                    <CheckCheck className="h-3 w-3 opacity-60" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Reply Input */}
                      <div className="flex items-center gap-2 border-t pt-4">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder={t.typeMessage}
                          className="flex-1"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  /* ── Empty State ─────────────────────────────── */
                  <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                    <div className="rounded-2xl bg-muted p-6 mb-4">
                      <MessageSquare className="h-12 w-12 opacity-40" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{t.selectConversation}</p>
                    <p className="text-sm mt-1">{t.selectConversationDesc}</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ─── Announcements Tab ────────────────────────────── */}
          <TabsContent value="announcements">
            <div className="space-y-4">
              {announcements.map((announcement, i) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={announcement.priority === "high" ? "border-destructive/30" : ""}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-xl p-2.5 ${
                          announcement.priority === "high"
                            ? "bg-destructive/10"
                            : announcement.priority === "medium"
                              ? "bg-warning/10"
                              : "bg-muted"
                        }`}>
                          <Bell className={`h-5 w-5 ${
                            announcement.priority === "high"
                              ? "text-destructive"
                              : announcement.priority === "medium"
                                ? "text-warning"
                                : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{announcement.title}</h3>
                                {getPriorityBadge(announcement.priority)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {announcement.author} · {announcement.date}
                              </p>
                            </div>
                            <Badge variant="outline">{announcement.targetAudience}</Badge>
                          </div>
                          <p className="text-sm">{announcement.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Compose New Message Dialog ─────────────────────────── */}
      <FormDialog
        open={composeOpen}
        title={isRTL ? "رسالة جديدة" : "Compose New Message"}
        description={isRTL ? "أرسل رسالة إلى أحد جهات الاتصال" : "Send a message to one of your contacts"}
        onClose={() => {
          setComposeOpen(false);
          setComposeRecipient("");
          setComposeSubject("");
          setComposeBody("");
        }}
        onSubmit={handleComposeSubmit}
        submitLabel={t.send}
        cancelLabel={t.cancel}
      >
        <div className="space-y-4">
          <FormField label={t.recipient} required>
            <select
              value={composeRecipient}
              onChange={(e) => setComposeRecipient(e.target.value)}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">{isRTL ? "اختر المستلم..." : "Select recipient..."}</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role === "parent" ? t.parent : c.role === "teacher" ? t.teacher : t.admin})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label={t.subject}>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder={isRTL ? "موضوع الرسالة (اختياري)" : "Message subject (optional)"}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>
          <FormField label={t.message} required>
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder={isRTL ? "اكتب رسالتك هنا..." : "Type your message here..."}
              rows={4}
              className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── New Announcement Dialog ────────────────────────────── */}
      <FormDialog
        open={announceOpen}
        title={isRTL ? "إعلان جديد" : "New Announcement"}
        description={isRTL ? "أنشئ إعلاناً جديداً للمجتمع" : "Create a new announcement for the community"}
        onClose={() => {
          setAnnounceOpen(false);
          setAnnounceTitle("");
          setAnnounceContent("");
          setAnnouncePriority("medium");
          setAnnounceAudience("");
        }}
        onSubmit={handleAnnounceSubmit}
        submitLabel={isRTL ? "نشر" : "Publish"}
        cancelLabel={t.cancel}
      >
        <div className="space-y-4">
          <FormField label={t.announcementTitle} required>
            <input
              type="text"
              value={announceTitle}
              onChange={(e) => setAnnounceTitle(e.target.value)}
              placeholder={isRTL ? "عنوان الإعلان" : "Announcement title"}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>
          <FormField label={t.content} required>
            <textarea
              value={announceContent}
              onChange={(e) => setAnnounceContent(e.target.value)}
              placeholder={isRTL ? "محتوى الإعلان..." : "Announcement content..."}
              rows={4}
              className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </FormField>
          <FormField label={t.priority} required>
            <select
              value={announcePriority}
              onChange={(e) => setAnnouncePriority(e.target.value as "high" | "medium" | "low")}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="high">{t.high}</option>
              <option value="medium">{t.medium}</option>
              <option value="low">{t.low}</option>
            </select>
          </FormField>
          <FormField label={t.targetAudience} required>
            <input
              type="text"
              value={announceAudience}
              onChange={(e) => setAnnounceAudience(e.target.value)}
              placeholder={isRTL ? "مثال: الجميع، أولياء الأمور..." : "e.g. Everyone, All Parents..."}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t.deleteConversation}
        description={t.deleteConfirm}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={handleDeleteConversation}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toasts ─────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
