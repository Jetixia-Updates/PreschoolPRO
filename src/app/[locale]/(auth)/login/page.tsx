"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, BookOpen } from "lucide-react";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    title: isRTL ? "مرحباً بعودتك" : "Welcome Back",
    subtitle: isRTL
      ? "سجل دخولك للوصول إلى لوحة التحكم"
      : "Sign in to access your dashboard",
    email: isRTL ? "البريد الإلكتروني" : "Email Address",
    password: isRTL ? "كلمة المرور" : "Password",
    signIn: isRTL ? "تسجيل الدخول" : "Sign In",
    forgotPassword: isRTL ? "هل نسيت كلمة المرور؟" : "Forgot password?",
    noAccount: isRTL ? "ليس لديك حساب؟" : "Don't have an account?",
    signUp: isRTL ? "إنشاء حساب" : "Sign up",
    emailPlaceholder: isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email",
    passwordPlaceholder: isRTL ? "أدخل كلمة المرور" : "Enter your password",
    rememberMe: isRTL ? "تذكرني" : "Remember me",
    or: isRTL ? "أو" : "or",
    demoAccounts: isRTL ? "حسابات تجريبية" : "Demo Accounts",
    invalidCredentials: isRTL ? "بيانات الدخول غير صحيحة" : "Invalid credentials",
  };

  const demoAccounts = [
    { role: isRTL ? "مدير النظام" : "Super Admin", email: "admin@edu.com" },
    { role: isRTL ? "معلم" : "Teacher", email: "teacher@edu.com" },
    { role: isRTL ? "ولي أمر" : "Parent", email: "parent@edu.com" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate login - replace with actual NextAuth signIn
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(t.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo123456");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Decorative */}
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary/90 to-secondary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center text-white"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-lg">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <h2 className="mb-4 text-4xl font-bold">
            {isRTL ? "منصة التعليم" : "EduPlatform"}
          </h2>
          <p className="text-lg text-white/80">
            {isRTL
              ? "نظام متكامل لإدارة برامج الطفولة المبكرة والتعليم ما قبل الابتدائي"
              : "Complete management system for Early Childhood Development and Pre-Primary Education programs"}
          </p>

          {/* Feature Cards */}
          <div className="mt-12 space-y-4">
            {[
              {
                icon: "👶",
                text: isRTL ? "تتبع تطور الطفل" : "Child Development Tracking",
              },
              {
                icon: "📊",
                text: isRTL ? "تحليلات ذكية" : "AI-Powered Analytics",
              },
              {
                icon: "🌍",
                text: isRTL ? "دعم عربي وإنجليزي" : "Arabic & English Support",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
              <BookOpen className="h-8 w-8" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center">
            <Link
              href={`/${locale === "ar" ? "en" : "ar"}/login`}
              className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80"
            >
              🌍 {locale === "ar" ? "English" : "العربية"}
            </Link>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.password}</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                {t.rememberMe}
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isRTL ? "جاري الدخول..." : "Signing in..."}</span>
                </div>
              ) : (
                t.signIn
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.demoAccounts}
              </span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => loginAsDemo(account.email)}
                className="w-full rounded-xl border bg-card px-4 py-3 text-start text-sm transition-all hover:bg-muted"
              >
                <span className="font-medium">{account.role}</span>
                <span className="ms-2 text-muted-foreground">
                  {account.email}
                </span>
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t.noAccount}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-medium text-primary hover:underline"
            >
              {t.signUp}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
