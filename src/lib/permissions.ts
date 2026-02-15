import { UserRole } from "@prisma/client";

/**
 * Permission definitions for the educational platform
 */
export type Permission =
  // Student permissions
  | "student:view"
  | "student:create"
  | "student:update"
  | "student:delete"
  // Development tracking
  | "development:view"
  | "development:assess"
  | "development:update"
  // Classroom permissions
  | "classroom:view"
  | "classroom:manage"
  | "classroom:assign"
  // Teacher permissions
  | "teacher:view"
  | "teacher:manage"
  | "teacher:evaluate"
  // Parent permissions
  | "parent:view-own"
  | "parent:message"
  // Health permissions
  | "health:view"
  | "health:update"
  | "health:incident"
  // Billing permissions
  | "billing:view"
  | "billing:manage"
  | "billing:process"
  // Curriculum permissions
  | "curriculum:view"
  | "curriculum:create"
  | "curriculum:update"
  // Communication permissions
  | "message:send"
  | "message:broadcast"
  | "announcement:create"
  // Reports permissions
  | "report:view"
  | "report:generate"
  | "report:export"
  // School management
  | "school:manage"
  | "school:view-all"
  // System permissions
  | "user:create"
  | "user:update"
  | "user:delete";

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    // Full system access
    "student:view",
    "student:create",
    "student:update",
    "student:delete",
    "development:view",
    "development:assess",
    "development:update",
    "classroom:view",
    "classroom:manage",
    "classroom:assign",
    "teacher:view",
    "teacher:manage",
    "teacher:evaluate",
    "health:view",
    "health:update",
    "health:incident",
    "billing:view",
    "billing:manage",
    "billing:process",
    "curriculum:view",
    "curriculum:create",
    "curriculum:update",
    "message:send",
    "message:broadcast",
    "announcement:create",
    "report:view",
    "report:generate",
    "report:export",
    "school:manage",
    "school:view-all",
    "user:create",
    "user:update",
    "user:delete",
  ],

  SCHOOL_ADMIN: [
    // School-level management
    "student:view",
    "student:create",
    "student:update",
    "student:delete",
    "development:view",
    "development:assess",
    "development:update",
    "classroom:view",
    "classroom:manage",
    "classroom:assign",
    "teacher:view",
    "teacher:manage",
    "teacher:evaluate",
    "health:view",
    "health:update",
    "health:incident",
    "billing:view",
    "billing:manage",
    "billing:process",
    "curriculum:view",
    "curriculum:create",
    "curriculum:update",
    "message:send",
    "message:broadcast",
    "announcement:create",
    "report:view",
    "report:generate",
    "report:export",
    "user:create",
    "user:update",
  ],

  TEACHER: [
    // Classroom and student management
    "student:view",
    "student:update",
    "development:view",
    "development:assess",
    "development:update",
    "classroom:view",
    "health:view",
    "health:incident",
    "curriculum:view",
    "curriculum:create",
    "curriculum:update",
    "message:send",
    "report:view",
    "report:generate",
  ],

  ASSISTANT_TEACHER: [
    // Limited classroom access
    "student:view",
    "development:view",
    "development:assess",
    "classroom:view",
    "health:view",
    "curriculum:view",
    "message:send",
    "report:view",
  ],

  PARENT: [
    // View own children only
    "parent:view-own",
    "parent:message",
    "report:view",
  ],

  ACCOUNTANT: [
    // Billing and finance
    "student:view",
    "billing:view",
    "billing:manage",
    "billing:process",
    "report:view",
    "report:generate",
    "report:export",
  ],

  HEALTH_SUPERVISOR: [
    // Health records management
    "student:view",
    "health:view",
    "health:update",
    "health:incident",
    "report:view",
    "report:generate",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user can access student data
 */
export function canAccessStudent(
  userRole: UserRole,
  userId: string,
  studentId: string,
  parentRelations: any[]
): boolean {
  // Super admin and school admin can access all students
  if (["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(userRole)) {
    return true;
  }

  // Teachers can access students in their classrooms
  if (["TEACHER", "ASSISTANT_TEACHER"].includes(userRole)) {
    return hasPermission(userRole, "student:view");
  }

  // Parents can only access their own children
  if (userRole === "PARENT") {
    return parentRelations.some(
      (relation) =>
        relation.parentProfileId === userId && relation.studentId === studentId
    );
  }

  // Health supervisor and accountant can access students they need to work with
  if (["HEALTH_SUPERVISOR", "ACCOUNTANT"].includes(userRole)) {
    return hasPermission(userRole, "student:view");
  }

  return false;
}

/**
 * Check if user can manage school settings
 */
export function canManageSchool(userRole: UserRole): boolean {
  return hasPermission(userRole, "school:manage");
}

/**
 * Check if user can view all schools (multi-tenant)
 */
export function canViewAllSchools(userRole: UserRole): boolean {
  return hasPermission(userRole, "school:view-all");
}
