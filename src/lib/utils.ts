import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Calculate age in months from date of birth
 */
export function calculateAgeInMonths(dateOfBirth: Date): number {
  const today = new Date();
  const years = today.getFullYear() - dateOfBirth.getFullYear();
  const months = today.getMonth() - dateOfBirth.getMonth();
  return years * 12 + months;
}

/**
 * Calculate age in years from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Generate a random student ID
 */
export function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `STU${year}${random}`;
}

/**
 * Generate a random invoice number
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear().toString();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Get color for ISCED level
 */
export function getISCEDColor(level: "ISCED_010" | "ISCED_020"): string {
  return level === "ISCED_010" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";
}

/**
 * Get color for attendance status
 */
export function getAttendanceColor(
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
): string {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-700";
    case "ABSENT":
      return "bg-red-100 text-red-700";
    case "LATE":
      return "bg-yellow-100 text-yellow-700";
    case "EXCUSED":
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Get color for milestone status
 */
export function getMilestoneColor(
  status: "NOT_STARTED" | "IN_PROGRESS" | "ACHIEVED" | "DELAYED"
): string {
  switch (status) {
    case "NOT_STARTED":
      return "bg-gray-100 text-gray-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "ACHIEVED":
      return "bg-green-100 text-green-700";
    case "DELAYED":
      return "bg-red-100 text-red-700";
  }
}
