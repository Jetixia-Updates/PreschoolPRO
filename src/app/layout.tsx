import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduPlatform - Educational Management System",
  description:
    "Enterprise-grade educational platform for ISCED 010/020 programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
