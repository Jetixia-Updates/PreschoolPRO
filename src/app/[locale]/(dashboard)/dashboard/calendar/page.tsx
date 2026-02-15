"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useParentChildren } from "@/hooks/use-parent-children";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Edit2,
  Trash2,
  Filter,
  Eye,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type EventCategory =
  | "holiday"
  | "meeting"
  | "event"
  | "field-trip"
  | "assessment";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  description: string;
  color: string;
}

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  description: string;
  color: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; bg: string; ring: string; dot: string }
> = {
  meeting: {
    label: "Meeting",
    color: "text-blue-700",
    bg: "bg-blue-100",
    ring: "ring-blue-300",
    dot: "bg-blue-500",
  },
  event: {
    label: "Event",
    color: "text-green-700",
    bg: "bg-green-100",
    ring: "ring-green-300",
    dot: "bg-green-500",
  },
  holiday: {
    label: "Holiday",
    color: "text-red-700",
    bg: "bg-red-100",
    ring: "ring-red-300",
    dot: "bg-red-500",
  },
  "field-trip": {
    label: "Field Trip",
    color: "text-amber-700",
    bg: "bg-amber-100",
    ring: "ring-amber-300",
    dot: "bg-amber-500",
  },
  assessment: {
    label: "Assessment",
    color: "text-purple-700",
    bg: "bg-purple-100",
    ring: "ring-purple-300",
    dot: "bg-purple-500",
  },
};

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#22c55e", label: "Green" },
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Orange" },
];

const CATEGORY_COLORS: Record<EventCategory, string> = {
  meeting: "#3b82f6",
  event: "#22c55e",
  holiday: "#ef4444",
  "field-trip": "#f59e0b",
  assessment: "#a855f7",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${pad(m)} ${ampm}`;
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Initial Mock Events ────────────────────────────────────────────────────

function createInitialEvents(): CalendarEvent[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const nextM = m === 11 ? 0 : m + 1;
  const nextY = m === 11 ? y + 1 : y;

  return [
    {
      id: generateId(),
      title: "Parent-Teacher Conference",
      date: toDateStr(y, m, 5),
      startTime: "09:00",
      endTime: "12:00",
      location: "School Main Hall",
      category: "meeting",
      description:
        "Annual parent-teacher conference to discuss student progress and upcoming curriculum changes.",
      color: CATEGORY_COLORS.meeting,
    },
    {
      id: generateId(),
      title: "Field Trip to Science Museum",
      date: toDateStr(y, m, 10),
      startTime: "08:00",
      endTime: "15:00",
      location: "National Science Museum",
      category: "field-trip",
      description:
        "Full-day field trip for grades 3-5 to the science museum. Permission slips required.",
      color: CATEGORY_COLORS["field-trip"],
    },
    {
      id: generateId(),
      title: "Staff Development Day",
      date: toDateStr(y, m, 14),
      startTime: "08:30",
      endTime: "16:00",
      location: "Conference Room A",
      category: "meeting",
      description:
        "Professional development workshop focusing on digital learning tools and new teaching methodologies.",
      color: CATEGORY_COLORS.meeting,
    },
    {
      id: generateId(),
      title: "Holiday - National Day",
      date: toDateStr(y, m, 18),
      startTime: "00:00",
      endTime: "23:59",
      location: "",
      category: "holiday",
      description: "School closed for National Day celebrations.",
      color: CATEGORY_COLORS.holiday,
    },
    {
      id: generateId(),
      title: "Assessment Week",
      date: toDateStr(y, m, 22),
      startTime: "08:00",
      endTime: "14:00",
      location: "All Classrooms",
      category: "assessment",
      description:
        "Mid-term assessment week for all grades. Review schedules posted on bulletin boards.",
      color: CATEGORY_COLORS.assessment,
    },
    {
      id: generateId(),
      title: "Sports Day",
      date: toDateStr(y, m, 26),
      startTime: "07:30",
      endTime: "13:00",
      location: "School Sports Field",
      category: "event",
      description:
        "Annual sports day with inter-class competitions, races, and team events.",
      color: CATEGORY_COLORS.event,
    },
    {
      id: generateId(),
      title: "Art Exhibition",
      date: toDateStr(nextY, nextM, 3),
      startTime: "10:00",
      endTime: "16:00",
      location: "Art Gallery Hall",
      category: "event",
      description:
        "Student art exhibition showcasing works from all grade levels. Parents welcome.",
      color: CATEGORY_COLORS.event,
    },
    {
      id: generateId(),
      title: "Graduation Ceremony",
      date: toDateStr(nextY, nextM, 12),
      startTime: "17:00",
      endTime: "20:00",
      location: "Main Auditorium",
      category: "event",
      description:
        "End-of-year graduation ceremony for graduating class. Formal attire required.",
      color: CATEGORY_COLORS.event,
    },
    {
      id: generateId(),
      title: "Monthly Staff Meeting",
      date: toDateStr(nextY, nextM, 7),
      startTime: "14:00",
      endTime: "15:30",
      location: "Meeting Room B",
      category: "meeting",
      description:
        "Monthly staff meeting to review progress, discuss upcoming events, and address concerns.",
      color: CATEGORY_COLORS.meeting,
    },
    {
      id: generateId(),
      title: "First Day of Term",
      date: toDateStr(nextY, nextM, 20),
      startTime: "07:00",
      endTime: "14:00",
      location: "School Campus",
      category: "event",
      description:
        "First day of the new term. Orientation for new students in the morning.",
      color: CATEGORY_COLORS.event,
    },
  ];
}

// ─── Empty Form ─────────────────────────────────────────────────────────────

const EMPTY_FORM: EventFormData = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  category: "event",
  description: "",
  color: CATEGORY_COLORS.event,
};

// ═══════════════════════════════════════════════════════════════════════════
//  CalendarPage Component
// ═══════════════════════════════════════════════════════════════════════════

export default function CalendarPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const toast = useToast();

  // ── Date state ──────────────────────────────────────────────────────────
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // ── Events state ────────────────────────────────────────────────────────
  const [events, setEvents] = useState<CalendarEvent[]>(createInitialEvents);

  // ── Parent view: only events relevant to parents (exclude staff-only) ─────
  const { isParentView } = useParentChildren();
  const eventsForView = useMemo(() => {
    if (!isParentView) return events;
    return events.filter(
      (e) =>
        !/staff\s+development|monthly\s+staff\s+meeting/i.test(e.title)
    );
  }, [isParentView, events]);

  // ── Dialog state ────────────────────────────────────────────────────────
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [formData, setFormData] = useState<EventFormData>({ ...EMPTY_FORM });

  // ── Filter state ────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<EventCategory | "all">(
    "all"
  );
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // ── Calendar helpers ────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const getEventsForDay = useCallback(
    (day: number) => {
      const dateStr = toDateStr(viewYear, viewMonth, day);
      return eventsForView.filter((e) => {
        if (activeFilter !== "all" && e.category !== activeFilter) return false;
        return e.date === dateStr;
      });
    },
    [eventsForView, viewMonth, viewYear, activeFilter]
  );

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return eventsForView;
    return eventsForView.filter((e) => e.category === activeFilter);
  }, [eventsForView, activeFilter]);

  const upcomingEvents = useMemo(() => {
    const todayStr = toDateStr(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return filteredEvents
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 8);
  }, [filteredEvents, today]);

  // ── Navigation ──────────────────────────────────────────────────────────
  const goToPrevMonth = () => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // ── Form helpers ────────────────────────────────────────────────────────
  const updateForm = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-set color when category changes
      if (field === "category" && value in CATEGORY_COLORS) {
        next.color = CATEGORY_COLORS[value as EventCategory];
      }
      return next;
    });
  };

  // ── Add Event ───────────────────────────────────────────────────────────
  const openAddDialog = (prefillDate?: string) => {
    setFormData({
      ...EMPTY_FORM,
      date: prefillDate || toDateStr(viewYear, viewMonth, 1),
    });
    setAddDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!formData.title.trim()) {
      toast.warning("Validation", "Please enter an event title.");
      return;
    }
    if (!formData.date) {
      toast.warning("Validation", "Please select a date.");
      return;
    }

    const newEvent: CalendarEvent = {
      id: generateId(),
      ...formData,
    };
    setEvents((prev) => [...prev, newEvent]);
    setAddDialogOpen(false);
    toast.success("Event Added", `"${newEvent.title}" has been added to the calendar.`);
  };

  // ── View Event ──────────────────────────────────────────────────────────
  const openViewDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setViewDialogOpen(true);
  };

  // ── Edit Event ──────────────────────────────────────────────────────────
  const openEditDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      category: event.category,
      description: event.description,
      color: event.color,
    });
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    if (!formData.title.trim()) {
      toast.warning("Validation", "Please enter an event title.");
      return;
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id ? { ...e, ...formData } : e
      )
    );
    setEditDialogOpen(false);
    setSelectedEvent(null);
    toast.success("Event Updated", `"${formData.title}" has been updated.`);
  };

  // ── Delete Event ────────────────────────────────────────────────────────
  const openDeleteDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setViewDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    const title = selectedEvent.title;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
    toast.success("Event Deleted", `"${title}" has been removed from the calendar.`);
  };

  // ── Click a date cell ──────────────────────────────────────────────────
  const handleDateClick = (day: number) => {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    openAddDialog(dateStr);
  };

  // ── Click an event chip ────────────────────────────────────────────────
  const handleEventChipClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    openViewDialog(event);
  };

  // ── Form fields JSX (shared by add/edit) ──────────────────────────────
  const renderEventForm = () => {
    const inputClass =
      "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
    return (
      <div className="space-y-4">
        <FormField label="Title" required>
          <input
            type="text"
            className={inputClass}
            placeholder="Event title"
            value={formData.title}
            onChange={(e) => updateForm("title", e.target.value)}
          />
        </FormField>

        <FormField label="Date" required>
          <input
            type="date"
            className={inputClass}
            value={formData.date}
            onChange={(e) => updateForm("date", e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Time">
            <input
              type="time"
              className={inputClass}
              value={formData.startTime}
              onChange={(e) => updateForm("startTime", e.target.value)}
            />
          </FormField>
          <FormField label="End Time">
            <input
              type="time"
              className={inputClass}
              value={formData.endTime}
              onChange={(e) => updateForm("endTime", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Location">
          <input
            type="text"
            className={inputClass}
            placeholder="Event location"
            value={formData.location}
            onChange={(e) => updateForm("location", e.target.value)}
          />
        </FormField>

        <FormField label="Category" required>
          <select
            className={inputClass}
            value={formData.category}
            onChange={(e) =>
              updateForm("category", e.target.value)
            }
          >
            {(
              Object.entries(CATEGORY_CONFIG) as [EventCategory, (typeof CATEGORY_CONFIG)[EventCategory]][]
            ).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Color">
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => updateForm("color", c.value)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  formData.color === c.value
                    ? "border-gray-900 scale-110 shadow-md"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Description">
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            placeholder="Event description"
            value={formData.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows={3}
          />
        </FormField>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Render
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="mt-1 text-muted-foreground">
              Manage events and schedules
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setFilterMenuOpen((v) => !v)}
              >
                <Filter className="h-4 w-4" />
                {activeFilter === "all"
                  ? "All Categories"
                  : CATEGORY_CONFIG[activeFilter].label}
              </Button>
              {filterMenuOpen && (
                <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-xl border bg-white shadow-lg py-1 animate-fade-in">
                  <button
                    onClick={() => {
                      setActiveFilter("all");
                      setFilterMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                      activeFilter === "all" ? "font-semibold text-primary" : ""
                    }`}
                  >
                    All Categories
                  </button>
                  {(
                    Object.entries(CATEGORY_CONFIG) as [
                      EventCategory,
                      (typeof CATEGORY_CONFIG)[EventCategory],
                    ][]
                  ).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveFilter(key);
                        setFilterMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        activeFilter === key
                          ? "font-semibold text-primary"
                          : ""
                      }`}
                    >
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`}
                      />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" className="gap-2" onClick={() => openAddDialog()}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-bold">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h2>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day names header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday =
                    day === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();

                  return (
                    <motion.div
                      key={`${viewMonth}-${viewYear}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.008 }}
                      onClick={() => day && handleDateClick(day)}
                      className={`min-h-[80px] rounded-xl border p-1.5 transition-all ${
                        day
                          ? "cursor-pointer hover:bg-muted/50 hover:shadow-sm"
                          : "border-transparent"
                      } ${
                        isToday
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : ""
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-xs font-medium ${
                              isToday
                                ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                onClick={(e) =>
                                  handleEventChipClick(e, event)
                                }
                                className="truncate rounded px-1 py-0.5 text-[9px] font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: event.color }}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{dayEvents.length - 2} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming events
                  </p>
                )}
                {upcomingEvents.map((event, i) => {
                  const d = new Date(event.date + "T00:00:00");
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-start gap-3 rounded-xl p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openViewDialog(event)}
                    >
                      <div className="flex flex-col items-center rounded-lg bg-primary/10 px-2 py-1.5 min-w-[40px]">
                        <span className="text-sm font-bold text-primary">
                          {d.getDate()}
                        </span>
                        <span className="text-[9px] text-primary">
                          {MONTH_NAMES[d.getMonth()].substring(0, 3)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {event.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            {formatTime(event.startTime)}
                            {event.endTime
                              ? ` - ${formatTime(event.endTime)}`
                              : ""}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      <div
                        className="h-2.5 w-2.5 mt-2 rounded-full shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories Legend */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4 text-primary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(
                  Object.entries(CATEGORY_CONFIG) as [
                    EventCategory,
                    (typeof CATEGORY_CONFIG)[EventCategory],
                  ][]
                ).map(([key, cfg]) => {
                  const count = eventsForView.filter(
                    (e) => e.category === key
                  ).length;
                  const isActive = activeFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setActiveFilter((prev) =>
                          prev === key ? "all" : key
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl p-2.5 transition-all text-left ${
                        isActive
                          ? `${cfg.bg} ring-1 ${cfg.ring}`
                          : "hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${cfg.dot}`}
                      />
                      <span className="text-sm font-medium flex-1">
                        {cfg.label}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </button>
                  );
                })}
                {activeFilter !== "all" && (
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="w-full text-center text-xs text-primary hover:underline pt-1"
                  >
                    Clear filter
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          Dialogs
         ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Add Event Dialog ──────────────────────────────────────────── */}
      <FormDialog
        open={addDialogOpen}
        title="Add New Event"
        description="Fill in the details to create a new calendar event."
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddEvent}
        submitLabel="Add Event"
        size="lg"
      >
        {renderEventForm()}
      </FormDialog>

      {/* ── Edit Event Dialog ─────────────────────────────────────────── */}
      <FormDialog
        open={editDialogOpen}
        title="Edit Event"
        description="Update the event details below."
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleEditEvent}
        submitLabel="Save Changes"
        size="lg"
      >
        {renderEventForm()}
      </FormDialog>

      {/* ── View Event Dialog ─────────────────────────────────────────── */}
      <FormDialog
        open={viewDialogOpen}
        title="Event Details"
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={() => {
          if (selectedEvent) openEditDialog(selectedEvent);
        }}
        submitLabel="Edit"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {/* Event title with color bar */}
            <div className="flex items-start gap-3">
              <div
                className="mt-1 h-10 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedEvent.color }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.title}
                </h3>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      CATEGORY_CONFIG[selectedEvent.category].bg
                    } ${CATEGORY_CONFIG[selectedEvent.category].color}`}
                  >
                    {CATEGORY_CONFIG[selectedEvent.category].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">
                  {formatDate(selectedEvent.date)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">
                  {formatTime(selectedEvent.startTime)}
                  {selectedEvent.endTime
                    ? ` – ${formatTime(selectedEvent.endTime)}`
                    : ""}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700">
                    {selectedEvent.location}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => openEditDialog(selectedEvent)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => openDeleteDialog(selectedEvent)}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ── Delete Confirmation ───────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* ── Toasts ────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </div>
  );
}
