"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

/**
 * Maps parent user email to their children's full names (as used in mock data).
 * In production, replace with API: get parent profile -> ParentStudent -> Student fullNames.
 */
const PARENT_CHILDREN_BY_EMAIL: Record<string, string[]> = {
  "parent@edu.com": ["Sara Ahmed"],
  // Add more parent emails and their children's full names as needed
};

export function useParentChildren() {
  const { data: session, status } = useSession();

  return useMemo(() => {
    const isParentView =
      status === "authenticated" &&
      session?.user?.role === "PARENT" &&
      !!session?.user?.email;

    const email = session?.user?.email ?? "";
    const myChildrenNames = isParentView
      ? PARENT_CHILDREN_BY_EMAIL[email] ?? []
      : [];

    const myChildrenSet = new Set(
      myChildrenNames.map((n) => n.toLowerCase().trim())
    );

    const isMyChild = (studentName: string) =>
      myChildrenSet.has(String(studentName).toLowerCase().trim());

    return {
      isParentView: !!isParentView,
      myChildrenNames,
      myChildrenSet,
      isMyChild,
      parentEmail: email,
    };
  }, [session?.user?.role, session?.user?.email, status]);
}
