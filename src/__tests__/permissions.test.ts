import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canManageSchool,
  canViewAllSchools,
} from "../lib/permissions";
import { UserRole } from "@prisma/client";

describe("RBAC Permissions", () => {
  describe("hasPermission", () => {
    it("SUPER_ADMIN has all permissions", () => {
      expect(hasPermission("SUPER_ADMIN" as UserRole, "student:create")).toBe(true);
      expect(hasPermission("SUPER_ADMIN" as UserRole, "school:manage")).toBe(true);
      expect(hasPermission("SUPER_ADMIN" as UserRole, "billing:process")).toBe(true);
      expect(hasPermission("SUPER_ADMIN" as UserRole, "user:delete")).toBe(true);
    });

    it("TEACHER can view and manage students", () => {
      expect(hasPermission("TEACHER" as UserRole, "student:view")).toBe(true);
      expect(hasPermission("TEACHER" as UserRole, "student:update")).toBe(true);
      expect(hasPermission("TEACHER" as UserRole, "development:assess")).toBe(true);
    });

    it("TEACHER cannot manage school or billing", () => {
      expect(hasPermission("TEACHER" as UserRole, "school:manage")).toBe(false);
      expect(hasPermission("TEACHER" as UserRole, "billing:manage")).toBe(false);
      expect(hasPermission("TEACHER" as UserRole, "user:create")).toBe(false);
    });

    it("PARENT has minimal permissions", () => {
      expect(hasPermission("PARENT" as UserRole, "parent:view-own")).toBe(true);
      expect(hasPermission("PARENT" as UserRole, "parent:message")).toBe(true);
      expect(hasPermission("PARENT" as UserRole, "student:view")).toBe(false);
      expect(hasPermission("PARENT" as UserRole, "billing:manage")).toBe(false);
    });

    it("ACCOUNTANT has billing permissions", () => {
      expect(hasPermission("ACCOUNTANT" as UserRole, "billing:view")).toBe(true);
      expect(hasPermission("ACCOUNTANT" as UserRole, "billing:manage")).toBe(true);
      expect(hasPermission("ACCOUNTANT" as UserRole, "billing:process")).toBe(true);
      expect(hasPermission("ACCOUNTANT" as UserRole, "student:create")).toBe(false);
    });

    it("HEALTH_SUPERVISOR has health permissions", () => {
      expect(hasPermission("HEALTH_SUPERVISOR" as UserRole, "health:view")).toBe(true);
      expect(hasPermission("HEALTH_SUPERVISOR" as UserRole, "health:update")).toBe(true);
      expect(hasPermission("HEALTH_SUPERVISOR" as UserRole, "health:incident")).toBe(true);
      expect(hasPermission("HEALTH_SUPERVISOR" as UserRole, "billing:manage")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true if user has any listed permission", () => {
      expect(
        hasAnyPermission("TEACHER" as UserRole, ["student:view", "school:manage"])
      ).toBe(true);
    });

    it("returns false if user has none of the listed permissions", () => {
      expect(
        hasAnyPermission("PARENT" as UserRole, ["school:manage", "billing:manage"])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("returns true if user has all listed permissions", () => {
      expect(
        hasAllPermissions("SUPER_ADMIN" as UserRole, [
          "student:view",
          "school:manage",
          "billing:process",
        ])
      ).toBe(true);
    });

    it("returns false if user is missing any listed permission", () => {
      expect(
        hasAllPermissions("TEACHER" as UserRole, [
          "student:view",
          "school:manage",
        ])
      ).toBe(false);
    });
  });

  describe("getRolePermissions", () => {
    it("returns array of permissions for role", () => {
      const permissions = getRolePermissions("TEACHER" as UserRole);
      expect(permissions).toBeInstanceOf(Array);
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain("student:view");
    });
  });

  describe("school management", () => {
    it("only SUPER_ADMIN can manage school", () => {
      expect(canManageSchool("SUPER_ADMIN" as UserRole)).toBe(true);
      expect(canManageSchool("SCHOOL_ADMIN" as UserRole)).toBe(false);
      expect(canManageSchool("TEACHER" as UserRole)).toBe(false);
    });

    it("only SUPER_ADMIN can view all schools", () => {
      expect(canViewAllSchools("SUPER_ADMIN" as UserRole)).toBe(true);
      expect(canViewAllSchools("SCHOOL_ADMIN" as UserRole)).toBe(false);
    });
  });
});
