"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Search,
  Shield,
  Heart,
  Syringe,
  AlertTriangle,
  AlertCircle,
  Activity,
  Thermometer,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthAlert {
  id: number;
  student: string;
  alertType: string;
  description: string;
  priority: "high" | "medium" | "low";
  date: string;
  status: "active" | "resolved";
}

interface VaccinationRecord {
  id: number;
  student: string;
  vaccineName: string;
  date: string;
  nextDue: string;
  administeredBy: string;
  status: "up-to-date" | "due-soon" | "overdue";
}

interface IncidentReport {
  id: number;
  student: string;
  type: "injury" | "illness" | "behavioral" | "other";
  severity: "low" | "medium" | "high";
  description: string;
  actionTaken: string;
  date: string;
  reportedBy: string;
}

interface AllergyRecord {
  id: number;
  student: string;
  allergen: string;
  severity: "low" | "medium" | "high";
  reaction: string;
  treatment: string;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const initialAlerts: HealthAlert[] = [
  {
    id: 1,
    student: "Sara Ahmed",
    alertType: "Medication Reminder",
    description: "Daily asthma inhaler due at 12:00 PM. Ensure administration before outdoor activities.",
    priority: "high",
    date: "Feb 15, 2026",
    status: "active",
  },
  {
    id: 2,
    student: "Adam Ibrahim",
    alertType: "Allergy Warning",
    description: "Peanut allergy — verify today's lunch menu does not contain nut traces.",
    priority: "high",
    date: "Feb 15, 2026",
    status: "active",
  },
  {
    id: 3,
    student: "Omar Khalid",
    alertType: "Checkup Due",
    description: "Annual vision and hearing screening overdue. Parent notified on Feb 10.",
    priority: "medium",
    date: "Feb 14, 2026",
    status: "active",
  },
  {
    id: 4,
    student: "Layla Mohammed",
    alertType: "Injury Follow-up",
    description: "Sprained wrist from Feb 12. Check bandage and range of motion during PE.",
    priority: "low",
    date: "Feb 13, 2026",
    status: "active",
  },
];

const initialVaccinations: VaccinationRecord[] = [
  { id: 1, student: "Sara Ahmed", vaccineName: "MMR (Dose 2)", date: "Jan 20, 2026", nextDue: "N/A", administeredBy: "Dr. Nadia Farooq", status: "up-to-date" },
  { id: 2, student: "Adam Ibrahim", vaccineName: "DTP Booster", date: "Dec 05, 2025", nextDue: "Jun 05, 2026", administeredBy: "Dr. Samir Hasan", status: "up-to-date" },
  { id: 3, student: "Omar Khalid", vaccineName: "Hepatitis B (Dose 3)", date: "Nov 15, 2025", nextDue: "May 15, 2026", administeredBy: "Dr. Nadia Farooq", status: "due-soon" },
  { id: 4, student: "Layla Mohammed", vaccineName: "Polio (OPV)", date: "Oct 01, 2025", nextDue: "Feb 01, 2026", administeredBy: "Dr. Reem Khalil", status: "overdue" },
  { id: 5, student: "Noor Hassan", vaccineName: "Varicella", date: "Jan 10, 2026", nextDue: "N/A", administeredBy: "Dr. Samir Hasan", status: "up-to-date" },
  { id: 6, student: "Youssef Ali", vaccineName: "Influenza (Annual)", date: "Sep 20, 2025", nextDue: "Mar 20, 2026", administeredBy: "Dr. Reem Khalil", status: "due-soon" },
];

const initialIncidents: IncidentReport[] = [
  { id: 1, student: "Omar Khalid", type: "injury", severity: "low", description: "Small knee scrape from tripping on the playground.", actionTaken: "Wound cleaned and bandage applied.", date: "Feb 14, 2026", reportedBy: "Ms. Fatima Al-Zahra" },
  { id: 2, student: "Sara Ahmed", type: "illness", severity: "medium", description: "Complained of nausea and stomach pain after lunch.", actionTaken: "Rested in nurse's office; parent called for early pickup.", date: "Feb 12, 2026", reportedBy: "Ms. Hana Al-Mansour" },
  { id: 3, student: "Adam Ibrahim", type: "behavioral", severity: "medium", description: "Pushed another student during recess, causing a minor fall.", actionTaken: "Separated students, counselor session scheduled.", date: "Feb 10, 2026", reportedBy: "Mr. Tariq Nasser" },
  { id: 4, student: "Youssef Ali", type: "other", severity: "low", description: "Reported persistent headaches over the past two days.", actionTaken: "Parent notified; recommended a vision test.", date: "Feb 08, 2026", reportedBy: "Ms. Noura Al-Qahtani" },
];

const initialAllergies: AllergyRecord[] = [
  { id: 1, student: "Sara Ahmed", allergen: "Peanuts", severity: "high", reaction: "Anaphylaxis — throat swelling, hives", treatment: "EpiPen auto-injector, call 911 immediately" },
  { id: 2, student: "Layla Mohammed", allergen: "Dairy Products", severity: "medium", reaction: "Stomach cramps, nausea, vomiting", treatment: "Avoid dairy; provide lactose-free alternatives" },
  { id: 3, student: "Adam Ibrahim", allergen: "Gluten", severity: "medium", reaction: "Bloating, abdominal pain, fatigue", treatment: "Strict gluten-free diet; notify cafeteria" },
  { id: 4, student: "Noor Hassan", allergen: "Bee Stings", severity: "high", reaction: "Severe swelling, risk of anaphylaxis", treatment: "EpiPen on-site, call emergency services" },
  { id: 5, student: "Youssef Ali", allergen: "Dust Mites", severity: "low", reaction: "Sneezing, runny nose, watery eyes", treatment: "Antihistamines as needed; keep environment clean" },
];

// ─── Animation variant ────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Helper: next id ──────────────────────────────────────────────────────────

function nextId<T extends { id: number }>(arr: T[]) {
  return arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HealthPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const { toasts, success, error: toastError, dismiss } = useToast();

  // ── State: data ───────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<HealthAlert[]>(initialAlerts);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(initialVaccinations);
  const [incidents, setIncidents] = useState<IncidentReport[]>(initialIncidents);
  const [allergies, setAllergies] = useState<AllergyRecord[]>(initialAllergies);

  // ── State: UI ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("alerts");

  // ── Dialogs: open flags ───────────────────────────────────────────────────
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [vaccinationOpen, setVaccinationOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  // ── Dialogs: confirm delete ───────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    type: "alert" | "vaccination" | "incident" | "allergy";
    id: number;
  }>({ open: false, type: "alert", id: 0 });

  // ── Forms: incident ───────────────────────────────────────────────────────
  const [incidentForm, setIncidentForm] = useState({
    student: "",
    type: "injury" as IncidentReport["type"],
    severity: "low" as IncidentReport["severity"],
    description: "",
    actionTaken: "",
    date: "",
    reportedBy: "",
  });

  // ── Forms: vaccination ────────────────────────────────────────────────────
  const [vaccinationForm, setVaccinationForm] = useState({
    student: "",
    vaccineName: "",
    date: "",
    nextDue: "",
    administeredBy: "",
  });

  // ── Forms: allergy ────────────────────────────────────────────────────────
  const [allergyForm, setAllergyForm] = useState({
    student: "",
    allergen: "",
    severity: "low" as AllergyRecord["severity"],
    reaction: "",
    treatment: "",
  });

  // ── Forms: health alert ───────────────────────────────────────────────────
  const [alertForm, setAlertForm] = useState({
    student: "",
    alertType: "",
    description: "",
    priority: "low" as HealthAlert["priority"],
  });

  // ── Filtered data ─────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredAlerts = useMemo(() => alerts.filter((a) => a.student.toLowerCase().includes(q)), [alerts, q]);
  const filteredVaccinations = useMemo(() => vaccinations.filter((v) => v.student.toLowerCase().includes(q)), [vaccinations, q]);
  const filteredIncidents = useMemo(() => incidents.filter((i) => i.student.toLowerCase().includes(q)), [incidents, q]);
  const filteredAllergies = useMemo(() => allergies.filter((a) => a.student.toLowerCase().includes(q)), [allergies, q]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeAlertCount = alerts.filter((a) => a.status === "active").length;
  const vaccinationUpToDate = vaccinations.length > 0
    ? Math.round((vaccinations.filter((v) => v.status === "up-to-date").length / vaccinations.length) * 100)
    : 0;
  const incidentsThisMonth = incidents.length;
  const allergiesTracked = allergies.length;

  // ── Handlers: Report Incident ─────────────────────────────────────────────
  const handleSubmitIncident = () => {
    if (!incidentForm.student || !incidentForm.description) {
      toastError("Missing fields", "Student and description are required.");
      return;
    }
    setIncidents((prev) => [
      {
        id: nextId(prev),
        ...incidentForm,
      },
      ...prev,
    ]);
    setIncidentForm({ student: "", type: "injury", severity: "low", description: "", actionTaken: "", date: "", reportedBy: "" });
    setIncidentOpen(false);
    success("Incident Reported", `Incident for ${incidentForm.student} has been recorded.`);
  };

  // ── Handlers: Add Vaccination ─────────────────────────────────────────────
  const handleSubmitVaccination = () => {
    if (!vaccinationForm.student || !vaccinationForm.vaccineName) {
      toastError("Missing fields", "Student and vaccine name are required.");
      return;
    }
    setVaccinations((prev) => [
      {
        id: nextId(prev),
        ...vaccinationForm,
        status: "up-to-date" as const,
      },
      ...prev,
    ]);
    setVaccinationForm({ student: "", vaccineName: "", date: "", nextDue: "", administeredBy: "" });
    setVaccinationOpen(false);
    success("Vaccination Added", `${vaccinationForm.vaccineName} recorded for ${vaccinationForm.student}.`);
  };

  // ── Handlers: Add Allergy ─────────────────────────────────────────────────
  const handleSubmitAllergy = () => {
    if (!allergyForm.student || !allergyForm.allergen) {
      toastError("Missing fields", "Student and allergen are required.");
      return;
    }
    setAllergies((prev) => [
      {
        id: nextId(prev),
        ...allergyForm,
      },
      ...prev,
    ]);
    setAllergyForm({ student: "", allergen: "", severity: "low", reaction: "", treatment: "" });
    setAllergyOpen(false);
    success("Allergy Recorded", `${allergyForm.allergen} allergy recorded for ${allergyForm.student}.`);
  };

  // ── Handlers: Add Health Alert ────────────────────────────────────────────
  const handleSubmitAlert = () => {
    if (!alertForm.student || !alertForm.alertType) {
      toastError("Missing fields", "Student and alert type are required.");
      return;
    }
    setAlerts((prev) => [
      {
        id: nextId(prev),
        ...alertForm,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        status: "active" as const,
      },
      ...prev,
    ]);
    setAlertForm({ student: "", alertType: "", description: "", priority: "low" });
    setAlertOpen(false);
    success("Alert Created", `Health alert for ${alertForm.student} has been created.`);
  };

  // ── Handlers: Dismiss / Resolve Alert ─────────────────────────────────────
  const handleResolveAlert = (id: number) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a)));
    success("Alert Resolved", "The health alert has been marked as resolved.");
  };

  // ── Handlers: Delete ──────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    const { type, id } = confirmDelete;
    switch (type) {
      case "alert":
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        break;
      case "vaccination":
        setVaccinations((prev) => prev.filter((v) => v.id !== id));
        break;
      case "incident":
        setIncidents((prev) => prev.filter((i) => i.id !== id));
        break;
      case "allergy":
        setAllergies((prev) => prev.filter((a) => a.id !== id));
        break;
    }
    setConfirmDelete({ open: false, type: "alert", id: 0 });
    success("Record Deleted", "The record has been permanently removed.");
  };

  // ── Priority helpers ──────────────────────────────────────────────────────
  const priorityColor = (p: string) => {
    switch (p) {
      case "high": return "border-red-300 bg-red-50";
      case "medium": return "border-amber-300 bg-amber-50";
      case "low": return "border-blue-300 bg-blue-50";
      default: return "";
    }
  };
  const priorityIconColor = (p: string) => {
    switch (p) {
      case "high": return "bg-red-100 text-red-600";
      case "medium": return "bg-amber-100 text-amber-600";
      case "low": return "bg-blue-100 text-blue-600";
      default: return "";
    }
  };
  const priorityBadge = (p: string) => {
    switch (p) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge variant="warning">Medium</Badge>;
      case "low": return <Badge variant="info">Low</Badge>;
      default: return null;
    }
  };

  const severityBadge = (s: string) => {
    switch (s) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge variant="warning">Medium</Badge>;
      case "low": return <Badge variant="info">Low</Badge>;
      default: return null;
    }
  };

  const vaccinationStatusBadge = (s: string) => {
    switch (s) {
      case "up-to-date": return <Badge variant="success">Up to Date</Badge>;
      case "due-soon": return <Badge variant="warning">Due Soon</Badge>;
      case "overdue": return <Badge variant="destructive">Overdue</Badge>;
      default: return null;
    }
  };

  const incidentTypeBadge = (t: string) => {
    switch (t) {
      case "injury": return <Badge variant="destructive">Injury</Badge>;
      case "illness": return <Badge variant="warning">Illness</Badge>;
      case "behavioral": return <Badge variant="info">Behavioral</Badge>;
      case "other": return <Badge variant="outline">Other</Badge>;
      default: return null;
    }
  };

  // ── Shared input classes ──────────────────────────────────────────────────
  const inputCls = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
  const selectCls = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none";
  const textareaCls = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none min-h-[80px] resize-none";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              {isRTL ? "الصحة والسلامة" : "Health & Safety"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isRTL ? "مراقبة صحة وسلامة الأطفال" : "Monitor children's health and safety records"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="gap-2" onClick={() => setIncidentOpen(true)}>
              <Plus className="h-4 w-4" />
              {isRTL ? "تسجيل حادثة" : "Report Incident"}
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setVaccinationOpen(true)}>
              <Syringe className="h-4 w-4" />
              {isRTL ? "تطعيم جديد" : "Add Vaccination"}
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setAllergyOpen(true)}>
              <AlertTriangle className="h-4 w-4" />
              {isRTL ? "حساسية جديدة" : "Add Allergy"}
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setAlertOpen(true)}>
              <AlertCircle className="h-4 w-4" />
              {isRTL ? "تنبيه جديد" : "Add Alert"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title={isRTL ? "تنبيهات نشطة" : "Active Alerts"}
            value={String(activeAlertCount)}
            change={activeAlertCount > 0 ? "Need follow-up" : "All clear"}
            changeType={activeAlertCount > 0 ? "negative" : "positive"}
            icon={AlertCircle}
            iconColor="bg-destructive/10 text-destructive"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title={isRTL ? "معدل التطعيم" : "Vaccinations Up-to-Date"}
            value={`${vaccinationUpToDate}%`}
            change={`${vaccinations.filter((v) => v.status === "up-to-date").length} of ${vaccinations.length} current`}
            changeType="neutral"
            icon={Syringe}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title={isRTL ? "حوادث هذا الشهر" : "Incidents This Month"}
            value={String(incidentsThisMonth)}
            change="All documented"
            changeType="neutral"
            icon={Shield}
            iconColor="bg-warning/10 text-warning"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title={isRTL ? "حالات حساسية" : "Allergies Tracked"}
            value={String(allergiesTracked)}
            change={`${allergies.filter((a) => a.severity === "high").length} high severity`}
            changeType="negative"
            icon={AlertTriangle}
            iconColor="bg-secondary/10 text-secondary"
          />
        </motion.div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.28 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "البحث بالاسم..." : "Search by student name..."}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="alerts">
              <AlertCircle className="mr-1.5 h-4 w-4" />
              {isRTL ? "التنبيهات" : "Alerts"} ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="vaccinations">
              <Syringe className="mr-1.5 h-4 w-4" />
              {isRTL ? "التطعيمات" : "Vaccinations"} ({filteredVaccinations.length})
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <FileText className="mr-1.5 h-4 w-4" />
              {isRTL ? "الحوادث" : "Incidents"} ({filteredIncidents.length})
            </TabsTrigger>
            <TabsTrigger value="allergies">
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              {isRTL ? "الحساسية" : "Allergies"} ({filteredAllergies.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── Alerts Tab ────────────────────────────────────────────── */}
          <TabsContent value="alerts">
            <div className="space-y-3">
              {filteredAlerts.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
                    <p className="font-medium">No alerts found</p>
                  </CardContent>
                </Card>
              )}
              {filteredAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className={`border ${alert.status === "active" ? priorityColor(alert.priority) : "border-green-200 bg-green-50/50"}`}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className={`mt-0.5 rounded-xl p-2.5 ${alert.status === "active" ? priorityIconColor(alert.priority) : "bg-green-100 text-green-600"}`}>
                        {alert.status === "resolved" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : alert.priority === "high" ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : alert.priority === "medium" ? (
                          <Thermometer className="h-5 w-5" />
                        ) : (
                          <Activity className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{alert.student}</p>
                            <p className="text-sm text-muted-foreground">{alert.alertType}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {priorityBadge(alert.priority)}
                            <Badge variant={alert.status === "active" ? "destructive" : "success"}>
                              {alert.status === "active" ? "Active" : "Resolved"}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{alert.description}</p>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            <Clock className="me-1 inline h-3 w-3" />
                            {alert.date}
                          </p>
                          {alert.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Resolve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setConfirmDelete({ open: true, type: "alert", id: alert.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Vaccinations Tab ──────────────────────────────────────── */}
          <TabsContent value="vaccinations">
            <div className="space-y-3">
              {filteredVaccinations.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Syringe className="h-10 w-10 mb-2" />
                    <p className="font-medium">No vaccination records found</p>
                  </CardContent>
                </Card>
              )}
              {filteredVaccinations.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3 sm:w-44">
                          <Avatar name={record.student} size="sm" />
                          <div>
                            <p className="font-medium">{record.student}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Syringe className="h-4 w-4 text-primary" />
                            <p className="font-medium text-sm">{record.vaccineName}</p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span><Clock className="inline h-3 w-3 mr-1" />Given: {record.date}</span>
                            <span>Next due: {record.nextDue}</span>
                            <span>By: {record.administeredBy}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {vaccinationStatusBadge(record.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setConfirmDelete({ open: true, type: "vaccination", id: record.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Incidents Tab ─────────────────────────────────────────── */}
          <TabsContent value="incidents">
            <div className="space-y-3">
              {filteredIncidents.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Shield className="h-10 w-10 mb-2" />
                    <p className="font-medium">No incident reports found</p>
                  </CardContent>
                </Card>
              )}
              {filteredIncidents.map((incident, i) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 rounded-xl p-2.5 ${
                          incident.severity === "high"
                            ? "bg-red-100 text-red-600"
                            : incident.severity === "medium"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-blue-100 text-blue-600"
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold">{incident.student}</p>
                              <p className="text-xs text-muted-foreground">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {incident.date} &middot; Reported by {incident.reportedBy}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {incidentTypeBadge(incident.type)}
                              {severityBadge(incident.severity)}
                            </div>
                          </div>
                          <p className="text-sm">{incident.description}</p>
                          <div className="mt-2 rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground mb-0.5 font-medium">Action Taken</p>
                            <p className="text-sm">{incident.actionTaken}</p>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => setConfirmDelete({ open: true, type: "incident", id: incident.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ─── Allergies Tab ─────────────────────────────────────────── */}
          <TabsContent value="allergies">
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAllergies.length === 0 && (
                <Card className="sm:col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Eye className="h-10 w-10 mb-2" />
                    <p className="font-medium">No allergy records found</p>
                  </CardContent>
                </Card>
              )}
              {filteredAllergies.map((allergy, i) => (
                <motion.div
                  key={allergy.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className={allergy.severity === "high" ? "border-red-300" : ""}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={allergy.student} size="sm" />
                        <div className="flex-1">
                          <p className="font-semibold">{allergy.student}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {severityBadge(allergy.severity)}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setConfirmDelete({ open: true, type: "allergy", id: allergy.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Allergen</p>
                            <p className="font-medium">{allergy.allergen}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Activity className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Reaction</p>
                            <p>{allergy.reaction}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Treatment</p>
                            <p>{allergy.treatment}</p>
                          </div>
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

      {/* ══════════════════════════════════════════════════════════════════
          DIALOGS
         ══════════════════════════════════════════════════════════════════ */}

      {/* ── Report Incident Dialog ────────────────────────────────────── */}
      <FormDialog
        open={incidentOpen}
        title="Report Incident"
        description="Document a new health or safety incident."
        onClose={() => setIncidentOpen(false)}
        onSubmit={handleSubmitIncident}
        submitLabel="Report"
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Student" required>
            <input
              className={inputCls}
              placeholder="Student name"
              value={incidentForm.student}
              onChange={(e) => setIncidentForm((f) => ({ ...f, student: e.target.value }))}
            />
          </FormField>
          <FormField label="Type" required>
            <select
              className={selectCls}
              value={incidentForm.type}
              onChange={(e) => setIncidentForm((f) => ({ ...f, type: e.target.value as IncidentReport["type"] }))}
            >
              <option value="injury">Injury</option>
              <option value="illness">Illness</option>
              <option value="behavioral">Behavioral</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Severity" required>
            <select
              className={selectCls}
              value={incidentForm.severity}
              onChange={(e) => setIncidentForm((f) => ({ ...f, severity: e.target.value as IncidentReport["severity"] }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>
          <FormField label="Date" required>
            <input
              type="date"
              className={inputCls}
              value={incidentForm.date}
              onChange={(e) => setIncidentForm((f) => ({ ...f, date: e.target.value }))}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description" required>
              <textarea
                className={textareaCls}
                placeholder="Describe what happened..."
                value={incidentForm.description}
                onChange={(e) => setIncidentForm((f) => ({ ...f, description: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Action Taken">
              <textarea
                className={textareaCls}
                placeholder="What actions were taken?"
                value={incidentForm.actionTaken}
                onChange={(e) => setIncidentForm((f) => ({ ...f, actionTaken: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Reported By">
            <input
              className={inputCls}
              placeholder="Staff member name"
              value={incidentForm.reportedBy}
              onChange={(e) => setIncidentForm((f) => ({ ...f, reportedBy: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Vaccination Dialog ────────────────────────────────────── */}
      <FormDialog
        open={vaccinationOpen}
        title="Add Vaccination Record"
        description="Record a new vaccination for a student."
        onClose={() => setVaccinationOpen(false)}
        onSubmit={handleSubmitVaccination}
        submitLabel="Save Record"
        size="md"
      >
        <div className="grid gap-4">
          <FormField label="Student" required>
            <input
              className={inputCls}
              placeholder="Student name"
              value={vaccinationForm.student}
              onChange={(e) => setVaccinationForm((f) => ({ ...f, student: e.target.value }))}
            />
          </FormField>
          <FormField label="Vaccine Name" required>
            <input
              className={inputCls}
              placeholder="e.g. MMR, DTP, Hepatitis B"
              value={vaccinationForm.vaccineName}
              onChange={(e) => setVaccinationForm((f) => ({ ...f, vaccineName: e.target.value }))}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date Administered" required>
              <input
                type="date"
                className={inputCls}
                value={vaccinationForm.date}
                onChange={(e) => setVaccinationForm((f) => ({ ...f, date: e.target.value }))}
              />
            </FormField>
            <FormField label="Next Due Date">
              <input
                type="date"
                className={inputCls}
                value={vaccinationForm.nextDue}
                onChange={(e) => setVaccinationForm((f) => ({ ...f, nextDue: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Administered By">
            <input
              className={inputCls}
              placeholder="Doctor or nurse name"
              value={vaccinationForm.administeredBy}
              onChange={(e) => setVaccinationForm((f) => ({ ...f, administeredBy: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Allergy Dialog ────────────────────────────────────────── */}
      <FormDialog
        open={allergyOpen}
        title="Add Allergy Record"
        description="Record a known allergy for a student."
        onClose={() => setAllergyOpen(false)}
        onSubmit={handleSubmitAllergy}
        submitLabel="Save Allergy"
        size="md"
      >
        <div className="grid gap-4">
          <FormField label="Student" required>
            <input
              className={inputCls}
              placeholder="Student name"
              value={allergyForm.student}
              onChange={(e) => setAllergyForm((f) => ({ ...f, student: e.target.value }))}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Allergen" required>
              <input
                className={inputCls}
                placeholder="e.g. Peanuts, Dairy, Gluten"
                value={allergyForm.allergen}
                onChange={(e) => setAllergyForm((f) => ({ ...f, allergen: e.target.value }))}
              />
            </FormField>
            <FormField label="Severity" required>
              <select
                className={selectCls}
                value={allergyForm.severity}
                onChange={(e) => setAllergyForm((f) => ({ ...f, severity: e.target.value as AllergyRecord["severity"] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
          <FormField label="Reaction">
            <textarea
              className={textareaCls}
              placeholder="Describe the allergic reaction..."
              value={allergyForm.reaction}
              onChange={(e) => setAllergyForm((f) => ({ ...f, reaction: e.target.value }))}
            />
          </FormField>
          <FormField label="Treatment">
            <textarea
              className={textareaCls}
              placeholder="Treatment plan / emergency response..."
              value={allergyForm.treatment}
              onChange={(e) => setAllergyForm((f) => ({ ...f, treatment: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Health Alert Dialog ───────────────────────────────────── */}
      <FormDialog
        open={alertOpen}
        title="Add Health Alert"
        description="Create a new health alert for a student."
        onClose={() => setAlertOpen(false)}
        onSubmit={handleSubmitAlert}
        submitLabel="Create Alert"
        size="md"
      >
        <div className="grid gap-4">
          <FormField label="Student" required>
            <input
              className={inputCls}
              placeholder="Student name"
              value={alertForm.student}
              onChange={(e) => setAlertForm((f) => ({ ...f, student: e.target.value }))}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Alert Type" required>
              <input
                className={inputCls}
                placeholder="e.g. Medication Reminder, Checkup Due"
                value={alertForm.alertType}
                onChange={(e) => setAlertForm((f) => ({ ...f, alertType: e.target.value }))}
              />
            </FormField>
            <FormField label="Priority" required>
              <select
                className={selectCls}
                value={alertForm.priority}
                onChange={(e) => setAlertForm((f) => ({ ...f, priority: e.target.value as HealthAlert["priority"] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
          <FormField label="Description" required>
            <textarea
              className={textareaCls}
              placeholder="Describe the health alert..."
              value={alertForm.description}
              onChange={(e) => setAlertForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Confirm Delete Dialog ─────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Record"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ open: false, type: "alert", id: 0 })}
      />

      {/* ── Toasts ────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
