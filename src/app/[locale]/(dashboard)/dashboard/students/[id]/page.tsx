"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit2,
  Plus,
  Heart,
  Brain,
  MessageCircle,
  Activity,
  Palette,
  Phone,
  Mail,
  Shield,
  Camera,
  FileText,
  Star,
  Calendar,
  User,
  ChevronRight,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

interface DevelopmentDomain {
  domain: string;
  score: number;
  status: string;
  icon: React.ReactNode;
}

interface Milestone {
  id: string;
  title: string;
  domain: string;
  date: string;
  status: "achieved" | "in-progress" | "not-started";
}

interface DailyActivity {
  id: string;
  type: string;
  description: string;
  mood: "happy" | "neutral" | "sad" | "excited" | "calm";
  date: string;
}

interface HealthRecord {
  id: string;
  type: string;
  description: string;
  date: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  type: "artwork" | "photo" | "achievement" | "writing";
  description: string;
  date: string;
}

interface Observation {
  id: string;
  domain: string;
  description: string;
  date: string;
}

interface StudentData {
  id: string;
  studentId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  allergies: string[];
  specialNeeds: string;
  classroom: string;
  enrollmentDate: string;
  medicalNotes: string;
  emergencyContacts: EmergencyContact[];
  developmentDomains: DevelopmentDomain[];
  milestones: Milestone[];
  activities: DailyActivity[];
  healthRecords: HealthRecord[];
  portfolio: PortfolioItem[];
  observations: Observation[];
}

// ─── Initial mock data ──────────────────────────────────────────────────────

const initialStudentData: StudentData = {
  id: "1",
  studentId: "STU2601",
  fullName: "Sara Ahmed",
  firstName: "Sara",
  lastName: "Ahmed",
  dateOfBirth: "2020-03-15",
  gender: "Female",
  nationality: "Egyptian",
  address: "42 Al-Nile Street, Cairo, Egypt",
  allergies: ["Peanuts", "Dust mites"],
  specialNeeds: "None",
  classroom: "Butterflies A",
  enrollmentDate: "2024-09-01",
  medicalNotes: "No significant medical history. Regular checkups on schedule.",
  emergencyContacts: [
    {
      id: "c1",
      name: "Ahmed Hassan",
      relationship: "Father",
      phone: "+20 100 123 4567",
      email: "ahmed.hassan@email.com",
      isPrimary: true,
    },
    {
      id: "c2",
      name: "Fatima Hassan",
      relationship: "Mother",
      phone: "+20 100 765 4321",
      email: "fatima.hassan@email.com",
      isPrimary: false,
    },
  ],
  developmentDomains: [
    { domain: "Cognitive", score: 78, status: "ON_TRACK", icon: <Brain className="h-4 w-4" /> },
    { domain: "Language & Communication", score: 82, status: "ON_TRACK", icon: <MessageCircle className="h-4 w-4" /> },
    { domain: "Social & Emotional", score: 75, status: "ATTENTION", icon: <Heart className="h-4 w-4" /> },
    { domain: "Physical & Motor", score: 88, status: "ADVANCED", icon: <Activity className="h-4 w-4" /> },
    { domain: "Creative Expression", score: 85, status: "ON_TRACK", icon: <Palette className="h-4 w-4" /> },
  ],
  milestones: [
    { id: "m1", title: "Can count to 20", domain: "Cognitive", date: "Jan 2026", status: "achieved" },
    { id: "m2", title: "Speaks in 5-6 word sentences", domain: "Language", date: "Dec 2025", status: "achieved" },
    { id: "m3", title: "Hops on one foot", domain: "Physical", date: "Feb 2026", status: "achieved" },
    { id: "m4", title: "Draws recognizable shapes", domain: "Creative", date: "Feb 2026", status: "achieved" },
    { id: "m5", title: "Shares toys voluntarily", domain: "Social", date: "Jan 2026", status: "in-progress" },
    { id: "m6", title: "Writes own first name", domain: "Language", date: "Mar 2026", status: "not-started" },
  ],
  activities: [
    { id: "a1", type: "Meal", description: "Ate lunch well — rice, chicken, and vegetables", mood: "happy", date: "2026-02-15" },
    { id: "a2", type: "Nap", description: "Nap from 12:30–2:00 PM (1.5 hours)", mood: "calm", date: "2026-02-15" },
    { id: "a3", type: "Art", description: "Painting session — drew a colorful house with garden", mood: "excited", date: "2026-02-15" },
    { id: "a4", type: "Social", description: "Shared toys with classmates during free play", mood: "happy", date: "2026-02-14" },
    { id: "a5", type: "Learning", description: "Counted objects up to 15 during math circle time", mood: "neutral", date: "2026-02-14" },
  ],
  healthRecords: [
    { id: "h1", type: "Vaccination", description: "BCG — completed at birth", date: "2020-03-15" },
    { id: "h2", type: "Vaccination", description: "Hepatitis B (3 doses) — completed", date: "2020-09-15" },
    { id: "h3", type: "Vaccination", description: "DTP (3 doses) — completed", date: "2021-01-20" },
    { id: "h4", type: "Vaccination", description: "MMR — completed", date: "2021-03-20" },
    { id: "h5", type: "Checkup", description: "Annual well-child checkup — all normal", date: "2025-10-01" },
    { id: "h6", type: "Allergy", description: "Peanut allergy confirmed via skin prick test", date: "2023-06-10" },
    { id: "h7", type: "Checkup", description: "Dental checkup — no cavities", date: "2025-12-15" },
  ],
  portfolio: [
    { id: "p1", title: "My Family Portrait", type: "artwork", description: "Colorful painting of family members in the park", date: "2026-02-10" },
    { id: "p2", title: "Building Block Tower", type: "photo", description: "Built a 12-block tower during free play", date: "2026-02-05" },
    { id: "p3", title: "Star Student Award", type: "achievement", description: "Awarded for helping classmates during group activities", date: "2026-01-28" },
    { id: "p4", title: "My Favorite Animal", type: "writing", description: "Short story about cats with illustrations", date: "2026-01-20" },
  ],
  observations: [
    { id: "o1", domain: "Social", description: "Sara showed excellent leadership during group activity, organizing roles for peers.", date: "2026-02-12" },
    { id: "o2", domain: "Language", description: "Used a new vocabulary word 'magnificent' correctly in a sentence.", date: "2026-02-08" },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Page component ─────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, dismiss } = useToast();

  // ── Student state ─────────────────────────────────────────────────────
  const [student, setStudent] = useState<StudentData>(initialStudentData);

  // ── Dialog visibility state ───────────────────────────────────────────
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addObservationOpen, setAddObservationOpen] = useState(false);
  const [addPortfolioOpen, setAddPortfolioOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addHealthOpen, setAddHealthOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);

  // ── Edit Profile form state ───────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    nationality: student.nationality,
    address: student.address,
    allergies: student.allergies.join(", "),
    specialNeeds: student.specialNeeds,
  });

  // ── Observation form ──────────────────────────────────────────────────
  const [obsForm, setObsForm] = useState({ domain: "", description: "", date: new Date().toISOString().slice(0, 10) });

  // ── Portfolio form ────────────────────────────────────────────────────
  const [portfolioForm, setPortfolioForm] = useState({ title: "", type: "artwork" as PortfolioItem["type"], description: "", date: new Date().toISOString().slice(0, 10) });

  // ── Activity form ─────────────────────────────────────────────────────
  const [activityForm, setActivityForm] = useState({ type: "", description: "", mood: "happy" as DailyActivity["mood"], date: new Date().toISOString().slice(0, 10) });

  // ── Health form ───────────────────────────────────────────────────────
  const [healthForm, setHealthForm] = useState({ type: "", description: "", date: new Date().toISOString().slice(0, 10) });

  // ── Contact form ──────────────────────────────────────────────────────
  const [contactForm, setContactForm] = useState({ name: "", relationship: "", phone: "", email: "" });

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleEditProfile = () => {
    const allergiesArr = editForm.allergies.split(",").map((a) => a.trim()).filter(Boolean);
    setStudent((prev) => ({
      ...prev,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      fullName: `${editForm.firstName} ${editForm.lastName}`,
      dateOfBirth: editForm.dateOfBirth,
      gender: editForm.gender,
      nationality: editForm.nationality,
      address: editForm.address,
      allergies: allergiesArr,
      specialNeeds: editForm.specialNeeds,
    }));
    setEditProfileOpen(false);
    success("Profile Updated", `${editForm.firstName} ${editForm.lastName}'s profile has been updated.`);
  };

  const handleAddObservation = () => {
    if (!obsForm.domain || !obsForm.description) return;
    const newObs: Observation = { id: uid(), ...obsForm };
    setStudent((prev) => ({ ...prev, observations: [newObs, ...prev.observations] }));
    setAddObservationOpen(false);
    setObsForm({ domain: "", description: "", date: new Date().toISOString().slice(0, 10) });
    success("Observation Added", `New observation recorded for ${obsForm.domain} domain.`);
  };

  const handleAddPortfolio = () => {
    if (!portfolioForm.title || !portfolioForm.description) return;
    const newItem: PortfolioItem = { id: uid(), ...portfolioForm };
    setStudent((prev) => ({ ...prev, portfolio: [newItem, ...prev.portfolio] }));
    setAddPortfolioOpen(false);
    setPortfolioForm({ title: "", type: "artwork", description: "", date: new Date().toISOString().slice(0, 10) });
    success("Portfolio Item Added", `"${portfolioForm.title}" has been added to the portfolio.`);
  };

  const handleAddActivity = () => {
    if (!activityForm.type || !activityForm.description) return;
    const newAct: DailyActivity = { id: uid(), ...activityForm };
    setStudent((prev) => ({ ...prev, activities: [newAct, ...prev.activities] }));
    setAddActivityOpen(false);
    setActivityForm({ type: "", description: "", mood: "happy", date: new Date().toISOString().slice(0, 10) });
    success("Activity Added", `New ${activityForm.type} activity has been recorded.`);
  };

  const handleAddHealth = () => {
    if (!healthForm.type || !healthForm.description) return;
    const newRec: HealthRecord = { id: uid(), ...healthForm };
    setStudent((prev) => ({ ...prev, healthRecords: [newRec, ...prev.healthRecords] }));
    setAddHealthOpen(false);
    setHealthForm({ type: "", description: "", date: new Date().toISOString().slice(0, 10) });
    success("Health Record Added", `New ${healthForm.type} record has been saved.`);
  };

  const handleAddContact = () => {
    if (!contactForm.name || !contactForm.phone) return;
    const newContact: EmergencyContact = { id: uid(), ...contactForm, isPrimary: false };
    setStudent((prev) => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, newContact] }));
    setAddContactOpen(false);
    setContactForm({ name: "", relationship: "", phone: "", email: "" });
    success("Contact Added", `${contactForm.name} has been added as an emergency contact.`);
  };

  const handleDeleteContact = (contactId: string) => {
    setStudent((prev) => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter((c) => c.id !== contactId) }));
    success("Contact Removed", "Emergency contact has been removed.");
  };

  const handleDeletePortfolioItem = (itemId: string) => {
    setStudent((prev) => ({ ...prev, portfolio: prev.portfolio.filter((p) => p.id !== itemId) }));
    success("Item Removed", "Portfolio item has been removed.");
  };

  const handleDeleteActivity = (activityId: string) => {
    setStudent((prev) => ({ ...prev, activities: prev.activities.filter((a) => a.id !== activityId) }));
    success("Activity Removed", "Activity has been removed.");
  };

  const handleDeleteHealthRecord = (recordId: string) => {
    setStudent((prev) => ({ ...prev, healthRecords: prev.healthRecords.filter((h) => h.id !== recordId) }));
    success("Record Removed", "Health record has been removed.");
  };

  // ── Utility ───────────────────────────────────────────────────────────

  const getAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const totalMonths = years * 12 + months;
    return `${Math.floor(totalMonths / 12)} years ${((totalMonths % 12) + 12) % 12} months`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ON_TRACK": return "bg-success/10 text-success";
      case "ADVANCED": return "bg-primary/10 text-primary";
      case "ATTENTION": return "bg-warning/10 text-warning";
      case "DELAYED": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-success";
    if (score >= 70) return "bg-primary";
    if (score >= 55) return "bg-warning";
    return "bg-destructive";
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy": return "😊";
      case "calm": return "😌";
      case "excited": return "🤩";
      case "sad": return "😢";
      case "neutral": return "😐";
      default: return "😐";
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case "achieved": return "bg-success/10 text-success";
      case "in-progress": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPortfolioIcon = (type: string) => {
    switch (type) {
      case "artwork": return <Palette className="h-5 w-5" />;
      case "photo": return <Camera className="h-5 w-5" />;
      case "achievement": return <Star className="h-5 w-5" />;
      case "writing": return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getHealthIcon = (type: string) => {
    switch (type) {
      case "Vaccination": return <Shield className="h-4 w-4" />;
      case "Allergy": return <AlertTriangle className="h-4 w-4" />;
      case "Checkup": return <Heart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const selectClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const textareaClass =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none";

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${locale}/dashboard/students`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.fullName} size="xl" />
            <div>
              <h1 className="text-2xl font-bold">{student.fullName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="info">{student.studentId}</Badge>
                <Badge variant="outline">{getAge(student.dateOfBirth)}</Badge>
                <Badge variant="outline">{student.classroom}</Badge>
              </div>
            </div>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              setEditForm({
                firstName: student.firstName,
                lastName: student.lastName,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                nationality: student.nationality,
                address: student.address,
                allergies: student.allergies.join(", "),
                specialNeeds: student.specialNeeds,
              });
              setEditProfileOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="development" className="gap-1.5">
            <Brain className="h-4 w-4" /> Development
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-1.5">
            <Activity className="h-4 w-4" /> Activities
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <Heart className="h-4 w-4" /> Health
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Phone className="h-4 w-4" /> Contacts
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5">
            <Star className="h-4 w-4" /> Portfolio
          </TabsTrigger>
        </TabsList>

        {/* ────────────────────────────────────────────────────────────────
            PROFILE TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Student ID", value: student.studentId },
                  { label: "Date of Birth", value: new Date(student.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Gender", value: student.gender },
                  { label: "Nationality", value: student.nationality },
                  { label: "Address", value: student.address },
                  { label: "Classroom", value: student.classroom },
                  { label: "Enrollment Date", value: new Date(student.enrollmentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Special Needs", value: student.specialNeeds || "None" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b pb-2 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Emergency Contacts Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="h-4 w-4 text-primary" /> Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.emergencyContacts.slice(0, 2).map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                      <Avatar name={contact.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      </div>
                      <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Allergies */}
              {student.allergies.length > 0 && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Allergies &amp; Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {student.allergies.map((allergy) => (
                        <Badge key={allergy} variant="destructive">{allergy}</Badge>
                      ))}
                    </div>
                    {student.medicalNotes && (
                      <p className="mt-3 text-sm text-muted-foreground">{student.medicalNotes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Recent Observations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-primary" /> Recent Observations
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddObservationOpen(true)}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.observations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No observations yet.</p>
                  ) : (
                    student.observations.slice(0, 3).map((obs) => (
                      <div key={obs.id} className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{obs.domain}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(obs.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm">{obs.description}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            DEVELOPMENT TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="development">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-2">
            {/* Domain Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-primary" /> Development Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {student.developmentDomains.map((domain, idx) => (
                  <div key={domain.domain} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-1.5 text-primary">{domain.icon}</div>
                        <span className="text-sm font-medium">{domain.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{domain.score}%</span>
                        <Badge className={getStatusColor(domain.status)}>
                          {domain.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${domain.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.15 }}
                        className={`h-full rounded-full ${getProgressColor(domain.score)}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                    <div className={`mt-0.5 rounded-full p-1.5 ${getMilestoneColor(milestone.status)}`}>
                      {milestone.status === "achieved" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : milestone.status === "in-progress" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.domain} — {milestone.date}</p>
                    </div>
                    <Badge
                      variant={milestone.status === "achieved" ? "success" : milestone.status === "in-progress" ? "info" : "outline"}
                    >
                      {milestone.status === "achieved" ? "Achieved" : milestone.status === "in-progress" ? "In Progress" : "Upcoming"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-primary">Strengths</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sara demonstrates strong physical coordination (88%) and creative expression (85%). She shows enthusiasm during art activities and excels in motor-skill tasks.
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-warning">Areas for Improvement</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Social &amp; Emotional development (75%) could benefit from structured group activities. Encourage turn-taking games and collaborative projects to build confidence in peer interactions.
                  </p>
                </div>
                <div className="rounded-xl bg-card p-4">
                  <p className="text-sm font-medium text-success">Recommended Activities</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Partner reading sessions to boost language confidence</li>
                    <li>Cooperative building projects (2-3 children groups)</li>
                    <li>Emotion identification card games during circle time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            ACTIVITIES TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="activities">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" /> Daily Activities
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddActivityOpen(true)}>
                  <Plus className="h-3 w-3" /> Add Activity
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No activities recorded yet.</p>
                ) : (
                  student.activities.map((activity) => (
                    <div key={activity.id} className="group flex items-start gap-3 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted/80">
                      <span className="text-2xl">{getMoodEmoji(activity.mood)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{activity.type}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{activity.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            HEALTH TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="health">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-2">
            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4 text-destructive" /> Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Blood Type</span>
                  <span className="text-sm font-medium">A+</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Allergies</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {student.allergies.map((a) => (
                      <Badge key={a} variant="destructive">{a}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Chronic Conditions</span>
                  <span className="text-sm font-medium">None</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Medical Notes</span>
                  <span className="text-sm">{student.medicalNotes}</span>
                </div>
              </CardContent>
            </Card>

            {/* Health Records */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-primary" /> Health Records
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddHealthOpen(true)}>
                  <Plus className="h-3 w-3" /> Add Record
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.healthRecords.map((record) => (
                  <div key={record.id} className="group flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                        {getHealthIcon(record.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.description}</p>
                        <p className="text-xs text-muted-foreground">{record.type} — {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.type === "Vaccination" ? "success" : record.type === "Allergy" ? "warning" : "info"}>
                        {record.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => handleDeleteHealthRecord(record.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            CONTACTS TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="contacts">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4 text-primary" /> Emergency Contacts
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddContactOpen(true)}>
                  <Plus className="h-3 w-3" /> Add Contact
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.emergencyContacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No emergency contacts added.</p>
                ) : (
                  student.emergencyContacts.map((contact) => (
                    <div key={contact.id} className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30">
                      <Avatar name={contact.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{contact.name}</h3>
                          {contact.isPrimary && <Badge variant="info">Primary</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                          </span>
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Phone className="h-3 w-3" /> Call
                          </Button>
                        </a>
                        {contact.email && (
                          <a href={`mailto:${contact.email}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Mail className="h-3 w-3" /> Email
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ────────────────────────────────────────────────────────────────
            PORTFOLIO TAB
        ──────────────────────────────────────────────────────────────── */}
        <TabsContent value="portfolio">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-primary" /> Digital Portfolio
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddPortfolioOpen(true)}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {student.portfolio.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Star className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold">Digital Portfolio</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Portfolio items will appear here</p>
                    <Button className="mt-4" variant="outline" onClick={() => setAddPortfolioOpen(true)}>
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {student.portfolio.map((item) => (
                      <div key={item.id} className="group relative rounded-xl border p-4 transition-all hover:shadow-md hover:bg-muted/30">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            {getPortfolioIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{item.title}</h4>
                            <Badge variant="outline" className="mt-1 capitalize">{item.type}</Badge>
                            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => handleDeletePortfolioItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Edit Profile Dialog ──────────────────────────────────────────── */}
      <FormDialog
        open={editProfileOpen}
        title="Edit Student Profile"
        description="Update the student's personal information."
        onClose={() => setEditProfileOpen(false)}
        onSubmit={handleEditProfile}
        submitLabel="Save Changes"
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First Name" required>
            <input
              className={inputClass}
              value={editForm.firstName}
              onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
            />
          </FormField>
          <FormField label="Last Name" required>
            <input
              className={inputClass}
              value={editForm.lastName}
              onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
            />
          </FormField>
          <FormField label="Date of Birth" required>
            <input
              type="date"
              className={inputClass}
              value={editForm.dateOfBirth}
              onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
            />
          </FormField>
          <FormField label="Gender" required>
            <select
              className={selectClass}
              value={editForm.gender}
              onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </FormField>
          <FormField label="Nationality">
            <input
              className={inputClass}
              value={editForm.nationality}
              onChange={(e) => setEditForm((p) => ({ ...p, nationality: e.target.value }))}
            />
          </FormField>
          <FormField label="Address">
            <input
              className={inputClass}
              value={editForm.address}
              onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
            />
          </FormField>
          <FormField label="Allergies" required={false}>
            <input
              className={inputClass}
              placeholder="Comma separated, e.g. Peanuts, Dust"
              value={editForm.allergies}
              onChange={(e) => setEditForm((p) => ({ ...p, allergies: e.target.value }))}
            />
          </FormField>
          <FormField label="Special Needs">
            <input
              className={inputClass}
              placeholder="None"
              value={editForm.specialNeeds}
              onChange={(e) => setEditForm((p) => ({ ...p, specialNeeds: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Observation Dialog ───────────────────────────────────────── */}
      <FormDialog
        open={addObservationOpen}
        title="Add Observation"
        description="Record a new observation about the student."
        onClose={() => setAddObservationOpen(false)}
        onSubmit={handleAddObservation}
        submitLabel="Add Observation"
      >
        <div className="space-y-4">
          <FormField label="Development Domain" required>
            <select
              className={selectClass}
              value={obsForm.domain}
              onChange={(e) => setObsForm((p) => ({ ...p, domain: e.target.value }))}
            >
              <option value="">Select domain...</option>
              <option value="Cognitive">Cognitive</option>
              <option value="Language">Language &amp; Communication</option>
              <option value="Social">Social &amp; Emotional</option>
              <option value="Physical">Physical &amp; Motor</option>
              <option value="Creative">Creative Expression</option>
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea
              className={textareaClass}
              placeholder="Describe what you observed..."
              value={obsForm.description}
              onChange={(e) => setObsForm((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              className={inputClass}
              value={obsForm.date}
              onChange={(e) => setObsForm((p) => ({ ...p, date: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Portfolio Dialog ──────────────────────────────────────────── */}
      <FormDialog
        open={addPortfolioOpen}
        title="Add Portfolio Item"
        description="Add a new entry to the student's portfolio."
        onClose={() => setAddPortfolioOpen(false)}
        onSubmit={handleAddPortfolio}
        submitLabel="Add Item"
      >
        <div className="space-y-4">
          <FormField label="Title" required>
            <input
              className={inputClass}
              placeholder="e.g. My Family Portrait"
              value={portfolioForm.title}
              onChange={(e) => setPortfolioForm((p) => ({ ...p, title: e.target.value }))}
            />
          </FormField>
          <FormField label="Type" required>
            <select
              className={selectClass}
              value={portfolioForm.type}
              onChange={(e) => setPortfolioForm((p) => ({ ...p, type: e.target.value as PortfolioItem["type"] }))}
            >
              <option value="artwork">Artwork</option>
              <option value="photo">Photo</option>
              <option value="achievement">Achievement</option>
              <option value="writing">Writing Sample</option>
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea
              className={textareaClass}
              placeholder="Describe the portfolio item..."
              value={portfolioForm.description}
              onChange={(e) => setPortfolioForm((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              className={inputClass}
              value={portfolioForm.date}
              onChange={(e) => setPortfolioForm((p) => ({ ...p, date: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Activity Dialog ──────────────────────────────────────────── */}
      <FormDialog
        open={addActivityOpen}
        title="Add Daily Activity"
        description="Record a new activity for the student."
        onClose={() => setAddActivityOpen(false)}
        onSubmit={handleAddActivity}
        submitLabel="Add Activity"
      >
        <div className="space-y-4">
          <FormField label="Activity Type" required>
            <select
              className={selectClass}
              value={activityForm.type}
              onChange={(e) => setActivityForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="">Select type...</option>
              <option value="Meal">Meal</option>
              <option value="Nap">Nap</option>
              <option value="Art">Art</option>
              <option value="Learning">Learning</option>
              <option value="Social">Social</option>
              <option value="Physical">Physical Activity</option>
              <option value="Behavior">Behavior</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea
              className={textareaClass}
              placeholder="Describe the activity..."
              value={activityForm.description}
              onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Mood">
            <select
              className={selectClass}
              value={activityForm.mood}
              onChange={(e) => setActivityForm((p) => ({ ...p, mood: e.target.value as DailyActivity["mood"] }))}
            >
              <option value="happy">😊 Happy</option>
              <option value="excited">🤩 Excited</option>
              <option value="calm">😌 Calm</option>
              <option value="neutral">😐 Neutral</option>
              <option value="sad">😢 Sad</option>
            </select>
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              className={inputClass}
              value={activityForm.date}
              onChange={(e) => setActivityForm((p) => ({ ...p, date: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Health Record Dialog ─────────────────────────────────────── */}
      <FormDialog
        open={addHealthOpen}
        title="Add Health Record"
        description="Add a new health record entry."
        onClose={() => setAddHealthOpen(false)}
        onSubmit={handleAddHealth}
        submitLabel="Add Record"
      >
        <div className="space-y-4">
          <FormField label="Record Type" required>
            <select
              className={selectClass}
              value={healthForm.type}
              onChange={(e) => setHealthForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="">Select type...</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Checkup">Checkup</option>
              <option value="Allergy">Allergy</option>
              <option value="Illness">Illness</option>
              <option value="Injury">Injury</option>
              <option value="Medication">Medication</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea
              className={textareaClass}
              placeholder="Describe the health record..."
              value={healthForm.description}
              onChange={(e) => setHealthForm((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              className={inputClass}
              value={healthForm.date}
              onChange={(e) => setHealthForm((p) => ({ ...p, date: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Add Contact Dialog ───────────────────────────────────────────── */}
      <FormDialog
        open={addContactOpen}
        title="Add Emergency Contact"
        description="Add a new emergency contact for the student."
        onClose={() => setAddContactOpen(false)}
        onSubmit={handleAddContact}
        submitLabel="Add Contact"
      >
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <input
              className={inputClass}
              placeholder="e.g. John Smith"
              value={contactForm.name}
              onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
            />
          </FormField>
          <FormField label="Relationship" required>
            <select
              className={selectClass}
              value={contactForm.relationship}
              onChange={(e) => setContactForm((p) => ({ ...p, relationship: e.target.value }))}
            >
              <option value="">Select relationship...</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Sibling">Sibling</option>
              <option value="Uncle/Aunt">Uncle/Aunt</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Phone Number" required>
            <input
              type="tel"
              className={inputClass}
              placeholder="+20 100 123 4567"
              value={contactForm.phone}
              onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className={inputClass}
              placeholder="email@example.com"
              value={contactForm.email}
              onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ── Toast container ──────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
