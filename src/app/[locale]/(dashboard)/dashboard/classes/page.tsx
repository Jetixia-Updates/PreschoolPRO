"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Clock,
  MapPin,
  GraduationCap,
  LayoutGrid,
  List,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Classroom {
  id: string;
  name: string;
  program: "ISCED 010" | "ISCED 020";
  leadTeacher: string;
  assistantTeacher: string;
  capacity: number;
  enrolled: number;
  room: string;
  schedule: string;
  ageGroup: string;
  description: string;
}

type ViewMode = "grid" | "list" | "schedule";

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const initialClassrooms: Classroom[] = [
  {
    id: "CLS001",
    name: "Sunshine Room",
    program: "ISCED 010",
    leadTeacher: "Ms. Fatima Ali",
    assistantTeacher: "Ms. Nour Hassan",
    capacity: 20,
    enrolled: 18,
    room: "Room 101",
    schedule: "Sun-Thu 8:00-12:00",
    ageGroup: "2-3 years",
    description: "Early discovery and sensory play focused classroom",
  },
  {
    id: "CLS002",
    name: "Rainbow Class",
    program: "ISCED 020",
    leadTeacher: "Ms. Layla Omar",
    assistantTeacher: "Ms. Dina Mahmoud",
    capacity: 25,
    enrolled: 22,
    room: "Room 102",
    schedule: "Sun-Thu 8:00-13:00",
    ageGroup: "4-5 years",
    description: "Pre-primary preparation with structured learning",
  },
  {
    id: "CLS003",
    name: "Little Stars",
    program: "ISCED 010",
    leadTeacher: "Ms. Hana Al-Mansour",
    assistantTeacher: "Ms. Reem Khaled",
    capacity: 18,
    enrolled: 15,
    room: "Room 103",
    schedule: "Sun-Thu 8:30-12:30",
    ageGroup: "1-2 years",
    description: "Nurturing environment for toddlers with guided exploration",
  },
  {
    id: "CLS004",
    name: "Explorers Hub",
    program: "ISCED 020",
    leadTeacher: "Ms. Sara Al-Otaibi",
    assistantTeacher: "Ms. Dana Youssef",
    capacity: 22,
    enrolled: 20,
    room: "Room 201",
    schedule: "Sun-Thu 7:30-13:30",
    ageGroup: "5-6 years",
    description: "School readiness and advanced pre-primary curriculum",
  },
  {
    id: "CLS005",
    name: "Moonbeam Room",
    program: "ISCED 010",
    leadTeacher: "Ms. Lina Al-Shammari",
    assistantTeacher: "Ms. Haya Tariq",
    capacity: 20,
    enrolled: 16,
    room: "Room 104",
    schedule: "Sun-Thu 8:00-12:00",
    ageGroup: "2-3 years",
    description: "Creative arts and early social skills development",
  },
  {
    id: "CLS006",
    name: "Discovery Den",
    program: "ISCED 020",
    leadTeacher: "Ms. Abeer Al-Dosari",
    assistantTeacher: "Ms. Nouf Ibrahim",
    capacity: 24,
    enrolled: 19,
    room: "Room 202",
    schedule: "Sun-Thu 7:30-13:00",
    ageGroup: "4-5 years",
    description: "STEM-oriented learning with hands-on experiments",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const emptyForm = {
  name: "",
  program: "ISCED 010" as "ISCED 010" | "ISCED 020",
  leadTeacher: "",
  assistantTeacher: "",
  capacity: 20,
  room: "",
  schedule: "Sun-Thu 8:00-12:00",
};

const scheduleBlocks = [
  { time: "7:30 – 8:00", label: "Arrival & Free Play" },
  { time: "8:00 – 8:30", label: "Morning Circle" },
  { time: "8:30 – 9:15", label: "Learning Activity 1" },
  { time: "9:15 – 9:45", label: "Snack Time" },
  { time: "9:45 – 10:30", label: "Outdoor Play" },
  { time: "10:30 – 11:15", label: "Learning Activity 2" },
  { time: "11:15 – 12:00", label: "Lunch" },
  { time: "12:00 – 12:30", label: "Story Time" },
  { time: "12:30 – 13:00", label: "Dismissal Prep" },
  { time: "13:00 – 13:30", label: "Extended Care" },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu"];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ClassesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, error: toastError, dismiss } = useToast();

  // ── Core state ──
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms);
  const [search, setSearch] = useState("");
  const [iscedFilter, setIscedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Add dialog ──
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyForm });

  // ── Edit dialog ──
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Classroom | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });

  // ── Delete dialog ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null);

  // ── Filtered data ──
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.leadTeacher.toLowerCase().includes(search.toLowerCase());
      const matchesISCED =
        iscedFilter === "all" || c.program === iscedFilter;
      return matchesSearch && matchesISCED;
    });
  }, [classrooms, search, iscedFilter]);

  // ── Stats ──
  const totalStudents = classrooms.reduce((sum, c) => sum + c.enrolled, 0);
  const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
  const avgRatio = classrooms.length > 0
    ? `1:${Math.round(totalStudents / (classrooms.length * 2))}`
    : "—";

  // ── CRUD Handlers ──

  function handleAddClassroom() {
    if (!addForm.name.trim() || !addForm.leadTeacher.trim()) {
      toastError("Validation Error", "Name and Lead Teacher are required.");
      return;
    }
    const nextId = `CLS${String(classrooms.length + 1).padStart(3, "0")}`;
    const newClassroom: Classroom = {
      id: nextId,
      name: addForm.name.trim(),
      program: addForm.program,
      leadTeacher: addForm.leadTeacher.trim(),
      assistantTeacher: addForm.assistantTeacher.trim(),
      capacity: addForm.capacity,
      enrolled: 0,
      room: addForm.room.trim(),
      schedule: addForm.schedule.trim(),
      ageGroup: addForm.program === "ISCED 010" ? "2-3 years" : "4-5 years",
      description: "",
    };
    setClassrooms((prev) => [...prev, newClassroom]);
    setAddForm({ ...emptyForm });
    setAddOpen(false);
    success("Classroom Added", `"${newClassroom.name}" has been created successfully.`);
  }

  function openEdit(classroom: Classroom) {
    setEditTarget(classroom);
    setEditForm({
      name: classroom.name,
      program: classroom.program,
      leadTeacher: classroom.leadTeacher,
      assistantTeacher: classroom.assistantTeacher,
      capacity: classroom.capacity,
      room: classroom.room,
      schedule: classroom.schedule,
    });
    setEditOpen(true);
  }

  function handleEditClassroom() {
    if (!editTarget) return;
    if (!editForm.name.trim() || !editForm.leadTeacher.trim()) {
      toastError("Validation Error", "Name and Lead Teacher are required.");
      return;
    }
    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === editTarget.id
          ? {
              ...c,
              name: editForm.name.trim(),
              program: editForm.program,
              leadTeacher: editForm.leadTeacher.trim(),
              assistantTeacher: editForm.assistantTeacher.trim(),
              capacity: editForm.capacity,
              room: editForm.room.trim(),
              schedule: editForm.schedule.trim(),
              ageGroup: editForm.program === "ISCED 010" ? "2-3 years" : "4-5 years",
            }
          : c
      )
    );
    setEditOpen(false);
    setEditTarget(null);
    success("Classroom Updated", `"${editForm.name.trim()}" has been updated successfully.`);
  }

  function openDelete(classroom: Classroom) {
    setDeleteTarget(classroom);
    setDeleteOpen(true);
  }

  function handleDeleteClassroom() {
    if (!deleteTarget) return;
    const deletedName = deleteTarget.name;
    setClassrooms((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
    if (expandedId === deleteTarget.id) setExpandedId(null);
    success("Classroom Deleted", `"${deletedName}" has been removed.`);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Classroom Management</h1>
            <p className="mt-1 text-muted-foreground">
              Manage classrooms, schedules, and teacher assignments
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Classroom
          </Button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Classrooms"
            value={classrooms.length.toString()}
            change="Active classrooms"
            changeType="neutral"
            icon={BookOpen}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title="Total Capacity"
            value={`${totalStudents}/${totalCapacity}`}
            change={`${occupancyRate}% occupied`}
            changeType="neutral"
            icon={Users}
            iconColor="bg-secondary/10 text-secondary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title="Avg Student-Teacher Ratio"
            value={avgRatio}
            change="Within standards"
            changeType="positive"
            icon={GraduationCap}
            iconColor="bg-success/10 text-success"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            change={`${totalCapacity - totalStudents} spots available`}
            changeType="neutral"
            icon={MapPin}
            iconColor="bg-accent/10 text-accent"
          />
        </motion.div>
      </div>

      {/* ── Filters & View Toggle ── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search classrooms..."
                icon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={iscedFilter} onValueChange={setIscedFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="ISCED 010">Early Childhood (010)</SelectItem>
                <SelectItem value="ISCED 020">Pre-Primary (020)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 rounded-xl border-2 border-input p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-1.5"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === "schedule" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("schedule")}
                className="gap-1.5"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Content Views ── */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredClassrooms.map((classroom, i) => (
              <GridCard
                key={classroom.id}
                classroom={classroom}
                index={i}
                expandedId={expandedId}
                onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
            {filteredClassrooms.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No classrooms found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Classroom
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Program
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Lead Teacher
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Room
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Students
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClassrooms.map((c) => {
                      const pct = Math.round((c.enrolled / c.capacity) * 100);
                      return (
                        <tr
                          key={c.id}
                          className="border-b last:border-0 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={c.program === "ISCED 010" ? "info" : "secondary"}
                            >
                              {c.program}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{c.leadTeacher}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {c.room}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20">
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      pct >= 95
                                        ? "bg-destructive"
                                        : pct >= 80
                                          ? "bg-warning"
                                          : "bg-success"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {c.enrolled}/{c.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-xs">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {c.schedule}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(c)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => openDelete(c)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredClassrooms.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          No classrooms found. Try adjusting your search or filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {viewMode === "schedule" && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Weekly Schedule Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 bg-card border-b border-r px-3 py-2 text-left text-xs font-medium text-muted-foreground w-32">
                          Time
                        </th>
                        {weekDays.map((day) => (
                          <th
                            key={day}
                            className="border-b px-3 py-2 text-center text-xs font-medium text-muted-foreground min-w-[120px]"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleBlocks.map((block, bi) => (
                        <tr key={bi} className="hover:bg-muted/30 transition-colors">
                          <td className="sticky left-0 z-10 bg-card border-r px-3 py-2.5 font-mono text-xs font-medium text-primary whitespace-nowrap">
                            {block.time}
                          </td>
                          {weekDays.map((day) => {
                            // Show classrooms active during this block
                            const active = filteredClassrooms.filter((c) =>
                              c.schedule.toLowerCase().includes(day.toLowerCase())
                            );
                            return (
                              <td
                                key={day}
                                className="border-b px-1.5 py-1.5 align-top"
                              >
                                <div className="flex flex-col gap-1">
                                  {active.length > 0 ? (
                                    active.slice(0, 2).map((c) => (
                                      <div
                                        key={c.id}
                                        className={`rounded-lg px-2 py-1 text-[10px] font-medium leading-tight truncate ${
                                          c.program === "ISCED 010"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}
                                        title={`${c.name} – ${block.label}`}
                                      >
                                        {c.name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="h-6" />
                                  )}
                                  {active.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground text-center">
                                      +{active.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-blue-100 border border-blue-200" />
                    ISCED 010
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded bg-purple-100 border border-purple-200" />
                    ISCED 020
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Classroom Dialog ── */}
      <FormDialog
        open={addOpen}
        title="Add New Classroom"
        description="Create a new classroom with teacher and schedule details."
        onClose={() => {
          setAddOpen(false);
          setAddForm({ ...emptyForm });
        }}
        onSubmit={handleAddClassroom}
        submitLabel="Create Classroom"
        size="lg"
      >
        <ClassroomForm
          form={addForm}
          onChange={(updates) => setAddForm((prev) => ({ ...prev, ...updates }))}
        />
      </FormDialog>

      {/* ── Edit Classroom Dialog ── */}
      <FormDialog
        open={editOpen}
        title="Edit Classroom"
        description={editTarget ? `Editing "${editTarget.name}"` : ""}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        onSubmit={handleEditClassroom}
        submitLabel="Save Changes"
        size="lg"
      >
        <ClassroomForm
          form={editForm}
          onChange={(updates) => setEditForm((prev) => ({ ...prev, ...updates }))}
        />
      </FormDialog>

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Classroom"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone. All associated data will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteClassroom}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
      />

      {/* ── Toast Notifications ── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}

// ─── Classroom Form (shared between Add & Edit) ──────────────────────────────

interface ClassroomFormProps {
  form: {
    name: string;
    program: "ISCED 010" | "ISCED 020";
    leadTeacher: string;
    assistantTeacher: string;
    capacity: number;
    room: string;
    schedule: string;
  };
  onChange: (updates: Partial<ClassroomFormProps["form"]>) => void;
}

function ClassroomForm({ form, onChange }: ClassroomFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Classroom Name" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Sunshine Room"
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Program (ISCED Level)" required>
        <select
          value={form.program}
          onChange={(e) =>
            onChange({ program: e.target.value as "ISCED 010" | "ISCED 020" })
          }
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        >
          <option value="ISCED 010">ISCED 010 – Early Childhood</option>
          <option value="ISCED 020">ISCED 020 – Pre-Primary</option>
        </select>
      </FormField>

      <FormField label="Lead Teacher" required>
        <input
          type="text"
          value={form.leadTeacher}
          onChange={(e) => onChange({ leadTeacher: e.target.value })}
          placeholder="e.g. Ms. Fatima Ali"
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Assistant Teacher">
        <input
          type="text"
          value={form.assistantTeacher}
          onChange={(e) => onChange({ assistantTeacher: e.target.value })}
          placeholder="e.g. Ms. Nour Hassan"
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Capacity" required>
        <input
          type="number"
          min={1}
          max={50}
          value={form.capacity}
          onChange={(e) => onChange({ capacity: parseInt(e.target.value) || 1 })}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Room">
        <input
          type="text"
          value={form.room}
          onChange={(e) => onChange({ room: e.target.value })}
          placeholder="e.g. Room 101"
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
        />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Schedule">
          <input
            type="text"
            value={form.schedule}
            onChange={(e) => onChange({ schedule: e.target.value })}
            placeholder="e.g. Sun-Thu 8:00-12:00"
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none"
          />
        </FormField>
      </div>
    </div>
  );
}

// ─── Grid Card Component ──────────────────────────────────────────────────────

interface GridCardProps {
  classroom: Classroom;
  index: number;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (classroom: Classroom) => void;
  onDelete: (classroom: Classroom) => void;
}

function GridCard({
  classroom,
  index,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
}: GridCardProps) {
  const occupancy = Math.round(
    (classroom.enrolled / classroom.capacity) * 100
  );
  const isExpanded = expandedId === classroom.id;
  const colorClass =
    classroom.program === "ISCED 010" ? "bg-blue-500" : "bg-purple-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.05 }}
    >
      <Card className="h-full transition-all hover:shadow-lg">
        <CardContent className="p-5">
          {/* Top row: avatar + name + actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-11 w-11 rounded-xl ${colorClass} flex items-center justify-center text-white font-bold text-xs shrink-0`}
              >
                {classroom.room.replace("Room ", "")}
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{classroom.name}</h3>
                <Badge
                  variant={
                    classroom.program === "ISCED 010" ? "info" : "secondary"
                  }
                  className="mt-1"
                >
                  {classroom.program}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(classroom);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(classroom);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{classroom.leadTeacher}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{classroom.assistantTeacher}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{classroom.schedule}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{classroom.room}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Students: {classroom.enrolled}/{classroom.capacity}
              </span>
              <span className="text-xs font-semibold">
                {occupancy}% full
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancy}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                className={`h-full rounded-full ${
                  occupancy >= 95
                    ? "bg-destructive"
                    : occupancy >= 80
                      ? "bg-warning"
                      : "bg-success"
                }`}
              />
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => onToggleExpand(classroom.id)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isExpanded ? (
              <>
                Hide Details <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                View Details <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* Expanded details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 rounded-xl bg-muted/50 p-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Age Group
                    </span>
                    <p className="mt-0.5 font-medium">{classroom.ageGroup}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Description
                    </span>
                    <p className="mt-0.5">
                      {classroom.description || "No description provided."}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Classroom ID
                    </span>
                    <p className="mt-0.5 font-mono text-xs">{classroom.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg bg-background p-2.5 text-center">
                      <p className="text-lg font-bold text-primary">
                        {classroom.enrolled}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Enrolled
                      </p>
                    </div>
                    <div className="rounded-lg bg-background p-2.5 text-center">
                      <p className="text-lg font-bold text-primary">
                        {classroom.capacity - classroom.enrolled}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Available
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
