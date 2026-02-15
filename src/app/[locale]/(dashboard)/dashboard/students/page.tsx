"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useParentChildren } from "@/hooks/use-parent-children";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Users,
  GraduationCap,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  iscedLevel: string;
  classroom: string;
  allergies: string;
  specialNeeds: string;
  nationality: string;
  address: string;
}

// ---------------------------------------------------------------------------
// Initial mock data (12 students)
// ---------------------------------------------------------------------------
const initialStudents: Student[] = [
  { id: "STU001", firstName: "Sara", lastName: "Ahmed", dateOfBirth: "2020-03-15", gender: "Female", iscedLevel: "ISCED 010", classroom: "Sunshine Room", allergies: "None", specialNeeds: "", nationality: "Egyptian", address: "123 Nile St, Cairo" },
  { id: "STU002", firstName: "Omar", lastName: "Hassan", dateOfBirth: "2019-08-22", gender: "Male", iscedLevel: "ISCED 020", classroom: "Rainbow Class", allergies: "Peanuts", specialNeeds: "", nationality: "Egyptian", address: "45 Pyramid Ave" },
  { id: "STU003", firstName: "Layla", lastName: "Mohammed", dateOfBirth: "2020-11-10", gender: "Female", iscedLevel: "ISCED 010", classroom: "Sunshine Room", allergies: "None", specialNeeds: "Speech therapy", nationality: "Jordanian", address: "78 Amman Rd" },
  { id: "STU004", firstName: "Youssef", lastName: "Ali", dateOfBirth: "2019-05-04", gender: "Male", iscedLevel: "ISCED 020", classroom: "Rainbow Class", allergies: "Dairy", specialNeeds: "", nationality: "Egyptian", address: "12 Sphinx St, Giza" },
  { id: "STU005", firstName: "Noor", lastName: "Khalil", dateOfBirth: "2021-01-28", gender: "Female", iscedLevel: "ISCED 010", classroom: "Butterfly Room", allergies: "None", specialNeeds: "", nationality: "Lebanese", address: "56 Cedar Ln, Beirut" },
  { id: "STU006", firstName: "Adam", lastName: "Ibrahim", dateOfBirth: "2019-09-17", gender: "Male", iscedLevel: "ISCED 020", classroom: "Star Class", allergies: "Gluten", specialNeeds: "", nationality: "Sudanese", address: "34 Khartoum Ave" },
  { id: "STU007", firstName: "Fatima", lastName: "Saeed", dateOfBirth: "2020-07-06", gender: "Female", iscedLevel: "ISCED 010", classroom: "Butterfly Room", allergies: "None", specialNeeds: "", nationality: "Emirati", address: "99 Palm Jumeirah" },
  { id: "STU008", firstName: "Zain", lastName: "Mahmoud", dateOfBirth: "2019-12-20", gender: "Male", iscedLevel: "ISCED 020", classroom: "Star Class", allergies: "None", specialNeeds: "Occupational therapy", nationality: "Palestinian", address: "21 Olive St" },
  { id: "STU009", firstName: "Hana", lastName: "Barakat", dateOfBirth: "2021-04-12", gender: "Female", iscedLevel: "ISCED 010", classroom: "Sunshine Room", allergies: "Eggs", specialNeeds: "", nationality: "Syrian", address: "88 Damascus Rd" },
  { id: "STU010", firstName: "Kareem", lastName: "Nasser", dateOfBirth: "2020-02-09", gender: "Male", iscedLevel: "ISCED 020", classroom: "Rainbow Class", allergies: "None", specialNeeds: "", nationality: "Iraqi", address: "15 Baghdad Blvd" },
  { id: "STU011", firstName: "Mira", lastName: "Taha", dateOfBirth: "2021-06-25", gender: "Female", iscedLevel: "ISCED 010", classroom: "Butterfly Room", allergies: "None", specialNeeds: "", nationality: "Tunisian", address: "42 Tunis Ave" },
  { id: "STU012", firstName: "Rami", lastName: "Othman", dateOfBirth: "2019-10-30", gender: "Male", iscedLevel: "ISCED 020", classroom: "Star Class", allergies: "Shellfish", specialNeeds: "", nationality: "Moroccan", address: "7 Casablanca St" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ITEMS_PER_PAGE = 6;

const getAge = (dob: string): string => {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 12) return `${totalMonths}m`;
  return `${Math.floor(totalMonths / 12)}y ${totalMonths % 12}m`;
};

const getInitials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const emptyForm = (): Omit<Student, "id"> => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "Male",
  iscedLevel: "ISCED 010",
  classroom: "",
  allergies: "",
  specialNeeds: "",
  nationality: "",
  address: "",
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function StudentsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { isParentView, isMyChild } = useParentChildren();

  const { toasts, success, dismiss } = useToast();

  // ---- Core state ----
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [iscedFilter, setIscedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Dialog state ----
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<Omit<Student, "id">>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // ---- Parent view: only their children (shown as "My Children") ----
  const studentsForView = useMemo(
    () =>
      isParentView
        ? students.filter((s) => isMyChild(`${s.firstName} ${s.lastName}`))
        : students,
    [students, isParentView, isMyChild]
  );

  // ---- Derived data (search/filter on view list) ----
  const filteredStudents = useMemo(() => {
    return studentsForView.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase());
      const matchesISCED =
        iscedFilter === "all" || s.iscedLevel === iscedFilter;
      return matchesSearch && matchesISCED;
    });
  }, [studentsForView, search, iscedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleIscedFilter = (val: string) => {
    setIscedFilter(val);
    setCurrentPage(1);
  };

  // ---- Form helpers ----
  const updateForm = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ---- CRUD actions ----
  const handleAdd = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    const nextId = `STU${String(students.length + 1).padStart(3, "0")}`;
    const newStudent: Student = { id: nextId, ...form };
    setStudents((prev) => [...prev, newStudent]);
    setAddOpen(false);
    setForm(emptyForm());
    success("Student Added", `${newStudent.firstName} ${newStudent.lastName} has been enrolled.`);
  };

  const openEdit = (student: Student) => {
    setEditingId(student.id);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      iscedLevel: student.iscedLevel,
      classroom: student.classroom,
      allergies: student.allergies,
      specialNeeds: student.specialNeeds,
      nationality: student.nationality,
      address: student.address,
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingId || !form.firstName.trim() || !form.lastName.trim()) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
    );
    setEditOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    success("Student Updated", `${form.firstName} ${form.lastName}'s record has been updated.`);
  };

  const openDelete = (student: Student) => {
    setDeletingStudent(student);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deletingStudent) return;
    setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
    setDeleteOpen(false);
    success("Student Removed", `${deletingStudent.firstName} ${deletingStudent.lastName} has been removed.`);
    setDeletingStudent(null);
  };

  const handleExport = () => {
    const headers = ["ID", "First Name", "Last Name", "Date of Birth", "Gender", "ISCED Level", "Classroom", "Allergies", "Special Needs", "Nationality", "Address"];
    const rows = students.map((s) =>
      [s.id, s.firstName, s.lastName, s.dateOfBirth, s.gender, s.iscedLevel, s.classroom, s.allergies, s.specialNeeds, s.nationality, s.address]
        .map((v) => `"${v}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students_export.csv";
    link.click();
    URL.revokeObjectURL(url);
    success("Export Complete", `${students.length} student records exported as CSV.`);
  };

  // ---- ISCED badge color ----
  const iscedBadge = (level: string) => {
    if (level === "ISCED 010")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-purple-100 text-purple-700 border border-purple-200";
  };

  // ---- Shared form fields JSX ----
  const renderFormFields = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="First Name" required>
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.firstName}
          onChange={(e) => updateForm("firstName", e.target.value)}
          placeholder="Enter first name"
        />
      </FormField>
      <FormField label="Last Name" required>
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.lastName}
          onChange={(e) => updateForm("lastName", e.target.value)}
          placeholder="Enter last name"
        />
      </FormField>
      <FormField label="Date of Birth" required>
        <input
          type="date"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.dateOfBirth}
          onChange={(e) => updateForm("dateOfBirth", e.target.value)}
        />
      </FormField>
      <FormField label="Gender" required>
        <select
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white"
          value={form.gender}
          onChange={(e) => updateForm("gender", e.target.value)}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </FormField>
      <FormField label="ISCED Level" required>
        <select
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white"
          value={form.iscedLevel}
          onChange={(e) => updateForm("iscedLevel", e.target.value)}
        >
          <option value="ISCED 010">ISCED 010 – Early Childhood</option>
          <option value="ISCED 020">ISCED 020 – Pre-Primary</option>
        </select>
      </FormField>
      <FormField label="Classroom" required>
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.classroom}
          onChange={(e) => updateForm("classroom", e.target.value)}
          placeholder="e.g. Sunshine Room"
        />
      </FormField>
      <FormField label="Allergies">
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.allergies}
          onChange={(e) => updateForm("allergies", e.target.value)}
          placeholder="e.g. Peanuts, Dairy"
        />
      </FormField>
      <FormField label="Special Needs">
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.specialNeeds}
          onChange={(e) => updateForm("specialNeeds", e.target.value)}
          placeholder="e.g. Speech therapy"
        />
      </FormField>
      <FormField label="Nationality">
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.nationality}
          onChange={(e) => updateForm("nationality", e.target.value)}
          placeholder="e.g. Egyptian"
        />
      </FormField>
      <FormField label="Address">
        <input
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
          value={form.address}
          onChange={(e) => updateForm("address", e.target.value)}
          placeholder="e.g. 123 Nile St, Cairo"
        />
      </FormField>
    </div>
  );

  // ---- Pagination range display ----
  const startItem = filteredStudents.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(safePage * ITEMS_PER_PAGE, filteredStudents.length);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-8">
      {/* ===== Page Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isParentView ? "My Children" : "Student Management"}</h1>
            <p className="text-sm text-gray-500">
              {isParentView
                ? "View your child's profile and details"
                : "Manage all student profiles and enrollment"}
            </p>
          </div>
        </div>
        {!isParentView && (
          <button
            onClick={() => {
              setForm(emptyForm());
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        )}
      </motion.div>

      {/* ===== Summary Cards ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{studentsForView.length}</p>
              <p className="text-xs text-gray-500">{isParentView ? "My Children" : "Total Students"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <GraduationCap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {studentsForView.filter((s) => s.iscedLevel === "ISCED 010").length}
              </p>
              <p className="text-xs text-gray-500">ISCED 010</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <GraduationCap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {studentsForView.filter((s) => s.iscedLevel === "ISCED 020").length}
              </p>
              <p className="text-xs text-gray-500">ISCED 020</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Filters Bar ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Search students by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* ISCED filter */}
          <div className="relative flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white sm:w-52"
              value={iscedFilter}
              onChange={(e) => handleIscedFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="ISCED 010">ISCED 010 – Early Childhood</option>
              <option value="ISCED 020">ISCED 020 – Pre-Primary</option>
            </select>
          </div>

          {/* View toggle & export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-xl border-2 p-2.5 transition-colors ${
                viewMode === "table"
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl border-2 p-2.5 transition-colors ${
                viewMode === "grid"
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== Results count ===== */}
      <p className="text-sm text-gray-500">
        Showing {startItem}–{endItem} of {filteredStudents.length} students
      </p>

      {/* ===== TABLE VIEW ===== */}
      {viewMode === "table" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Age</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">ISCED Level</th>
                  <th className="px-5 py-3">Classroom</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={`border-b transition-colors hover:bg-blue-50/40 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
                          {getInitials(student.firstName, student.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.allergies && student.allergies !== "None" && (
                            <span className="mt-0.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              Allergies: {student.allergies}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {student.id}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {getAge(student.dateOfBirth)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.gender === "Male"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${iscedBadge(student.iscedLevel)}`}
                      >
                        {student.iscedLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{student.classroom}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            router.push(`/${locale}/dashboard/students/${student.id}`)
                          }
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isParentView && (
                          <>
                            <button
                              onClick={() => openEdit(student)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(student)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      {isParentView ? "No children linked to your account." : "No students found matching your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        /* ===== GRID VIEW ===== */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {paginatedStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-bold text-white shadow-lg shadow-blue-100">
                    {getInitials(student.firstName, student.lastName)}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{student.id}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${iscedBadge(student.iscedLevel)}`}
                    >
                      {student.iscedLevel}
                    </span>
                    <span className="inline-block rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {getAge(student.dateOfBirth)}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.gender === "Male"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-pink-100 text-pink-700"
                      }`}
                    >
                      {student.gender}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{student.classroom}</p>
                  {student.allergies && student.allergies !== "None" && (
                    <span className="mt-1.5 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-700">
                      Allergies: {student.allergies}
                    </span>
                  )}
                </div>

                {/* Card actions */}
                <div className="mt-4 flex items-center justify-center gap-1 border-t pt-3">
                  <button
                    onClick={() =>
                      router.push(`/${locale}/dashboard/students/${student.id}`)
                    }
                    className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {!isParentView && (
                    <>
                      <button
                        onClick={() => openEdit(student)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDelete(student)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {paginatedStudents.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              {isParentView ? "No children linked to your account." : "No students found matching your filters."}
            </div>
          )}
        </motion.div>
      )}

      {/* ===== Pagination ===== */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {safePage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="inline-flex items-center gap-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 rounded-xl text-sm font-medium transition-colors ${
                page === safePage
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="inline-flex items-center gap-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ===== Add Student Dialog ===== */}
      <FormDialog
        open={addOpen}
        title="Add New Student"
        description="Fill in the student information below."
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        submitLabel="Add Student"
        size="lg"
      >
        {renderFormFields()}
      </FormDialog>

      {/* ===== Edit Student Dialog ===== */}
      <FormDialog
        open={editOpen}
        title="Edit Student"
        description="Update the student information below."
        onClose={() => {
          setEditOpen(false);
          setEditingId(null);
          setForm(emptyForm());
        }}
        onSubmit={handleEdit}
        submitLabel="Save Changes"
        size="lg"
      >
        {renderFormFields()}
      </FormDialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Student"
        description={
          deletingStudent
            ? `Are you sure you want to remove ${deletingStudent.firstName} ${deletingStudent.lastName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setDeletingStudent(null);
        }}
      />

      {/* ===== Toast Notifications ===== */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
