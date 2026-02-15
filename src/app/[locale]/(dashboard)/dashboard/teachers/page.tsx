"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  Star,
  Mail,
  Phone,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Briefcase,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  yearsExperience: number;
  assignedClasses: string[];
  rating: number;
  studentsCount: number;
  bio: string;
}

/* ------------------------------------------------------------------ */
/*  Initial mock data                                                  */
/* ------------------------------------------------------------------ */

const initialTeachers: Teacher[] = [
  {
    id: "TCH001",
    firstName: "Fatima",
    lastName: "Ali",
    email: "fatima@edu.com",
    phone: "+20 100 123 4567",
    qualification: "M.Ed Early Childhood",
    specialization: "Montessori Education",
    yearsExperience: 8,
    assignedClasses: ["Sunshine Room", "Star Room"],
    rating: 4.8,
    studentsCount: 38,
    bio: "Passionate educator with focus on child-led learning",
  },
  {
    id: "TCH002",
    firstName: "Layla",
    lastName: "Omar",
    email: "layla@edu.com",
    phone: "+20 100 234 5678",
    qualification: "B.Ed Primary Education",
    specialization: "Language Development",
    yearsExperience: 5,
    assignedClasses: ["Rainbow Class"],
    rating: 4.6,
    studentsCount: 22,
    bio: "Specialized in bilingual education and literacy development",
  },
  {
    id: "TCH003",
    firstName: "Noura",
    lastName: "Hassan",
    email: "noura@edu.com",
    phone: "+20 100 345 6789",
    qualification: "M.Ed Curriculum Design",
    specialization: "STEM Education",
    yearsExperience: 10,
    assignedClasses: ["Discovery Lab", "Innovators Room"],
    rating: 4.9,
    studentsCount: 30,
    bio: "Innovative STEM educator inspiring young scientists and thinkers",
  },
  {
    id: "TCH004",
    firstName: "Sara",
    lastName: "Mahmoud",
    email: "sara@edu.com",
    phone: "+20 100 456 7890",
    qualification: "B.Ed Special Needs",
    specialization: "Inclusive Education",
    yearsExperience: 6,
    assignedClasses: ["Harmony Class"],
    rating: 4.5,
    studentsCount: 15,
    bio: "Dedicated to creating inclusive learning environments for all children",
  },
  {
    id: "TCH005",
    firstName: "Hana",
    lastName: "Youssef",
    email: "hana@edu.com",
    phone: "+20 100 567 8901",
    qualification: "B.Ed Arts Education",
    specialization: "Creative Arts",
    yearsExperience: 4,
    assignedClasses: ["Art Studio"],
    rating: 4.7,
    studentsCount: 25,
    bio: "Encouraging creativity and self-expression through art and music",
  },
  {
    id: "TCH006",
    firstName: "Amira",
    lastName: "Khalil",
    email: "amira@edu.com",
    phone: "+20 100 678 9012",
    qualification: "M.Ed Child Psychology",
    specialization: "Social-Emotional Learning",
    yearsExperience: 12,
    assignedClasses: ["Wellness Room", "Mindful Space"],
    rating: 4.9,
    studentsCount: 28,
    bio: "Expert in fostering emotional intelligence and resilience in young learners",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const specializationColors: Record<string, string> = {
  "Montessori Education": "bg-violet-100 text-violet-700",
  "Language Development": "bg-blue-100 text-blue-700",
  "STEM Education": "bg-emerald-100 text-emerald-700",
  "Inclusive Education": "bg-amber-100 text-amber-700",
  "Creative Arts": "bg-pink-100 text-pink-700",
  "Social-Emotional Learning": "bg-teal-100 text-teal-700",
};

function getSpecBadgeClass(spec: string) {
  return specializationColors[spec] ?? "bg-gray-100 text-gray-700";
}

function generateId() {
  const num = Math.floor(Math.random() * 900) + 100;
  return `TCH${num}`;
}

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  qualification: "",
  specialization: "",
  yearsExperience: "",
  assignedClasses: "",
  bio: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeachersPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const toast = useToast();

  /* ---- state ---- */
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  /* ---- translations ---- */
  const t = {
    title: isRTL ? "إدارة المعلمين" : "Teacher Management",
    subtitle: isRTL ? "عرض وإدارة كادر المعلمين" : "View and manage teaching staff",
    addTeacher: isRTL ? "إضافة معلم" : "Add Teacher",
    editTeacher: isRTL ? "تعديل المعلم" : "Edit Teacher",
    deleteTeacher: isRTL ? "حذف المعلم" : "Delete Teacher",
    search: isRTL ? "البحث عن معلم..." : "Search teachers...",
    totalTeachers: isRTL ? "إجمالي المعلمين" : "Total Teachers",
    avgExperience: isRTL ? "متوسط الخبرة" : "Avg. Experience",
    classesAssigned: isRTL ? "الفصول المعينة" : "Classes Assigned",
    certifiedStaff: isRTL ? "معلمون معتمدون" : "Certified Staff",
    yearsExp: isRTL ? "سنوات" : "years",
    experience: isRTL ? "الخبرة" : "Experience",
    performanceOverview: isRTL ? "نظرة عامة على الأداء" : "Performance Overview",
    teacherDirectory: isRTL ? "دليل المعلمين" : "Teacher Directory",
    excellent: isRTL ? "ممتاز" : "Excellent",
    good: isRTL ? "جيد" : "Good",
    average: isRTL ? "متوسط" : "Average",
    firstName: isRTL ? "الاسم الأول" : "First Name",
    lastName: isRTL ? "اسم العائلة" : "Last Name",
    email: isRTL ? "البريد الإلكتروني" : "Email",
    phone: isRTL ? "الهاتف" : "Phone",
    qualification: isRTL ? "المؤهل" : "Qualification",
    specialization: isRTL ? "التخصص" : "Specialization",
    yearsExperienceLabel: isRTL ? "سنوات الخبرة" : "Years of Experience",
    assignedClasses: isRTL ? "الفصول المعينة" : "Assigned Classes",
    bioLabel: isRTL ? "نبذة" : "Bio",
    save: isRTL ? "حفظ" : "Save",
    cancel: isRTL ? "إلغاء" : "Cancel",
    delete: isRTL ? "حذف" : "Delete",
    students: isRTL ? "طالب" : "Students",
    classesCommaHint: isRTL ? "مفصولة بفواصل" : "Comma-separated",
    confirmDeleteTitle: isRTL ? "حذف المعلم" : "Delete Teacher",
    confirmDeleteDesc: (name: string) =>
      isRTL
        ? `هل أنت متأكد من حذف ${name}؟ لا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete ${name}? This action cannot be undone.`,
  };

  /* ---- derived ---- */
  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        const q = search.toLowerCase();
        return fullName.includes(q) || teacher.specialization.toLowerCase().includes(q);
      }),
    [teachers, search]
  );

  const avgExp = teachers.length
    ? Math.round(teachers.reduce((s, t) => s + t.yearsExperience, 0) / teachers.length)
    : 0;

  const totalClasses = teachers.reduce((s, t) => s + t.assignedClasses.length, 0);

  const excellentCount = teachers.filter((t) => t.rating >= 4.7).length;
  const goodCount = teachers.filter((t) => t.rating >= 4.4 && t.rating < 4.7).length;
  const averageCount = teachers.filter((t) => t.rating < 4.4).length;
  const avgRating = teachers.length
    ? (teachers.reduce((s, t) => s + t.rating, 0) / teachers.length).toFixed(1)
    : "0.0";

  const performanceData = [
    { label: t.excellent, count: excellentCount, pct: teachers.length ? Math.round((excellentCount / teachers.length) * 100) : 0, color: "bg-success" },
    { label: t.good, count: goodCount, pct: teachers.length ? Math.round((goodCount / teachers.length) * 100) : 0, color: "bg-primary" },
    { label: t.average, count: averageCount, pct: teachers.length ? Math.round((averageCount / teachers.length) * 100) : 0, color: "bg-warning" },
  ];

  /* ---- handlers ---- */
  function openAdd() {
    setAddForm(emptyForm);
    setAddOpen(true);
  }

  function handleAdd() {
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
      toast.warning("Missing fields", "Please fill in first name, last name, and email.");
      return;
    }
    const newTeacher: Teacher = {
      id: generateId(),
      firstName: addForm.firstName.trim(),
      lastName: addForm.lastName.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim(),
      qualification: addForm.qualification.trim(),
      specialization: addForm.specialization.trim(),
      yearsExperience: Number(addForm.yearsExperience) || 0,
      assignedClasses: addForm.assignedClasses
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      rating: 0,
      studentsCount: 0,
      bio: addForm.bio.trim(),
    };
    setTeachers((prev) => [...prev, newTeacher]);
    setAddOpen(false);
    toast.success("Teacher Added", `${newTeacher.firstName} ${newTeacher.lastName} has been added.`);
  }

  function openEdit(teacher: Teacher) {
    setEditingId(teacher.id);
    setEditForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      yearsExperience: String(teacher.yearsExperience),
      assignedClasses: teacher.assignedClasses.join(", "),
      bio: teacher.bio,
    });
    setEditOpen(true);
  }

  function handleEdit() {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast.warning("Missing fields", "Please fill in first name, last name, and email.");
      return;
    }
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              firstName: editForm.firstName.trim(),
              lastName: editForm.lastName.trim(),
              email: editForm.email.trim(),
              phone: editForm.phone.trim(),
              qualification: editForm.qualification.trim(),
              specialization: editForm.specialization.trim(),
              yearsExperience: Number(editForm.yearsExperience) || 0,
              assignedClasses: editForm.assignedClasses
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
              bio: editForm.bio.trim(),
            }
          : t
      )
    );
    setEditOpen(false);
    toast.success("Teacher Updated", `${editForm.firstName} ${editForm.lastName} has been updated.`);
  }

  function openDelete(teacher: Teacher) {
    setDeletingTeacher(teacher);
    setDeleteOpen(true);
  }

  function handleDelete() {
    if (!deletingTeacher) return;
    setTeachers((prev) => prev.filter((t) => t.id !== deletingTeacher.id));
    if (expandedId === deletingTeacher.id) setExpandedId(null);
    setDeleteOpen(false);
    toast.success(
      "Teacher Deleted",
      `${deletingTeacher.firstName} ${deletingTeacher.lastName} has been removed.`
    );
    setDeletingTeacher(null);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  /* ---- shared form fields renderer ---- */
  function renderFormFields(
    form: typeof emptyForm,
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
  ) {
    const inputClass =
      "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none";
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.firstName} required>
          <input
            className={inputClass}
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="e.g. Fatima"
          />
        </FormField>
        <FormField label={t.lastName} required>
          <input
            className={inputClass}
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="e.g. Ali"
          />
        </FormField>
        <FormField label={t.email} required>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="e.g. fatima@edu.com"
          />
        </FormField>
        <FormField label={t.phone}>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+20 100 123 4567"
          />
        </FormField>
        <FormField label={t.qualification}>
          <input
            className={inputClass}
            value={form.qualification}
            onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
            placeholder="e.g. M.Ed Early Childhood"
          />
        </FormField>
        <FormField label={t.specialization}>
          <input
            className={inputClass}
            value={form.specialization}
            onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
            placeholder="e.g. Montessori Education"
          />
        </FormField>
        <FormField label={t.yearsExperienceLabel}>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.yearsExperience}
            onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
            placeholder="0"
          />
        </FormField>
        <FormField label={`${t.assignedClasses} (${t.classesCommaHint})`}>
          <input
            className={inputClass}
            value={form.assignedClasses}
            onChange={(e) => setForm((f) => ({ ...f, assignedClasses: e.target.value }))}
            placeholder="e.g. Sunshine Room, Star Room"
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label={t.bioLabel}>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Short bio..."
              rows={3}
            />
          </FormField>
        </div>
      </div>
    );
  }

  /* ---- render stars ---- */
  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${
              s <= Math.round(rating)
                ? "fill-warning text-warning"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  }

  /* ================================================================ */
  /*  JSX                                                              */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <Button size="lg" className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {t.addTeacher}
          </Button>
        </div>
      </motion.div>

      {/* ---------- Stats ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title={t.totalTeachers}
            value={teachers.length.toString()}
            change={`${teachers.length} active`}
            changeType="positive"
            icon={GraduationCap}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title={t.avgExperience}
            value={`${avgExp} ${t.yearsExp}`}
            change="Qualified staff"
            changeType="neutral"
            icon={Clock}
            iconColor="bg-secondary/10 text-secondary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title={t.classesAssigned}
            value={totalClasses.toString()}
            change="All classes covered"
            changeType="positive"
            icon={BookOpen}
            iconColor="bg-accent/10 text-accent"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title={t.certifiedStaff}
            value="100%"
            change="Fully certified"
            changeType="positive"
            icon={Award}
            iconColor="bg-success/10 text-success"
          />
        </motion.div>
      </div>

      {/* ---------- Main content ---------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- Teacher Directory ---- */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">{t.teacherDirectory}</CardTitle>
                <Input
                  placeholder={t.search}
                  icon={<Search className="h-4 w-4" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sm:w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTeachers.length === 0 && (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {isRTL ? "لا يوجد معلمون مطابقون" : "No teachers match your search."}
                    </motion.p>
                  )}

                  {filteredTeachers.map((teacher, i) => {
                    const fullName = `${teacher.firstName} ${teacher.lastName}`;
                    const isExpanded = expandedId === teacher.id;
                    return (
                      <motion.div
                        key={teacher.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.04 }}
                        className="overflow-hidden rounded-xl border transition-all hover:bg-muted/30"
                      >
                        {/* ---- Row ---- */}
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                          {/* Avatar + name */}
                          <div className="flex items-center gap-3 min-w-0 sm:w-52">
                            <Avatar name={fullName} size="lg" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{fullName}</p>
                              <Badge
                                className={`mt-1 border-0 text-[11px] ${getSpecBadgeClass(teacher.specialization)}`}
                              >
                                {teacher.specialization}
                              </Badge>
                            </div>
                          </div>

                          {/* Quick info */}
                          <div className="flex-1 space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Award className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{teacher.qualification}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {teacher.yearsExperience} {t.yearsExp} {t.experience}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{teacher.assignedClasses.join(", ")}</span>
                            </div>
                          </div>

                          {/* Rating + actions */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-warning">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-bold">{teacher.rating || "—"}</span>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(teacher)}
                              title={t.editTeacher}
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(teacher)}
                              title={t.deleteTeacher}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleExpand(teacher.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* ---- Expanded Profile ---- */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key="details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t bg-muted/20 px-4 py-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                  {/* Contact */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      Contact
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span>{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <span>{teacher.phone}</span>
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      Stats
                                    </p>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span>
                                        {teacher.studentsCount} {t.students}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                      <span>
                                        {teacher.assignedClasses.length} {isRTL ? "فصول" : "classes"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                      {renderStars(teacher.rating)}
                                      <span className="ml-1 font-medium">
                                        {teacher.rating || "N/A"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Bio */}
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                      Bio
                                    </p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {teacher.bio || "No bio provided."}
                                    </p>
                                  </div>
                                </div>

                                {/* Class badges */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {teacher.assignedClasses.map((cls) => (
                                    <Badge key={cls} variant="info" className="text-xs">
                                      {cls}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ---- Performance Overview ---- */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t.performanceOverview}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ratings Distribution */}
              <div className="space-y-4">
                {performanceData.map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Avg Rating */}
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {isRTL ? "متوسط التقييم" : "Average Rating"}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-6 w-6 fill-warning text-warning" />
                  <span className="text-3xl font-bold">{avgRating}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isRTL ? "من أصل 5.0" : "out of 5.0"}
                </p>
              </div>

              {/* Quick stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isRTL ? "إجمالي الطلاب" : "Total Students"}
                  </span>
                  <Badge variant="info">
                    {teachers.reduce((s, t) => s + t.studentsCount, 0)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isRTL ? "إجمالي الفصول" : "Total Classes"}
                  </span>
                  <Badge variant="info">{totalClasses}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isRTL ? "عدد المعلمين" : "Active Teachers"}
                  </span>
                  <Badge variant="success">{teachers.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ========== DIALOGS ========== */}

      {/* ---- Add Teacher ---- */}
      <FormDialog
        open={addOpen}
        title={t.addTeacher}
        description={isRTL ? "أدخل بيانات المعلم الجديد" : "Enter the new teacher's information"}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        submitLabel={t.save}
        cancelLabel={t.cancel}
        size="lg"
      >
        {renderFormFields(addForm, setAddForm)}
      </FormDialog>

      {/* ---- Edit Teacher ---- */}
      <FormDialog
        open={editOpen}
        title={t.editTeacher}
        description={
          isRTL ? "قم بتعديل بيانات المعلم" : "Update the teacher's information"
        }
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        submitLabel={t.save}
        cancelLabel={t.cancel}
        size="lg"
      >
        {renderFormFields(editForm, setEditForm)}
      </FormDialog>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        open={deleteOpen}
        title={t.confirmDeleteTitle}
        description={
          deletingTeacher
            ? t.confirmDeleteDesc(`${deletingTeacher.firstName} ${deletingTeacher.lastName}`)
            : ""
        }
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setDeletingTeacher(null);
        }}
      />

      {/* ---- Toast Container ---- */}
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </div>
  );
}
