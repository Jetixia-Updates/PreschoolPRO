"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

const roleEnumSet: Record<string, boolean> = {
  SUPER_ADMIN: true,
  SCHOOL_ADMIN: true,
  TEACHER: true,
  ASSISTANT_TEACHER: true,
  PARENT: true,
  ACCOUNTANT: true,
  HEALTH_SUPERVISOR: true,
};

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/${locale}/login`);
      return;
    }
  }, [status, locale, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Normalize role to string (JWT/session can vary); default to PARENT for unknown
  const rawRole = session.user.role;
  const role =
    typeof rawRole === "string" && rawRole in roleEnumSet
      ? rawRole
      : "PARENT";

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role,
    avatar: (session.user as { image?: string }).image ?? undefined,
  };

  return (
    <DashboardLayout locale={locale} user={user}>
      {children}
    </DashboardLayout>
  );
}
