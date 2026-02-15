import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  getInitials,
  truncate,
  calculateAge,
  calculateAgeInMonths,
  generateStudentId,
  generateInvoiceNumber,
  getISCEDColor,
  getAttendanceColor,
  getMilestoneColor,
} from "../lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("handles tailwind merge conflicts", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });
});

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1,234.56");
  });

  it("formats with custom currency", () => {
    const result = formatCurrency(100, "EUR", "en");
    expect(result).toContain("100");
  });
});

describe("getInitials", () => {
  it("returns correct initials", () => {
    expect(getInitials("Ahmed Hassan")).toBe("AH");
  });

  it("handles single name", () => {
    expect(getInitials("Ahmed")).toBe("A");
  });

  it("limits to 2 characters", () => {
    expect(getInitials("Ahmed Hassan Ali")).toBe("AH");
  });
});

describe("truncate", () => {
  it("truncates long text", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("does not truncate short text", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });
});

describe("calculateAge", () => {
  it("calculates age correctly", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 5);
    expect(calculateAge(dob)).toBe(5);
  });
});

describe("calculateAgeInMonths", () => {
  it("calculates age in months", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 2);
    dob.setMonth(dob.getMonth() - 6);
    expect(calculateAgeInMonths(dob)).toBe(30);
  });
});

describe("generateStudentId", () => {
  it("generates valid student ID format", () => {
    const id = generateStudentId();
    expect(id).toMatch(/^STU\d{6}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateStudentId()));
    expect(ids.size).toBeGreaterThan(90); // Allow for rare collisions
  });
});

describe("generateInvoiceNumber", () => {
  it("generates valid invoice number format", () => {
    const num = generateInvoiceNumber();
    expect(num).toMatch(/^INV-\d{6}-\d{4}$/);
  });
});

describe("color utilities", () => {
  it("returns correct ISCED colors", () => {
    expect(getISCEDColor("ISCED_010")).toContain("blue");
    expect(getISCEDColor("ISCED_020")).toContain("purple");
  });

  it("returns correct attendance colors", () => {
    expect(getAttendanceColor("PRESENT")).toContain("green");
    expect(getAttendanceColor("ABSENT")).toContain("red");
    expect(getAttendanceColor("LATE")).toContain("yellow");
    expect(getAttendanceColor("EXCUSED")).toContain("gray");
  });

  it("returns correct milestone colors", () => {
    expect(getMilestoneColor("ACHIEVED")).toContain("green");
    expect(getMilestoneColor("IN_PROGRESS")).toContain("blue");
    expect(getMilestoneColor("DELAYED")).toContain("red");
    expect(getMilestoneColor("NOT_STARTED")).toContain("gray");
  });
});
