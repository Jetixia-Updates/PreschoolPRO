"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Brain,
  MessageCircle,
  Heart,
  Activity,
  Palette,
  Search,
  Filter,
  Plus,
  FileText,
  ChevronRight,
  TrendingUp,
  Star,
  Edit2,
  Trash2,
  Download,
  BarChart3,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  age: string;
  cognitive: number;
  language: number;
  social: number;
  physical: number;
  creative: number;
  overall: "on-track" | "attention" | "delayed";
}

interface Assessment {
  id: number;
  studentId: number;
  student: string;
  domain: string;
  domainKey: string;
  score: number;
  notes: string;
  date: string;
  assessor: string;
  status: "completed" | "pending";
}

interface Milestone {
  id: number;
  title: string;
  domain: string;
  domainKey: string;
  targetAge: string;
  description: string;
  completed: number;
  total: number;
  status: "completed" | "in-progress" | "pending";
}

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Initial Data ────────────────────────────────────────────────────────────

const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "Sara Ahmed", age: "3y 11m", cognitive: 85, language: 78, social: 90, physical: 82, creative: 95, overall: "on-track" },
  { id: 2, name: "Omar Khalid", age: "4y 7m", cognitive: 72, language: 62, social: 80, physical: 88, creative: 76, overall: "attention" },
  { id: 3, name: "Layla Mohammed", age: "2y 1m", cognitive: 60, language: 55, social: 70, physical: 91, creative: 85, overall: "attention" },
  { id: 4, name: "Youssef Ali", age: "3y 4m", cognitive: 88, language: 82, social: 74, physical: 79, creative: 90, overall: "on-track" },
  { id: 5, name: "Noor Hassan", age: "3y 8m", cognitive: 92, language: 88, social: 95, physical: 85, creative: 95, overall: "on-track" },
  { id: 6, name: "Adam Ibrahim", age: "4y 5m", cognitive: 45, language: 50, social: 55, physical: 60, creative: 65, overall: "delayed" },
  { id: 7, name: "Fatima Zayed", age: "3y 2m", cognitive: 80, language: 75, social: 88, physical: 77, creative: 82, overall: "on-track" },
  { id: 8, name: "Hassan Mansour", age: "4y 0m", cognitive: 68, language: 70, social: 65, physical: 72, creative: 60, overall: "attention" },
];

const INITIAL_ASSESSMENTS: Assessment[] = [
  { id: 1, studentId: 1, student: "Sara Ahmed", domain: "Cognitive", domainKey: "cognitive", score: 85, notes: "Excellent problem solving", date: "2026-02-14", assessor: "Ms. Johnson", status: "completed" },
  { id: 2, studentId: 2, student: "Omar Khalid", domain: "Language", domainKey: "language", score: 62, notes: "Needs more vocabulary practice", date: "2026-02-14", assessor: "Ms. Garcia", status: "completed" },
  { id: 3, studentId: 3, student: "Layla Mohammed", domain: "Physical", domainKey: "physical", score: 91, notes: "Great motor skills", date: "2026-02-13", assessor: "Mr. Park", status: "completed" },
  { id: 4, studentId: 4, student: "Youssef Ali", domain: "Social-Emotional", domainKey: "social", score: 74, notes: "Improving social interactions", date: "2026-02-13", assessor: "Ms. Johnson", status: "completed" },
  { id: 5, studentId: 5, student: "Noor Hassan", domain: "Creative", domainKey: "creative", score: 95, notes: "Very imaginative", date: "2026-02-12", assessor: "Ms. Rivera", status: "completed" },
  { id: 6, studentId: 6, student: "Adam Ibrahim", domain: "Cognitive", domainKey: "cognitive", score: 45, notes: "Requires additional support", date: "2026-02-15", assessor: "Ms. Johnson", status: "completed" },
];

const INITIAL_MILESTONES: Milestone[] = [
  { id: 1, title: "Color Recognition", domain: "Cognitive", domainKey: "cognitive", targetAge: "2-3y", description: "Ability to identify and name primary colors", completed: 142, total: 160, status: "in-progress" },
  { id: 2, title: "Simple Sentence Formation", domain: "Language", domainKey: "language", targetAge: "3-4y", description: "Forming 3-5 word sentences", completed: 89, total: 120, status: "in-progress" },
  { id: 3, title: "Sharing & Turn-Taking", domain: "Social-Emotional", domainKey: "social", targetAge: "2-4y", description: "Demonstrates sharing and waiting for turns", completed: 178, total: 200, status: "in-progress" },
  { id: 4, title: "Jumping with Both Feet", domain: "Physical", domainKey: "physical", targetAge: "2-3y", description: "Able to jump forward with both feet leaving the ground", completed: 155, total: 160, status: "in-progress" },
  { id: 5, title: "Finger Painting", domain: "Creative", domainKey: "creative", targetAge: "1-2y", description: "Uses fingers to create art with paint", completed: 87, total: 87, status: "completed" },
  { id: 6, title: "Counting to 10", domain: "Cognitive", domainKey: "cognitive", targetAge: "3-4y", description: "Can count from 1 to 10 in sequence", completed: 65, total: 120, status: "in-progress" },
  { id: 7, title: "Emotional Expression", domain: "Social-Emotional", domainKey: "social", targetAge: "2-3y", description: "Names basic emotions: happy, sad, angry", completed: 130, total: 160, status: "in-progress" },
  { id: 8, title: "Rhythmic Movement", domain: "Creative", domainKey: "creative", targetAge: "3-4y", description: "Moves body in rhythm with music", completed: 45, total: 120, status: "pending" },
];

// ─── Domain config ───────────────────────────────────────────────────────────

const DOMAINS = [
  { key: "cognitive", label: "Cognitive", icon: Brain, color: "bg-blue-500", lightColor: "bg-blue-500/10 text-blue-600", badgeClass: "bg-blue-100 text-blue-700" },
  { key: "language", label: "Language", icon: MessageCircle, color: "bg-purple-500", lightColor: "bg-purple-500/10 text-purple-600", badgeClass: "bg-purple-100 text-purple-700" },
  { key: "social", label: "Social-Emotional", icon: Heart, color: "bg-pink-500", lightColor: "bg-pink-500/10 text-pink-600", badgeClass: "bg-pink-100 text-pink-700" },
  { key: "physical", label: "Physical", icon: Activity, color: "bg-green-500", lightColor: "bg-green-500/10 text-green-600", badgeClass: "bg-green-100 text-green-700" },
  { key: "creative", label: "Creative", icon: Palette, color: "bg-orange-500", lightColor: "bg-orange-500/10 text-orange-600", badgeClass: "bg-orange-100 text-orange-700" },
] as const;

type DomainKey = (typeof DOMAINS)[number]["key"];

function getDomainConfig(key: string) {
  return DOMAINS.find((d) => d.key === key) ?? DOMAINS[0];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DevelopmentTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, error: showError, dismiss } = useToast();

  // ─── State ──────────────────────────────────────────────────────────────

  const [students] = useState<Student[]>(INITIAL_STUDENTS);
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("students");

  // Dialogs
  const [addAssessmentOpen, setAddAssessmentOpen] = useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "assessment" | "milestone"; id: number } | null>(null);

  // Assessment form
  const [assessmentForm, setAssessmentForm] = useState({
    studentId: "",
    domainKey: "cognitive",
    score: "3",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Milestone form
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    domainKey: "cognitive",
    targetAge: "",
    description: "",
  });

  // ─── Translations ──────────────────────────────────────────────────────

  const t = {
    title: isRTL ? "تتبع التطور" : "Development Tracking",
    subtitle: isRTL ? "مراقبة التطور في جميع مجالات النمو" : "Monitor progress across all developmental domains",
    searchStudents: isRTL ? "البحث عن طالب..." : "Search student...",
    allDomains: isRTL ? "جميع المجالات" : "All Domains",
    students: isRTL ? "الطلاب" : "Students",
    assessments: isRTL ? "التقييمات" : "Assessments",
    milestones: isRTL ? "المعالم المهمة" : "Milestones",
    onTrack: isRTL ? "على المسار" : "On Track",
    needsAttention: isRTL ? "يحتاج اهتمام" : "Needs Attention",
    delayed: isRTL ? "متأخر" : "Delayed",
    totalAssessments: isRTL ? "إجمالي التقييمات" : "Total Assessments",
    completionRate: isRTL ? "معدل الإكمال" : "Completion Rate",
    avgProgress: isRTL ? "متوسط التقدم" : "Avg. Progress",
    milestonesReached: isRTL ? "المعالم المحققة" : "Milestones Reached",
    viewProfile: isRTL ? "عرض الملف" : "View Profile",
    completed: isRTL ? "مكتمل" : "Completed",
    inProgress: isRTL ? "قيد التنفيذ" : "In Progress",
    pending: isRTL ? "معلق" : "Pending",
    age: isRTL ? "العمر" : "Age",
    addAssessment: isRTL ? "إضافة تقييم" : "Add Assessment",
    addMilestone: isRTL ? "إضافة معلم" : "Add Milestone",
    generateReport: isRTL ? "إنشاء تقرير" : "Generate Report",
    fullReport: isRTL ? "تقرير شامل" : "Full Report",
    delete: isRTL ? "حذف" : "Delete",
    cancel: isRTL ? "إلغاء" : "Cancel",
    save: isRTL ? "حفظ" : "Save",
    student: isRTL ? "الطالب" : "Student",
    domain: isRTL ? "المجال" : "Domain",
    score: isRTL ? "الدرجة" : "Score",
    notes: isRTL ? "ملاحظات" : "Notes",
    date: isRTL ? "التاريخ" : "Date",
    title_field: isRTL ? "العنوان" : "Title",
    targetAge: isRTL ? "العمر المستهدف" : "Target Age",
    description: isRTL ? "الوصف" : "Description",
    assessor: isRTL ? "المقيّم" : "Assessor",
    progress: isRTL ? "التقدم" : "Progress",
    developmentDomains: isRTL ? "مجالات التطور" : "Development Domains",
  };

  // ─── Computed / filters ────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      if (domainFilter === "all") return matchesSearch;
      const domainScore = s[domainFilter as DomainKey];
      return matchesSearch && typeof domainScore === "number";
    });
  }, [students, search, domainFilter]);

  const filteredAssessments = useMemo(() => {
    if (domainFilter === "all") return assessments;
    return assessments.filter((a) => a.domainKey === domainFilter);
  }, [assessments, domainFilter]);

  const filteredMilestones = useMemo(() => {
    if (domainFilter === "all") return milestones;
    return milestones.filter((m) => m.domainKey === domainFilter);
  }, [milestones, domainFilter]);

  const domainStats = useMemo(() => {
    return DOMAINS.map((domain) => {
      const scores = students.map((s) => s[domain.key as DomainKey] as number);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const onTrack = scores.filter((s) => s >= 80).length;
      const attention = scores.filter((s) => s >= 60 && s < 80).length;
      const delayed = scores.filter((s) => s < 60).length;
      return { ...domain, progress: avg, onTrack, attention, delayed, total: scores.length };
    });
  }, [students]);

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;

  // ─── Helpers ───────────────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge variant="success">{t.onTrack}</Badge>;
      case "attention":
        return <Badge variant="warning">{t.needsAttention}</Badge>;
      case "delayed":
        return <Badge variant="destructive">{t.delayed}</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  // ─── Actions ───────────────────────────────────────────────────────────

  const handleAddAssessment = () => {
    if (!assessmentForm.studentId) {
      showError("Validation Error", "Please select a student.");
      return;
    }
    const selectedStudent = students.find((s) => s.id === Number(assessmentForm.studentId));
    if (!selectedStudent) return;

    const domainCfg = getDomainConfig(assessmentForm.domainKey);
    const scorePercent = Number(assessmentForm.score) * 20;

    const newAssessment: Assessment = {
      id: Date.now(),
      studentId: selectedStudent.id,
      student: selectedStudent.name,
      domain: domainCfg.label,
      domainKey: assessmentForm.domainKey,
      score: scorePercent,
      notes: assessmentForm.notes,
      date: assessmentForm.date,
      assessor: "Current User",
      status: "completed",
    };

    setAssessments((prev) => [newAssessment, ...prev]);
    setAddAssessmentOpen(false);
    setAssessmentForm({ studentId: "", domainKey: "cognitive", score: "3", notes: "", date: new Date().toISOString().split("T")[0] });
    success("Assessment Added", `Assessment for ${selectedStudent.name} in ${domainCfg.label} saved.`);
  };

  const handleAddMilestone = () => {
    if (!milestoneForm.title.trim()) {
      showError("Validation Error", "Please enter a milestone title.");
      return;
    }
    if (!milestoneForm.targetAge.trim()) {
      showError("Validation Error", "Please enter a target age range.");
      return;
    }

    const domainCfg = getDomainConfig(milestoneForm.domainKey);

    const newMilestone: Milestone = {
      id: Date.now(),
      title: milestoneForm.title,
      domain: domainCfg.label,
      domainKey: milestoneForm.domainKey,
      targetAge: milestoneForm.targetAge,
      description: milestoneForm.description,
      completed: 0,
      total: students.length,
      status: "pending",
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setAddMilestoneOpen(false);
    setMilestoneForm({ title: "", domainKey: "cognitive", targetAge: "", description: "" });
    success("Milestone Added", `"${newMilestone.title}" has been created.`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "assessment") {
      setAssessments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      success("Assessment Deleted", "The assessment has been removed.");
    } else {
      setMilestones((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      success("Milestone Deleted", "The milestone has been removed.");
    }
    setDeleteTarget(null);
  };

  const handleGenerateReport = () => {
    const lines = [
      "Development Tracking Report",
      `Generated: ${new Date().toLocaleDateString()}`,
      "",
      "=== Domain Summary ===",
      ...domainStats.map((d) => `${d.label}: ${d.progress}% avg | On Track: ${d.onTrack} | Attention: ${d.attention} | Delayed: ${d.delayed}`),
      "",
      "=== Student Scores ===",
      ...students.map(
        (s) =>
          `${s.name} (${s.age}) — Cog: ${s.cognitive} | Lang: ${s.language} | Soc: ${s.social} | Phys: ${s.physical} | Creat: ${s.creative} | Status: ${s.overall}`
      ),
      "",
      "=== Recent Assessments ===",
      ...assessments.map((a) => `${a.date} | ${a.student} | ${a.domain} | Score: ${a.score}% | ${a.assessor}`),
      "",
      "=== Milestones ===",
      ...milestones.map((m) => `${m.title} (${m.domain}, ${m.targetAge}) — ${m.completed}/${m.total} | ${m.status}`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `development-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    success("Report Downloaded", "The development tracking report has been generated.");
  };

  const handleViewProfile = (studentId: number) => {
    router.push(`/${locale}/dashboard/students/${studentId}`);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => { setActiveTab("assessments"); setAddAssessmentOpen(true); }}>
              <Plus className="h-4 w-4" />
              {t.addAssessment}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => { setActiveTab("milestones"); setAddMilestoneOpen(true); }}>
              <Plus className="h-4 w-4" />
              {t.addMilestone}
            </Button>
            <Button size="lg" className="gap-2" onClick={handleGenerateReport}>
              <Download className="h-4 w-4" />
              {t.generateReport}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title={t.totalAssessments}
            value={assessments.length.toLocaleString()}
            change={`+${assessments.filter((a) => a.date === new Date().toISOString().split("T")[0]).length} today`}
            changeType="positive"
            icon={Target}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title={t.completionRate}
            value={`${assessments.length > 0 ? Math.round((assessments.filter((a) => a.status === "completed").length / assessments.length) * 100) : 0}%`}
            change="+3% vs last month"
            changeType="positive"
            icon={CheckCircle2}
            iconColor="bg-emerald-500/10 text-emerald-600"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title={t.avgProgress}
            value={`${domainStats.length > 0 ? Math.round(domainStats.reduce((a, d) => a + d.progress, 0) / domainStats.length) : 0}%`}
            change="+5% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-blue-500/10 text-blue-600"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title={t.milestonesReached}
            value={completedMilestones.toString()}
            change={`of ${milestones.length} total`}
            changeType="neutral"
            icon={Star}
            iconColor="bg-amber-500/10 text-amber-600"
          />
        </motion.div>
      </div>

      {/* Domain Overview Cards */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <h2 className="mb-4 text-lg font-semibold">{t.developmentDomains}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {domainStats.map((domain, i) => {
            const DomainIcon = domain.icon;
            return (
              <motion.div
                key={domain.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`rounded-xl p-2.5 ${domain.lightColor}`}>
                        <DomainIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{domain.label}</h3>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{t.progress}</span>
                        <span className="text-sm font-bold">{domain.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className={`h-full rounded-full ${domain.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${domain.progress}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">{t.onTrack}</span>
                        <span className="font-medium">{domain.onTrack}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">{t.needsAttention}</span>
                        <span className="font-medium">{domain.attention}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">{t.delayed}</span>
                        <span className="font-medium">{domain.delayed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs: Students / Assessments / Milestones */}
      <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <TabsList>
              <TabsTrigger value="students">{t.students}</TabsTrigger>
              <TabsTrigger value="assessments">{t.assessments}</TabsTrigger>
              <TabsTrigger value="milestones">{t.milestones}</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="w-64">
                <Input
                  placeholder={t.searchStudents}
                  icon={<Search className="h-4 w-4" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allDomains}</SelectItem>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─── Students Tab ─────────────────────────────────────────── */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t.students} ({filteredStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No students match your search.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((student, i) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col gap-4 rounded-xl border p-4 transition-all hover:bg-muted/50 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-3 min-w-0 sm:w-48">
                          <Avatar name={student.name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{t.age}: {student.age}</p>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center gap-3">
                          {(["cognitive", "language", "social", "physical", "creative"] as const).map((key) => {
                            const domainCfg = getDomainConfig(key);
                            const val = student[key];
                            return (
                              <div key={key} className={`text-center min-w-[60px] rounded-lg border px-2 py-1 ${getScoreBg(val)}`}>
                                <p className={`text-sm font-bold ${getScoreColor(val)}`}>{val}%</p>
                                <p className="text-[10px] text-muted-foreground">{domainCfg.label}</p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(student.overall)}
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleViewProfile(student.id)}>
                            {t.viewProfile}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Assessments Tab ──────────────────────────────────────── */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t.assessments} ({filteredAssessments.length})
                  </CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => setAddAssessmentOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t.addAssessment}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAssessments.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No assessments found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredAssessments.map((assessment, i) => {
                      const domainCfg = getDomainConfig(assessment.domainKey);
                      return (
                        <motion.div
                          key={assessment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted/30"
                        >
                          <Avatar name={assessment.student} size="sm" />

                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{assessment.student}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${domainCfg.badgeClass}`}>
                                {assessment.domain}
                              </span>
                              <span className="text-xs text-muted-foreground">{assessment.assessor}</span>
                            </div>
                          </div>

                          <div className="text-center">
                            {assessment.status === "completed" ? (
                              <div className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 ${getScoreBg(assessment.score)}`}>
                                <Star className={`h-3.5 w-3.5 ${getScoreColor(assessment.score)}`} />
                                <span className={`text-lg font-bold ${getScoreColor(assessment.score)}`}>{assessment.score}%</span>
                              </div>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="me-1 h-3 w-3" />
                                {t.pending}
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground whitespace-nowrap">{assessment.date}</p>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget({ type: "assessment", id: assessment.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Milestones Tab ───────────────────────────────────────── */}
          <TabsContent value="milestones">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t.milestones} ({filteredMilestones.length})
                  </CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => setAddMilestoneOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t.addMilestone}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMilestones.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No milestones found.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredMilestones.map((milestone, i) => {
                      const pct = milestone.total > 0 ? Math.round((milestone.completed / milestone.total) * 100) : 0;
                      const domainCfg = getDomainConfig(milestone.domainKey);
                      const DIcon = domainCfg.icon;
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-xl border p-4 transition-all hover:bg-muted/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-lg p-2 ${domainCfg.lightColor}`}>
                                <DIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{milestone.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${domainCfg.badgeClass}`}>
                                    {milestone.domain}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{milestone.targetAge}</span>
                                </div>
                                {milestone.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-end">
                                <p className="text-sm font-bold">{milestone.completed}/{milestone.total}</p>
                                <p className="text-[10px] text-muted-foreground">{t.students}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteTarget({ type: "milestone", id: milestone.id })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : "bg-amber-500"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div>
                              {milestone.status === "completed" && (
                                <div className="flex items-center gap-1 text-xs text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t.completed}
                                </div>
                              )}
                              {milestone.status === "in-progress" && (
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <TrendingUp className="h-3 w-3" />
                                  {t.inProgress}
                                </div>
                              )}
                              {milestone.status === "pending" && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {t.pending}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-semibold">{pct}%</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ─── Add Assessment Dialog ──────────────────────────────────────── */}
      <FormDialog
        open={addAssessmentOpen}
        title={t.addAssessment}
        description="Record a new developmental assessment for a student."
        onClose={() => setAddAssessmentOpen(false)}
        onSubmit={handleAddAssessment}
        submitLabel={t.save}
        cancelLabel={t.cancel}
      >
        <div className="space-y-4">
          <FormField label={t.student} required>
            <select
              value={assessmentForm.studentId}
              onChange={(e) => setAssessmentForm((f) => ({ ...f, studentId: e.target.value }))}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t.domain} required>
            <select
              value={assessmentForm.domainKey}
              onChange={(e) => setAssessmentForm((f) => ({ ...f, domainKey: e.target.value }))}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {DOMAINS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label={`${t.score} (1-5)`} required>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={assessmentForm.score}
                onChange={(e) => setAssessmentForm((f) => ({ ...f, score: e.target.value }))}
                className="flex-1 accent-blue-600"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-5 w-5 cursor-pointer transition-colors ${n <= Number(assessmentForm.score) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                    onClick={() => setAssessmentForm((f) => ({ ...f, score: String(n) }))}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700 w-16 text-center">{Number(assessmentForm.score) * 20}%</span>
            </div>
          </FormField>

          <FormField label={t.date} required>
            <input
              type="date"
              value={assessmentForm.date}
              onChange={(e) => setAssessmentForm((f) => ({ ...f, date: e.target.value }))}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>

          <FormField label={t.notes}>
            <textarea
              value={assessmentForm.notes}
              onChange={(e) => setAssessmentForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Optional notes about this assessment..."
              className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── Add Milestone Dialog ───────────────────────────────────────── */}
      <FormDialog
        open={addMilestoneOpen}
        title={t.addMilestone}
        description="Define a new developmental milestone to track."
        onClose={() => setAddMilestoneOpen(false)}
        onSubmit={handleAddMilestone}
        submitLabel={t.save}
        cancelLabel={t.cancel}
      >
        <div className="space-y-4">
          <FormField label={t.title_field} required>
            <input
              type="text"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Counting to 20"
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>

          <FormField label={t.domain} required>
            <select
              value={milestoneForm.domainKey}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, domainKey: e.target.value }))}
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {DOMAINS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t.targetAge} required>
            <input
              type="text"
              value={milestoneForm.targetAge}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, targetAge: e.target.value }))}
              placeholder="e.g. 3-4y"
              className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </FormField>

          <FormField label={t.description}>
            <textarea
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe what this milestone measures..."
              className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── Confirm Delete Dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget?.type === "assessment" ? "Delete Assessment" : "Delete Milestone"}
        description={
          deleteTarget?.type === "assessment"
            ? "Are you sure you want to delete this assessment? This action cannot be undone."
            : "Are you sure you want to delete this milestone? This action cannot be undone."
        }
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast container */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
