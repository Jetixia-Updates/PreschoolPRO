"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Mail, Lock, User, BookOpen, Phone, Building } from "lucide-react";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    schoolCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    title: isRTL ? "إنشاء حساب جديد" : "Create Account",
    subtitle: isRTL
      ? "انضم إلى منصة التعليم اليوم"
      : "Join the educational platform today",
    name: isRTL ? "الاسم الكامل" : "Full Name",
    email: isRTL ? "البريد الإلكتروني" : "Email Address",
    phone: isRTL ? "رقم الهاتف" : "Phone Number",
    password: isRTL ? "كلمة المرور" : "Password",
    confirmPassword: isRTL ? "تأكيد كلمة المرور" : "Confirm Password",
    role: isRTL ? "الدور" : "Role",
    schoolCode: isRTL ? "رمز المدرسة" : "School Code",
    signUp: isRTL ? "إنشاء حساب" : "Create Account",
    hasAccount: isRTL ? "لديك حساب بالفعل؟" : "Already have an account?",
    signIn: isRTL ? "تسجيل الدخول" : "Sign in",
    selectRole: isRTL ? "اختر دورك" : "Select your role",
    teacher: isRTL ? "معلم" : "Teacher",
    parent: isRTL ? "ولي أمر" : "Parent",
    admin: isRTL ? "مدير مدرسة" : "School Admin",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/${locale}/login`);
    } catch (err) {
      setError(isRTL ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center">
          <Link
            href={`/${locale === "ar" ? "en" : "ar"}/register`}
            className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium"
          >
            🌍 {locale === "ar" ? "English" : "العربية"}
          </Link>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                icon={<User className="h-4 w-4" />}
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                icon={<Phone className="h-4 w-4" />}
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.role}</Label>
              <Select onValueChange={(v) => updateField("role", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectRole} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">{t.teacher}</SelectItem>
                  <SelectItem value="PARENT">{t.parent}</SelectItem>
                  <SelectItem value="SCHOOL_ADMIN">{t.admin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolCode">{t.schoolCode}</Label>
              <Input
                id="schoolCode"
                icon={<Building className="h-4 w-4" />}
                value={formData.schoolCode}
                onChange={(e) => updateField("schoolCode", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="h-4 w-4" />}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{isRTL ? "جاري الإنشاء..." : "Creating..."}</span>
              </div>
            ) : (
              t.signUp
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t.hasAccount}{" "}
          <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
            {t.signIn}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
