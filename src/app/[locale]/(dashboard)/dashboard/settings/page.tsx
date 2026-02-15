"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Save,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  Moon,
  Sun,
  Monitor,
  Bell,
  Download,
  Database,
  RefreshCw,
  Check,
  ToggleLeft,
  ToggleRight,
  User,
  Clock,
  Languages,
  Settings,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface UserEntry {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: "active" | "inactive";
  lastLogin: string;
}

interface BackupEntry {
  id: number;
  date: string;
  size: string;
  status: "success" | "failed";
}

interface SchoolInfo {
  schoolName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
}

interface Preferences {
  theme: "light" | "dark" | "system";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  dateFormat: string;
  timezone: string;
}

// ─── Animation ──────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Roles ──────────────────────────────────────────────
const ALL_ROLES = [
  { value: "admin", label: "Admin", labelAr: "مدير" },
  { value: "teacher", label: "Teacher", labelAr: "معلم" },
  { value: "assistant", label: "Assistant", labelAr: "مساعد" },
  { value: "staff", label: "Staff", labelAr: "موظف" },
  { value: "accountant", label: "Accountant", labelAr: "محاسب" },
  { value: "parent", label: "Parent", labelAr: "ولي أمر" },
  { value: "viewer", label: "Viewer", labelAr: "مشاهد" },
];

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-100 text-red-700", text: "text-red-700" },
  teacher: { bg: "bg-blue-100 text-blue-700", text: "text-blue-700" },
  assistant: { bg: "bg-indigo-100 text-indigo-700", text: "text-indigo-700" },
  staff: { bg: "bg-emerald-100 text-emerald-700", text: "text-emerald-700" },
  accountant: { bg: "bg-amber-100 text-amber-700", text: "text-amber-700" },
  parent: { bg: "bg-purple-100 text-purple-700", text: "text-purple-700" },
  viewer: { bg: "bg-gray-100 text-gray-700", text: "text-gray-700" },
};

// ─── Initial Mock Data ──────────────────────────────────
const initialUsers: UserEntry[] = [
  { id: 1, name: "Ahmed Admin", email: "ahmed@alnour.edu.sa", role: "admin", phone: "+966 50 111 2222", status: "active", lastLogin: "Feb 15, 2026 · 8:30 AM" },
  { id: 2, name: "Ms. Fatima Al-Zahra", email: "fatima@alnour.edu.sa", role: "teacher", phone: "+966 50 333 4444", status: "active", lastLogin: "Feb 15, 2026 · 7:45 AM" },
  { id: 3, name: "Ms. Noura Al-Qahtani", email: "noura@alnour.edu.sa", role: "assistant", phone: "+966 50 555 6666", status: "active", lastLogin: "Feb 14, 2026 · 9:00 AM" },
  { id: 4, name: "Salma Staff", email: "salma@alnour.edu.sa", role: "staff", phone: "+966 50 777 8888", status: "active", lastLogin: "Feb 15, 2026 · 8:00 AM" },
  { id: 5, name: "Khalid Accountant", email: "khalid@alnour.edu.sa", role: "accountant", phone: "+966 50 999 0000", status: "inactive", lastLogin: "Feb 10, 2026 · 10:00 AM" },
];

const initialBackups: BackupEntry[] = [
  { id: 1, date: "Feb 15, 2026 · 3:00 AM", size: "2.4 GB", status: "success" },
  { id: 2, date: "Feb 14, 2026 · 3:00 AM", size: "2.3 GB", status: "success" },
  { id: 3, date: "Feb 13, 2026 · 3:00 AM", size: "2.3 GB", status: "success" },
  { id: 4, date: "Feb 12, 2026 · 3:00 AM", size: "2.2 GB", status: "failed" },
  { id: 5, date: "Feb 11, 2026 · 3:00 AM", size: "2.2 GB", status: "success" },
];

// ═════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════
export default function SettingsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const toast = useToast();

  // ── Refs ────────────────────────────────────────────
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── School Info State ───────────────────────────────
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: isRTL ? "روضة النور" : "Al-Nour Nursery",
    email: "admin@alnour.edu.sa",
    phone: "+966 11 234 5678",
    address: isRTL ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
    website: "https://alnour.edu.sa",
    description: isRTL
      ? "روضة النور هي مؤسسة تعليمية رائدة تقدم تعليمًا متميزًا للأطفال."
      : "Al-Nour Nursery is a leading educational institution providing excellent early childhood education.",
  });

  // ── Users State ─────────────────────────────────────
  const [users, setUsers] = useState<UserEntry[]>(initialUsers);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "teacher", phone: "" });

  // ── Preferences State ───────────────────────────────
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    language: locale,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Riyadh",
  });

  // ── Backup State ────────────────────────────────────
  const [backups, setBackups] = useState<BackupEntry[]>(initialBackups);
  const [backupLoading, setBackupLoading] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  // ─── Translations ─────────────────────────────────────
  const t = {
    title: isRTL ? "الإعدادات" : "Settings",
    subtitle: isRTL ? "إدارة إعدادات المنصة والتفضيلات" : "Manage platform settings and preferences",
    schoolInfo: isRTL ? "معلومات المدرسة" : "School Information",
    userManagement: isRTL ? "إدارة المستخدمين" : "User Management",
    preferences: isRTL ? "التفضيلات" : "Preferences",
    backupExport: isRTL ? "النسخ الاحتياطي والتصدير" : "Backup & Export",
    schoolName: isRTL ? "اسم المدرسة" : "School Name",
    emailAddress: isRTL ? "البريد الإلكتروني" : "Email Address",
    phoneNumber: isRTL ? "رقم الهاتف" : "Phone Number",
    address: isRTL ? "العنوان" : "Address",
    website: isRTL ? "الموقع الإلكتروني" : "Website",
    description: isRTL ? "الوصف" : "Description",
    logo: isRTL ? "الشعار" : "Logo",
    uploadLogo: isRTL ? "رفع شعار" : "Upload Logo",
    saveChanges: isRTL ? "حفظ التغييرات" : "Save Changes",
    language: isRTL ? "اللغة" : "Language",
    timezone: isRTL ? "المنطقة الزمنية" : "Timezone",
    notifications: isRTL ? "الإشعارات" : "Notifications",
    theme: isRTL ? "المظهر" : "Theme",
    light: isRTL ? "فاتح" : "Light",
    dark: isRTL ? "داكن" : "Dark",
    system: isRTL ? "النظام" : "System",
    arabic: isRTL ? "العربية" : "Arabic",
    english: isRTL ? "الإنجليزية" : "English",
    role: isRTL ? "الدور" : "Role",
    active: isRTL ? "نشط" : "Active",
    inactive: isRTL ? "غير نشط" : "Inactive",
    addUser: isRTL ? "إضافة مستخدم" : "Add User",
    editUser: isRTL ? "تعديل مستخدم" : "Edit User",
    deleteUser: isRTL ? "حذف مستخدم" : "Delete User",
    lastLogin: isRTL ? "آخر دخول" : "Last Login",
    backupNow: isRTL ? "نسخ احتياطي الآن" : "Backup Now",
    exportData: isRTL ? "تصدير البيانات" : "Export Data",
    importData: isRTL ? "استيراد البيانات" : "Import Data",
    storageUsed: isRTL ? "المساحة المستخدمة" : "Storage Used",
    autoBackup: isRTL ? "نسخ احتياطي تلقائي" : "Auto Backup",
    enabled: isRTL ? "مفعّل" : "Enabled",
    disabled: isRTL ? "معطّل" : "Disabled",
    licenseInfo: isRTL ? "معلومات الترخيص" : "License Information",
    plan: isRTL ? "الخطة" : "Plan",
    expiresOn: isRTL ? "تنتهي في" : "Expires on",
    emailNotifications: isRTL ? "إشعارات البريد" : "Email Notifications",
    pushNotifications: isRTL ? "إشعارات الدفع" : "Push Notifications",
    smsNotifications: isRTL ? "إشعارات الرسائل" : "SMS Notifications",
    dateFormat: isRTL ? "صيغة التاريخ" : "Date Format",
    savePreferences: isRTL ? "حفظ التفضيلات" : "Save Preferences",
    resetPassword: isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password",
    name: isRTL ? "الاسم" : "Name",
    phone: isRTL ? "الهاتف" : "Phone",
  };

  // ═══════════════════════════════════════════════════════
  // HANDLERS — School Info
  // ═══════════════════════════════════════════════════════
  const updateSchoolField = (field: keyof SchoolInfo, value: string) => {
    setSchoolInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSchoolInfo = () => {
    toast.success(
      isRTL ? "تم الحفظ بنجاح" : "Changes Saved",
      isRTL ? "تم تحديث معلومات المدرسة بنجاح" : "School information has been updated successfully."
    );
  };

  const handleUploadLogo = () => {
    logoInputRef.current?.click();
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(
        isRTL ? "تم رفع الشعار" : "Logo Uploaded",
        isRTL ? `تم رفع الملف: ${file.name}` : `File uploaded: ${file.name}`
      );
    }
    e.target.value = "";
  };

  // ═══════════════════════════════════════════════════════
  // HANDLERS — User Management
  // ═══════════════════════════════════════════════════════
  const openAddUser = () => {
    setUserForm({ name: "", email: "", role: "teacher", phone: "" });
    setAddUserOpen(true);
  };

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email) {
      toast.error(
        isRTL ? "خطأ" : "Error",
        isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields."
      );
      return;
    }
    const newUser: UserEntry = {
      id: Date.now(),
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      phone: userForm.phone,
      status: "active",
      lastLogin: "Never",
    };
    setUsers((prev) => [...prev, newUser]);
    setAddUserOpen(false);
    toast.success(
      isRTL ? "تمت الإضافة" : "User Added",
      isRTL ? `تمت إضافة ${userForm.name} بنجاح` : `${userForm.name} has been added successfully.`
    );
  };

  const openEditUser = (user: UserEntry) => {
    setSelectedUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, phone: user.phone });
    setEditUserOpen(true);
  };

  const handleEditUser = () => {
    if (!selectedUser || !userForm.name || !userForm.email) {
      toast.error(
        isRTL ? "خطأ" : "Error",
        isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields."
      );
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role, phone: userForm.phone }
          : u
      )
    );
    setEditUserOpen(false);
    setSelectedUser(null);
    toast.success(
      isRTL ? "تم التحديث" : "User Updated",
      isRTL ? `تم تحديث بيانات ${userForm.name}` : `${userForm.name}'s information has been updated.`
    );
  };

  const openDeleteUser = (user: UserEntry) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteUserOpen(false);
    toast.success(
      isRTL ? "تم الحذف" : "User Deleted",
      isRTL ? `تم حذف ${selectedUser.name}` : `${selectedUser.name} has been removed.`
    );
    setSelectedUser(null);
  };

  const handleResetPassword = (user: UserEntry) => {
    toast.info(
      isRTL ? "تم الإرسال" : "Reset Link Sent",
      isRTL
        ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${user.email}`
        : `Password reset link sent to ${user.email}.`
    );
  };

  const handleToggleUserStatus = (user: UserEntry) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    toast.success(
      isRTL ? "تم التحديث" : "Status Updated",
      isRTL
        ? `${user.name} أصبح ${newStatus === "active" ? "نشط" : "غير نشط"}`
        : `${user.name} is now ${newStatus}.`
    );
  };

  // ═══════════════════════════════════════════════════════
  // HANDLERS — Preferences
  // ═══════════════════════════════════════════════════════
  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = () => {
    toast.success(
      isRTL ? "تم الحفظ" : "Preferences Saved",
      isRTL ? "تم حفظ التفضيلات بنجاح" : "Your preferences have been saved successfully."
    );
  };

  // ═══════════════════════════════════════════════════════
  // HANDLERS — Backup & Export
  // ═══════════════════════════════════════════════════════
  const handleBackupNow = () => {
    setBackupLoading(true);
    setTimeout(() => {
      const newBackup: BackupEntry = {
        id: Date.now(),
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        size: "2.5 GB",
        status: "success",
      };
      setBackups((prev) => [newBackup, ...prev]);
      setBackupLoading(false);
      toast.success(
        isRTL ? "تم النسخ الاحتياطي" : "Backup Complete",
        isRTL ? "تم إنشاء نسخة احتياطية بنجاح" : "A new backup has been created successfully."
      );
    }, 2000);
  };

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      school: schoolInfo,
      users: users.map(({ id, name, email, role, status }) => ({ id, name, email, role, status })),
      preferences,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alnour-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(
      isRTL ? "تم التصدير" : "Data Exported",
      isRTL ? "تم تصدير البيانات بنجاح كملف JSON" : "Data exported successfully as a JSON file."
    );
  };

  const handleImportData = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(
        isRTL ? "تم الاستيراد" : "Data Imported",
        isRTL ? `تم استيراد الملف: ${file.name}` : `File imported: ${file.name}`
      );
    }
    e.target.value = "";
  };

  const handleDownloadBackup = (backup: BackupEntry) => {
    toast.info(
      isRTL ? "جارٍ التنزيل" : "Downloading Backup",
      isRTL ? `جارٍ تنزيل النسخة الاحتياطية: ${backup.date}` : `Downloading backup from ${backup.date}`
    );
  };

  const handleRetryBackup = (backup: BackupEntry) => {
    setBackups((prev) =>
      prev.map((b) => (b.id === backup.id ? { ...b, status: "success" as const } : b))
    );
    toast.success(
      isRTL ? "تمت إعادة المحاولة" : "Retry Successful",
      isRTL ? "تم إعادة النسخ الاحتياطي بنجاح" : "Backup has been retried successfully."
    );
  };

  const handleToggleAutoBackup = () => {
    setAutoBackup((prev) => !prev);
    toast.info(
      isRTL ? "تم التحديث" : "Auto Backup Updated",
      !autoBackup
        ? isRTL ? "تم تفعيل النسخ الاحتياطي التلقائي" : "Auto backup has been enabled."
        : isRTL ? "تم تعطيل النسخ الاحتياطي التلقائي" : "Auto backup has been disabled."
    );
  };

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════
  const getRoleBadge = (role: string) => {
    const colors = ROLE_COLORS[role] || ROLE_COLORS.viewer;
    const roleData = ALL_ROLES.find((r) => r.value === role);
    const label = isRTL ? roleData?.labelAr : roleData?.label;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg}`}>
        <Shield className="h-3 w-3" />
        {label || role}
      </span>
    );
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out mt-0.5 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  // ═══════════════════════════════════════════════════════
  // USER FORM (shared for Add / Edit)
  // ═══════════════════════════════════════════════════════
  const renderUserFormFields = () => (
    <div className="space-y-4">
      <FormField label={t.name} required>
        <Input
          value={userForm.name}
          onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
          placeholder={isRTL ? "أدخل الاسم" : "Enter name"}
          icon={<User className="h-4 w-4" />}
        />
      </FormField>
      <FormField label={t.emailAddress} required>
        <Input
          type="email"
          value={userForm.email}
          onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
          placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email"}
          icon={<Mail className="h-4 w-4" />}
        />
      </FormField>
      <FormField label={t.role} required>
        <Select value={userForm.role} onValueChange={(v) => setUserForm((f) => ({ ...f, role: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {isRTL ? r.labelAr : r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField label={t.phone}>
        <Input
          value={userForm.phone}
          onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder={isRTL ? "أدخل رقم الهاتف" : "Enter phone number"}
          icon={<Phone className="h-4 w-4" />}
        />
      </FormField>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
      <input ref={importInputRef} type="file" accept=".json,.csv,.xml" className="hidden" onChange={handleImportFileChange} />

      {/* Header */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="school">
          <TabsList>
            <TabsTrigger value="school" className="gap-1.5">
              <Building2 className="h-4 w-4" />
              {t.schoolInfo}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" />
              {t.userManagement}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5">
              <Settings className="h-4 w-4" />
              {t.preferences}
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-1.5">
              <Database className="h-4 w-4" />
              {t.backupExport}
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════ */}
          {/* TAB 1 — School Information                     */}
          {/* ═══════════════════════════════════════════════ */}
          <TabsContent value="school">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">{t.schoolInfo}</CardTitle>
                  <CardDescription>
                    {isRTL ? "تحديث المعلومات الأساسية للمدرسة" : "Update your school's basic information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.schoolName}</Label>
                    <Input
                      value={schoolInfo.schoolName}
                      onChange={(e) => updateSchoolField("schoolName", e.target.value)}
                      icon={<Building2 className="h-4 w-4" />}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t.emailAddress}</Label>
                      <Input
                        value={schoolInfo.email}
                        onChange={(e) => updateSchoolField("email", e.target.value)}
                        icon={<Mail className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.phoneNumber}</Label>
                      <Input
                        value={schoolInfo.phone}
                        onChange={(e) => updateSchoolField("phone", e.target.value)}
                        icon={<Phone className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.address}</Label>
                    <Input
                      value={schoolInfo.address}
                      onChange={(e) => updateSchoolField("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.website}</Label>
                    <Input
                      value={schoolInfo.website}
                      onChange={(e) => updateSchoolField("website", e.target.value)}
                      icon={<Globe className="h-4 w-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.description}</Label>
                    <Textarea
                      value={schoolInfo.description}
                      onChange={(e) => updateSchoolField("description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button className="gap-2" onClick={handleSaveSchoolInfo}>
                    <Save className="h-4 w-4" />
                    {t.saveChanges}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Logo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.logo}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
                      <Building2 className="h-12 w-12 text-primary" />
                    </div>
                    <Button variant="outline" className="gap-2" onClick={handleUploadLogo}>
                      <Upload className="h-4 w-4" />
                      {t.uploadLogo}
                    </Button>
                  </CardContent>
                </Card>

                {/* License */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t.licenseInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.plan}</span>
                      <Badge variant="default">Premium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.expiresOn}</span>
                      <span className="text-sm font-medium">Dec 31, 2026</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.storageUsed}</span>
                      <span className="text-sm font-medium">2.4 / 10 GB</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[24%] rounded-full bg-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════ */}
          {/* TAB 2 — User Management                       */}
          {/* ═══════════════════════════════════════════════ */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{t.userManagement}</CardTitle>
                    <CardDescription>
                      {isRTL ? "إدارة حسابات المستخدمين والصلاحيات" : "Manage user accounts and permissions"}
                    </CardDescription>
                  </div>
                  <Button className="gap-2" onClick={openAddUser}>
                    <Plus className="h-4 w-4" />
                    {t.addUser}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col gap-3 rounded-xl border p-4 transition-all hover:bg-muted/50 sm:flex-row sm:items-center"
                    >
                      {/* Avatar & info */}
                      <div className="flex items-center gap-3 sm:w-56">
                        <Avatar name={user.name} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Role & status */}
                      <div className="flex flex-1 items-center gap-3">
                        {getRoleBadge(user.role)}
                        <Badge variant={user.status === "active" ? "success" : "outline"}>
                          {user.status === "active" ? t.active : t.inactive}
                        </Badge>
                      </div>

                      {/* Last login */}
                      <div className="text-xs text-muted-foreground shrink-0">
                        <Clock className="me-1 inline h-3 w-3" />
                        {user.lastLogin}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={isRTL ? "تبديل الحالة" : "Toggle Status"}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.status === "active" ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t.resetPassword}
                          onClick={() => handleResetPassword(user)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t.editUser}
                          onClick={() => openEditUser(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t.deleteUser}
                          onClick={() => openDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════ */}
          {/* TAB 3 — Preferences                           */}
          {/* ═══════════════════════════════════════════════ */}
          <TabsContent value="preferences">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {preferences.theme === "dark" ? <Moon className="h-4 w-4" /> : preferences.theme === "light" ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                    {t.theme}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "light" as const, label: t.light, Icon: Sun },
                      { value: "dark" as const, label: t.dark, Icon: Moon },
                      { value: "system" as const, label: t.system, Icon: Monitor },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updatePreference("theme", option.value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:border-primary ${
                          preferences.theme === option.value
                            ? "border-primary bg-primary/5"
                            : "border-input"
                        }`}
                      >
                        <option.Icon className={`h-6 w-6 ${preferences.theme === option.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{option.label}</span>
                        {preferences.theme === option.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Language & Region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Languages className="h-4 w-4" />
                    {isRTL ? "اللغة والمنطقة" : "Language & Region"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.language}</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(v) => updatePreference("language", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{t.arabic}</SelectItem>
                        <SelectItem value="en">{t.english}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.dateFormat}</Label>
                    <Select
                      value={preferences.dateFormat}
                      onValueChange={(v) => updatePreference("dateFormat", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.timezone}</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(v) => updatePreference("timezone", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
                        <SelectItem value="Asia/Kuwait">Asia/Kuwait (UTC+3)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    {t.notifications}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {([
                      {
                        key: "emailNotifications" as const,
                        label: t.emailNotifications,
                        description: isRTL ? "استلام إشعارات عبر البريد الإلكتروني" : "Receive notifications via email",
                        icon: Mail,
                      },
                      {
                        key: "pushNotifications" as const,
                        label: t.pushNotifications,
                        description: isRTL ? "إشعارات المتصفح الفورية" : "Browser push notifications",
                        icon: Bell,
                      },
                      {
                        key: "smsNotifications" as const,
                        label: t.smsNotifications,
                        description: isRTL ? "إشعارات عبر الرسائل النصية" : "SMS text notifications",
                        icon: Phone,
                      },
                    ]).map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between rounded-xl border p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <notification.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{notification.label}</p>
                            <p className="text-xs text-muted-foreground">{notification.description}</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={preferences[notification.key]}
                          onChange={() => updatePreference(notification.key, !preferences[notification.key])}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="lg:col-span-2 flex justify-end">
                <Button className="gap-2" onClick={handleSavePreferences}>
                  <Save className="h-4 w-4" />
                  {t.savePreferences}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════ */}
          {/* TAB 4 — Backup & Export                        */}
          {/* ═══════════════════════════════════════════════ */}
          <TabsContent value="backup">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">{isRTL ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full gap-2"
                    onClick={handleBackupNow}
                    disabled={backupLoading}
                  >
                    {backupLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    {backupLoading
                      ? isRTL ? "جارٍ النسخ..." : "Backing up..."
                      : t.backupNow}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleExportData}>
                    <Download className="h-4 w-4" />
                    {t.exportData}
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleImportData}>
                    <Upload className="h-4 w-4" />
                    {t.importData}
                  </Button>

                  <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.autoBackup}</span>
                      <ToggleSwitch checked={autoBackup} onChange={handleToggleAutoBackup} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isRTL ? "الحالة" : "Status"}</span>
                      <Badge variant={autoBackup ? "success" : "outline"}>
                        {autoBackup ? t.enabled : t.disabled}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isRTL ? "التكرار" : "Frequency"}</span>
                      <span className="font-medium">{isRTL ? "يومي" : "Daily"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.storageUsed}</span>
                      <span className="font-medium">2.4 / 10 GB</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background">
                      <div className="h-full w-[24%] rounded-full bg-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Backup History */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">{isRTL ? "سجل النسخ الاحتياطي" : "Backup History"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backups.map((backup, i) => (
                      <motion.div
                        key={backup.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-xl p-2 ${
                              backup.status === "success"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {backup.status === "success" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{backup.date}</p>
                            <p className="text-xs text-muted-foreground">{backup.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={backup.status === "success" ? "success" : "destructive"}>
                            {backup.status === "success"
                              ? isRTL ? "ناجح" : "Success"
                              : isRTL ? "فشل" : "Failed"}
                          </Badge>
                          {backup.status === "success" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={isRTL ? "تنزيل" : "Download"}
                              onClick={() => handleDownloadBackup(backup)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {backup.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title={isRTL ? "إعادة المحاولة" : "Retry"}
                              onClick={() => handleRetryBackup(backup)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* DIALOGS                                           */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* Add User Dialog */}
      <FormDialog
        open={addUserOpen}
        title={t.addUser}
        description={isRTL ? "إضافة مستخدم جديد إلى النظام" : "Add a new user to the system"}
        onClose={() => setAddUserOpen(false)}
        onSubmit={handleAddUser}
        submitLabel={isRTL ? "إضافة" : "Add User"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        {renderUserFormFields()}
      </FormDialog>

      {/* Edit User Dialog */}
      <FormDialog
        open={editUserOpen}
        title={t.editUser}
        description={isRTL ? "تعديل بيانات المستخدم" : "Edit user information"}
        onClose={() => { setEditUserOpen(false); setSelectedUser(null); }}
        onSubmit={handleEditUser}
        submitLabel={isRTL ? "حفظ التغييرات" : "Save Changes"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        {renderUserFormFields()}
      </FormDialog>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={deleteUserOpen}
        title={t.deleteUser}
        description={
          isRTL
            ? `هل أنت متأكد من حذف ${selectedUser?.name || ""}؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete ${selectedUser?.name || ""}? This action cannot be undone.`
        }
        confirmLabel={isRTL ? "حذف" : "Delete"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
        variant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => { setDeleteUserOpen(false); setSelectedUser(null); }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </div>
  );
}
