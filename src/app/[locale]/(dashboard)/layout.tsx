"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Mock user for demo - replace with real auth session
const mockUser = {
  name: "Ahmed Hassan",
  email: "admin@edu.com",
  role: "SUPER_ADMIN",
  avatar: null,
};

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  return (
    <DashboardLayout locale={locale} user={mockUser as any}>
      {children}
    </DashboardLayout>
  );
}
