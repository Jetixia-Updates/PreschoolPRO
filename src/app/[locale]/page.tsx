"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8">
      <div className="w-full max-w-4xl space-y-8 text-center">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 shadow-2xl">
            <svg
              className="h-full w-full text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          
          <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-6xl font-bold text-transparent">
            {t("appName")}
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Enterprise Educational Platform for ISCED 010/020 Programs
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Student Management"
            description="Comprehensive student profiles, enrollment, and tracking"
            icon="👥"
          />
          <FeatureCard
            title="Development Tracking"
            description="Monitor developmental milestones across all domains"
            icon="📈"
          />
          <FeatureCard
            title="Parent Portal"
            description="Real-time updates and communication with parents"
            icon="👨‍👩‍👧‍👦"
          />
          <FeatureCard
            title="AI Insights"
            description="Smart recommendations and automated report generation"
            icon="🤖"
          />
          <FeatureCard
            title="Multi-Language"
            description="Full support for English and Arabic (RTL)"
            icon="🌍"
          />
          <FeatureCard
            title="RBAC Security"
            description="Role-based access with 7 roles and 30+ permissions"
            icon="🔐"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/en/login"
            className="rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Get Started
          </a>
          <a
            href="https://github.com"
            className="rounded-xl border-2 border-primary bg-background px-8 py-4 font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            View Documentation
          </a>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-success/20 bg-success/10 p-6">
          <h3 className="mb-2 text-lg font-semibold text-success">
            ✅ Foundation Complete
          </h3>
          <p className="text-sm text-success-foreground">
            Database schema (40+ models), Authentication (NextAuth + RBAC), API layer (tRPC),
            Design system, i18n (EN/AR), AI integration, and complete infrastructure ready.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="rounded-2xl bg-card p-6 text-left shadow-lg">
          <h3 className="mb-4 text-lg font-semibold">Tech Stack</h3>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <TechItem label="Frontend" value="Next.js 14, React 19, TypeScript" />
            <TechItem label="Styling" value="TailwindCSS 4, ShadCN UI" />
            <TechItem label="Backend" value="tRPC, Prisma, PostgreSQL" />
            <TechItem label="Auth" value="NextAuth.js v5, JWT, RBAC" />
            <TechItem label="Cache" value="Redis, TanStack Query" />
            <TechItem label="AI" value="OpenAI GPT-4 integration" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-md transition-all hover:scale-105 hover:shadow-xl">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-primary">{label}:</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}
