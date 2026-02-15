"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Printer,
  FileText,
  Calendar,
  Brain,
  Lightbulb,
  Check,
  X,
  Clock,
  RefreshCw,
  Filter,
  Eye,
  Sparkles,
  Users,
  Baby,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Animation ───────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Types ───────────────────────────────────────────────────
interface EnrollmentPoint {
  month: string;
  value: number;
}
interface AttendancePoint {
  month: string;
  value: number;
}
interface DevelopmentPoint {
  domain: string;
  value: number;
}
interface RevenuePoint {
  month: string;
  value: number;
}
interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  frequency: string;
  lastGenerated: string;
}
interface AIInsight {
  id: number;
  title: string;
  insight: string;
  recommendation: string;
  confidence: number;
  type: "positive" | "warning" | "attention";
  icon: React.ElementType;
  dismissed: boolean;
  applied: boolean;
}

// ─── SVG Chart Components ────────────────────────────────────
function BarChartSVG({
  data,
  maxVal,
  color,
  suffix,
  prefix,
}: {
  data: { label: string; value: number }[];
  maxVal: number;
  color: string;
  suffix?: string;
  prefix?: string;
}) {
  const chartH = 140;
  const barW = 100 / data.length;
  return (
    <svg viewBox={`0 0 ${data.length * 60} ${chartH + 30}`} className="w-full h-44">
      {data.map((d, i) => {
        const h = (d.value / maxVal) * chartH;
        return (
          <g key={i}>
            <motion.rect
              x={i * 60 + 10}
              y={chartH - h}
              width={40}
              height={h}
              rx={6}
              className={color}
              initial={{ height: 0, y: chartH }}
              animate={{ height: h, y: chartH - h }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
            />
            <text
              x={i * 60 + 30}
              y={chartH - h - 6}
              textAnchor="middle"
              className="fill-gray-600 text-[10px] font-medium"
            >
              {prefix}
              {d.value}
              {suffix}
            </text>
            <text
              x={i * 60 + 30}
              y={chartH + 16}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChartSVG({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cum = 0;
  const arcs = segments.map((seg) => {
    const start = cum / total;
    cum += seg.value;
    const end = cum / total;
    return { ...seg, start, end };
  });

  function arcPath(startFrac: number, endFrac: number, r: number) {
    const startAngle = startFrac * 2 * Math.PI - Math.PI / 2;
    const endAngle = endFrac * 2 * Math.PI - Math.PI / 2;
    const x1 = 100 + r * Math.cos(startAngle);
    const y1 = 100 + r * Math.sin(startAngle);
    const x2 = 100 + r * Math.cos(endAngle);
    const y2 = 100 + r * Math.sin(endAngle);
    const large = endFrac - startFrac > 0.5 ? 1 : 0;
    return `M 100 100 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-40 h-40 flex-shrink-0">
        {arcs.map((a, i) => (
          <motion.path
            key={i}
            d={arcPath(a.start, a.end, 90)}
            className={a.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
          />
        ))}
        <circle cx={100} cy={100} r={40} className="fill-white" />
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded-full ${seg.color.replace("fill-", "bg-")}`} />
            <span className="text-gray-600">
              {seg.label}: {seg.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineTrendSVG({
  data,
  maxVal,
  color,
}: {
  data: { label: string; value: number }[];
  maxVal: number;
  color: string;
}) {
  const chartH = 130;
  const chartW = data.length * 60;
  const points = data.map((d, i) => ({
    x: i * 60 + 30,
    y: chartH - (d.value / maxVal) * chartH + 10,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartH + 10} L ${points[0].x} ${chartH + 10} Z`;

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-44">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={`${color}`} stopOpacity={0.3} />
          <stop offset="100%" className={`${color}`} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill="url(#areaGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />
      <motion.path
        d={pathD}
        fill="none"
        className={`${color.replace("stop-", "stroke-")}`}
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
      {points.map((p, i) => (
        <g key={i}>
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={4}
            className={`${color.replace("stop-", "fill-")}`}
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          />
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            className="fill-gray-600 text-[10px] font-medium"
          >
            ${(data[i].value / 1000).toFixed(0)}K
          </text>
          <text
            x={p.x}
            y={chartH + 24}
            textAnchor="middle"
            className="fill-gray-400 text-[10px]"
          >
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function ReportsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, info, warning, dismiss } = useToast();

  // ── Dialog states ──────────────────────────────────────────
  const [generateOpen, setGenerateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // ── Generate report form ───────────────────────────────────
  const [reportType, setReportType] = useState("enrollment");
  const [dateStart, setDateStart] = useState("2026-01-01");
  const [dateEnd, setDateEnd] = useState("2026-02-15");
  const [format, setFormat] = useState("PDF");
  const [includeCharts, setIncludeCharts] = useState(true);

  // ── Schedule report form ───────────────────────────────────
  const [schedReportType, setSchedReportType] = useState("enrollment");
  const [schedFrequency, setSchedFrequency] = useState("weekly");
  const [schedFormat, setSchedFormat] = useState("PDF");
  const [schedEmail, setSchedEmail] = useState("");

  // ── Date range filter for charts ───────────────────────────
  const [filterStart, setFilterStart] = useState(0); // index
  const [filterEnd, setFilterEnd] = useState(11); // index

  // ── AI Insights state ──────────────────────────────────────
  const [insights, setInsights] = useState<AIInsight[]>([
    {
      id: 1,
      title: isRTL ? "نمو التسجيل" : "Enrollment Growth",
      insight: isRTL
        ? "معدل التسجيل يزداد بشكل مطرد بنسبة 2.3% شهرياً. يُتوقع الوصول إلى 260 طالباً بحلول أبريل."
        : "Enrollment rate is steadily increasing at 2.3% monthly. Expected to reach 260 students by April.",
      recommendation: isRTL
        ? "زيادة سعة الفصول الدراسية وتعيين معلمين إضافيين"
        : "Increase classroom capacity and hire additional teachers",
      confidence: 94,
      type: "positive",
      icon: TrendingUp,
      dismissed: false,
      applied: false,
    },
    {
      id: 2,
      title: isRTL ? "انخفاض الحضور" : "Attendance Dip",
      insight: isRTL
        ? "انخفض الحضور 3% في ديسمبر بسبب موسم الإنفلونزا. يُنصح بتعزيز إجراءات النظافة."
        : "Attendance dropped 3% in December due to flu season. Recommend enhanced hygiene measures.",
      recommendation: isRTL
        ? "تطبيق بروتوكول صحي معزز وتوزيع معقمات"
        : "Implement enhanced health protocol and distribute sanitizers",
      confidence: 87,
      type: "warning",
      icon: ArrowDownRight,
      dismissed: false,
      applied: false,
    },
    {
      id: 3,
      title: isRTL ? "تفوق في الإبداع" : "Creative Domain Excellence",
      insight: isRTL
        ? "مجال الإبداع يحقق أعلى نسبة تقدم (88%). برنامج الفنون الجديد يظهر نتائج إيجابية."
        : "Creative domain shows highest progress (88%). New arts program showing positive results.",
      recommendation: isRTL
        ? "توسيع برنامج الفنون ليشمل جميع الفئات العمرية"
        : "Expand arts program to cover all age groups",
      confidence: 91,
      type: "positive",
      icon: Sparkles,
      dismissed: false,
      applied: false,
    },
    {
      id: 4,
      title: isRTL ? "فرصة تطوير اللغة" : "Language Development Opportunity",
      insight: isRTL
        ? "مجال اللغة (72%) يحتاج اهتماماً إضافياً. يُنصح بزيادة أنشطة القراءة والمحادثة."
        : "Language domain (72%) needs additional focus. Recommend increasing reading and conversation activities.",
      recommendation: isRTL
        ? "إضافة 30 دقيقة يومية لأنشطة القراءة التفاعلية"
        : "Add 30 minutes daily for interactive reading activities",
      confidence: 82,
      type: "attention",
      icon: Brain,
      dismissed: false,
      applied: false,
    },
  ]);

  // ── Stats state ────────────────────────────────────────────
  const [totalReports, setTotalReports] = useState(156);
  const [scheduledReports, setScheduledReports] = useState(8);

  // ── Translations ───────────────────────────────────────────
  const t = {
    title: isRTL ? "التقارير والتحليلات" : "Reports & Analytics",
    subtitle: isRTL
      ? "رؤى شاملة عن أداء المنصة التعليمية"
      : "Comprehensive insights into educational platform performance",
    reportTemplates: isRTL ? "قوالب التقارير" : "Report Templates",
    charts: isRTL ? "الرسوم البيانية" : "Charts & Analytics",
    aiInsights: isRTL ? "رؤى ذكية" : "AI Insights",
    export: isRTL ? "تصدير" : "Export",
    enrollment: isRTL ? "اتجاه التسجيل" : "Enrollment Trend",
    attendance: isRTL ? "توزيع الحضور" : "Attendance Distribution",
    development: isRTL ? "مجالات التطور" : "Development Domains",
    revenue: isRTL ? "اتجاه الإيرادات" : "Revenue Trend",
    totalReportsLabel: isRTL ? "إجمالي التقارير" : "Total Reports",
    generatedThisMonth: isRTL ? "المنشأة هذا الشهر" : "Generated This Month",
    scheduledReportsLabel: isRTL ? "التقارير المجدولة" : "Scheduled Reports",
    dataPoints: isRTL ? "نقاط البيانات" : "Data Points",
    print: isRTL ? "طباعة" : "Print",
    generate: isRTL ? "إنشاء تقرير" : "Generate Report",
    schedule: isRTL ? "جدولة تقرير" : "Schedule Report",
    lastGenerated: isRTL ? "آخر إنشاء" : "Last generated",
    monthly: isRTL ? "شهري" : "Monthly",
    quarterly: isRTL ? "ربع سنوي" : "Quarterly",
    annual: isRTL ? "سنوي" : "Annual",
    exportChart: isRTL ? "تصدير الرسم" : "Export Chart",
    filterDate: isRTL ? "تصفية بالتاريخ" : "Filter by Date",
    generateBtn: isRTL ? "إنشاء" : "Generate",
    apply: isRTL ? "تطبيق" : "Apply",
    dismissBtn: isRTL ? "تجاهل" : "Dismiss",
    confidence: isRTL ? "الثقة" : "Confidence",
    recommendation: isRTL ? "التوصية" : "Recommendation",
  };

  // ── Mock data: 12 months of enrollment ─────────────────────
  const allEnrollmentData: EnrollmentPoint[] = [
    { month: isRTL ? "مارس" : "Mar", value: 195 },
    { month: isRTL ? "أبريل" : "Apr", value: 202 },
    { month: isRTL ? "مايو" : "May", value: 210 },
    { month: isRTL ? "يونيو" : "Jun", value: 208 },
    { month: isRTL ? "يوليو" : "Jul", value: 200 },
    { month: isRTL ? "أغسطس" : "Aug", value: 215 },
    { month: isRTL ? "سبتمبر" : "Sep", value: 220 },
    { month: isRTL ? "أكتوبر" : "Oct", value: 228 },
    { month: isRTL ? "نوفمبر" : "Nov", value: 232 },
    { month: isRTL ? "ديسمبر" : "Dec", value: 235 },
    { month: isRTL ? "يناير" : "Jan", value: 240 },
    { month: isRTL ? "فبراير" : "Feb", value: 247 },
  ];

  // Attendance weekly percentages
  const attendancePieData = [
    { label: isRTL ? "حاضر" : "Present", value: 87, color: "fill-emerald-500" },
    { label: isRTL ? "غائب" : "Absent", value: 8, color: "fill-red-400" },
    { label: isRTL ? "متأخر" : "Late", value: 5, color: "fill-amber-400" },
  ];

  // Development domain scores
  const developmentData: DevelopmentPoint[] = [
    { domain: isRTL ? "المعرفي" : "Cognitive", value: 78 },
    { domain: isRTL ? "اللغة" : "Language", value: 72 },
    { domain: isRTL ? "الاجتماعي" : "Social", value: 85 },
    { domain: isRTL ? "الجسدي" : "Physical", value: 81 },
    { domain: isRTL ? "الإبداعي" : "Creative", value: 88 },
  ];

  // Revenue 6 months
  const revenueData: RevenuePoint[] = [
    { month: isRTL ? "سبتمبر" : "Sep", value: 42000 },
    { month: isRTL ? "أكتوبر" : "Oct", value: 43500 },
    { month: isRTL ? "نوفمبر" : "Nov", value: 44000 },
    { month: isRTL ? "ديسمبر" : "Dec", value: 38000 },
    { month: isRTL ? "يناير" : "Jan", value: 44800 },
    { month: isRTL ? "فبراير" : "Feb", value: 45280 },
  ];

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 1,
      title: isRTL ? "تقرير التسجيل الشهري" : "Monthly Enrollment Report",
      description: isRTL
        ? "إحصائيات التسجيل والتوزيع حسب البرنامج والعمر"
        : "Enrollment stats, distribution by program and age",
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
      frequency: "monthly",
      lastGenerated: "Feb 1, 2026",
    },
    {
      id: 2,
      title: isRTL ? "تقرير الحضور الأسبوعي" : "Weekly Attendance Report",
      description: isRTL
        ? "معدلات الحضور والغياب لجميع الفصول"
        : "Attendance rates and absences for all classes",
      icon: Calendar,
      color: "bg-green-500/10 text-green-600",
      frequency: "weekly",
      lastGenerated: "Feb 10, 2026",
    },
    {
      id: 3,
      title: isRTL ? "تقرير التطور الشامل" : "Development Progress Report",
      description: isRTL
        ? "تحليل التقدم في جميع مجالات النمو"
        : "Progress analysis across all developmental domains",
      icon: Brain,
      color: "bg-purple-500/10 text-purple-600",
      frequency: "monthly",
      lastGenerated: "Feb 1, 2026",
    },
    {
      id: 4,
      title: isRTL ? "التقرير المالي" : "Financial Report",
      description: isRTL
        ? "الإيرادات والمصروفات وحالة التحصيل"
        : "Revenue, expenses, and collection status",
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600",
      frequency: "monthly",
      lastGenerated: "Feb 1, 2026",
    },
    {
      id: 5,
      title: isRTL ? "تقرير أداء المعلمين" : "Teacher Performance Report",
      description: isRTL
        ? "تقييمات المعلمين ومعايير الأداء"
        : "Teacher evaluations and performance metrics",
      icon: BarChart3,
      color: "bg-orange-500/10 text-orange-600",
      frequency: "quarterly",
      lastGenerated: "Jan 1, 2026",
    },
    {
      id: 6,
      title: isRTL ? "تقرير صحة وسلامة الأطفال" : "Child Health & Safety Report",
      description: isRTL
        ? "الحوادث والتطعيمات والتنبيهات الصحية"
        : "Incidents, vaccinations, and health alerts",
      icon: CheckCircle2,
      color: "bg-red-500/10 text-red-600",
      frequency: "monthly",
      lastGenerated: "Feb 1, 2026",
    },
  ];

  // ── Filtered enrollment data for charts ────────────────────
  const filteredEnrollment = useMemo(
    () => allEnrollmentData.slice(filterStart, filterEnd + 1),
    [filterStart, filterEnd, allEnrollmentData]
  );

  const maxEnrollment = Math.max(...filteredEnrollment.map((d) => d.value));
  const maxRevenue = Math.max(...revenueData.map((d) => d.value));
  const maxDev = Math.max(...developmentData.map((d) => d.value));

  // ── Handlers ───────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
    success(
      isRTL ? "جاري الطباعة" : "Printing",
      isRTL ? "تم إرسال الرسوم البيانية للطباعة" : "Charts sent to printer"
    );
  };

  const handleExportChart = (chartName: string) => {
    success(
      isRTL ? "تم تصدير الرسم البياني" : "Chart Exported",
      isRTL
        ? `تم تنزيل ${chartName} كصورة PNG`
        : `${chartName} downloaded as PNG image`
    );
  };

  const handleGenerateReport = () => {
    setGenerateOpen(false);
    setTotalReports((p) => p + 1);
    const typeLabels: Record<string, string> = {
      enrollment: isRTL ? "التسجيل" : "Enrollment",
      attendance: isRTL ? "الحضور" : "Attendance",
      development: isRTL ? "التطور" : "Development",
      financial: isRTL ? "المالي" : "Financial",
      health: isRTL ? "الصحة" : "Health",
    };
    success(
      isRTL ? "تم إنشاء التقرير" : "Report Generated",
      isRTL
        ? `تقرير ${typeLabels[reportType]} بصيغة ${format} جاهز للتنزيل`
        : `${typeLabels[reportType]} report in ${format} format is ready for download`
    );
  };

  const handleScheduleReport = () => {
    if (!schedEmail.trim()) {
      warning(
        isRTL ? "مطلوب بريد إلكتروني" : "Email Required",
        isRTL ? "يرجى إدخال بريد إلكتروني لاستلام التقارير" : "Please enter an email to receive reports"
      );
      return;
    }
    setScheduleOpen(false);
    setScheduledReports((p) => p + 1);
    success(
      isRTL ? "تمت الجدولة" : "Report Scheduled",
      isRTL
        ? `سيتم إرسال التقرير ${schedFrequency === "weekly" ? "أسبوعياً" : schedFrequency === "monthly" ? "شهرياً" : "يومياً"} إلى ${schedEmail}`
        : `Report will be sent ${schedFrequency} to ${schedEmail}`
    );
    setSchedEmail("");
  };

  const handleTemplateGenerate = (template: ReportTemplate) => {
    setTotalReports((p) => p + 1);
    success(
      isRTL ? "تم إنشاء التقرير" : "Report Generated",
      isRTL
        ? `${template.title} جاهز للتنزيل بصيغة PDF`
        : `${template.title} is ready for download as PDF`
    );
  };

  const handleApplyInsight = (id: number) => {
    setInsights((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, applied: true } : ins))
    );
    const ins = insights.find((i) => i.id === id);
    success(
      isRTL ? "تم تطبيق التوصية" : "Recommendation Applied",
      isRTL
        ? `تم تطبيق توصية "${ins?.title}" بنجاح`
        : `"${ins?.title}" recommendation has been applied`
    );
  };

  const handleDismissInsight = (id: number) => {
    setInsights((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, dismissed: true } : ins))
    );
    info(
      isRTL ? "تم تجاهل الرؤية" : "Insight Dismissed",
      isRTL ? "يمكنك إعادة تنشيطها لاحقاً" : "You can reactivate it later"
    );
  };

  const activeInsights = insights.filter((i) => !i.dismissed);

  // ── Shared select class ────────────────────────────────────
  const selectCls =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const inputCls =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* ─── Generate Report Dialog ──────────────────────────── */}
      <FormDialog
        open={generateOpen}
        title={isRTL ? "إنشاء تقرير جديد" : "Generate New Report"}
        description={
          isRTL
            ? "اختر نوع التقرير والإعدادات المطلوبة"
            : "Select report type and configuration"
        }
        onClose={() => setGenerateOpen(false)}
        onSubmit={handleGenerateReport}
        submitLabel={isRTL ? "إنشاء التقرير" : "Generate Report"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        <div className="space-y-4">
          <FormField label={isRTL ? "نوع التقرير" : "Report Type"} required>
            <select
              className={selectCls}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="enrollment">
                {isRTL ? "التسجيل" : "Enrollment"}
              </option>
              <option value="attendance">
                {isRTL ? "الحضور" : "Attendance"}
              </option>
              <option value="development">
                {isRTL ? "التطور" : "Development"}
              </option>
              <option value="financial">
                {isRTL ? "المالي" : "Financial"}
              </option>
              <option value="health">{isRTL ? "الصحة" : "Health"}</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={isRTL ? "تاريخ البداية" : "Start Date"} required>
              <input
                type="date"
                className={inputCls}
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </FormField>
            <FormField label={isRTL ? "تاريخ النهاية" : "End Date"} required>
              <input
                type="date"
                className={inputCls}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label={isRTL ? "صيغة الملف" : "Format"} required>
            <select
              className={selectCls}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
            </select>
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              {isRTL ? "تضمين الرسوم البيانية" : "Include Charts"}
            </span>
          </label>
        </div>
      </FormDialog>

      {/* ─── Schedule Report Dialog ──────────────────────────── */}
      <FormDialog
        open={scheduleOpen}
        title={isRTL ? "جدولة تقرير متكرر" : "Schedule Recurring Report"}
        description={
          isRTL
            ? "إعداد إرسال تلقائي للتقارير"
            : "Set up automatic report delivery"
        }
        onClose={() => setScheduleOpen(false)}
        onSubmit={handleScheduleReport}
        submitLabel={isRTL ? "حفظ الجدولة" : "Save Schedule"}
        cancelLabel={isRTL ? "إلغاء" : "Cancel"}
      >
        <div className="space-y-4">
          <FormField label={isRTL ? "نوع التقرير" : "Report Type"} required>
            <select
              className={selectCls}
              value={schedReportType}
              onChange={(e) => setSchedReportType(e.target.value)}
            >
              <option value="enrollment">
                {isRTL ? "التسجيل" : "Enrollment"}
              </option>
              <option value="attendance">
                {isRTL ? "الحضور" : "Attendance"}
              </option>
              <option value="development">
                {isRTL ? "التطور" : "Development"}
              </option>
              <option value="financial">
                {isRTL ? "المالي" : "Financial"}
              </option>
              <option value="health">{isRTL ? "الصحة" : "Health"}</option>
            </select>
          </FormField>

          <FormField label={isRTL ? "التكرار" : "Frequency"} required>
            <select
              className={selectCls}
              value={schedFrequency}
              onChange={(e) => setSchedFrequency(e.target.value)}
            >
              <option value="daily">{isRTL ? "يومي" : "Daily"}</option>
              <option value="weekly">{isRTL ? "أسبوعي" : "Weekly"}</option>
              <option value="monthly">{isRTL ? "شهري" : "Monthly"}</option>
            </select>
          </FormField>

          <FormField label={isRTL ? "صيغة الملف" : "Format"} required>
            <select
              className={selectCls}
              value={schedFormat}
              onChange={(e) => setSchedFormat(e.target.value)}
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
            </select>
          </FormField>

          <FormField
            label={isRTL ? "البريد الإلكتروني" : "Delivery Email"}
            required
          >
            <input
              type="email"
              className={inputCls}
              placeholder={
                isRTL ? "admin@example.com" : "admin@example.com"
              }
              value={schedEmail}
              onChange={(e) => setSchedEmail(e.target.value)}
            />
          </FormField>
        </div>
      </FormDialog>

      {/* ─── Header ──────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              {t.print}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setScheduleOpen(true)}
            >
              <Clock className="h-4 w-4" />
              {t.schedule}
            </Button>
            <Button
              className="gap-2"
              onClick={() => setGenerateOpen(true)}
            >
              <FileText className="h-4 w-4" />
              {t.generate}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title={t.totalReportsLabel}
            value={totalReports.toString()}
            change={isRTL ? "6 أنواع" : "6 types"}
            changeType="neutral"
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title={t.generatedThisMonth}
            value="24"
            change="+8 vs last month"
            changeType="positive"
            icon={BarChart3}
            iconColor="bg-secondary/10 text-secondary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title={t.scheduledReportsLabel}
            value={scheduledReports.toString()}
            change={isRTL ? "نشط" : "Active"}
            changeType="neutral"
            icon={Clock}
            iconColor="bg-success/10 text-success"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title={t.dataPoints}
            value="12,480"
            change={isRTL ? "محدث اليوم" : "Updated today"}
            changeType="neutral"
            icon={PieChart}
            iconColor="bg-accent/10 text-accent"
          />
        </motion.div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {t.charts}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <FileText className="h-4 w-4" />
              {t.reportTemplates}
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5">
              <Lightbulb className="h-4 w-4" />
              {t.aiInsights}
            </TabsTrigger>
          </TabsList>

          {/* ── Charts Tab ───────────────────────────────────── */}
          <TabsContent value="charts">
            {/* Date Range Filter */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                {t.filterDate}:
              </div>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={filterStart}
                onChange={(e) => setFilterStart(Number(e.target.value))}
              >
                {allEnrollmentData.map((d, i) => (
                  <option key={i} value={i}>
                    {d.month}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">→</span>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={filterEnd}
                onChange={(e) => setFilterEnd(Number(e.target.value))}
              >
                {allEnrollmentData.map((d, i) => (
                  <option key={i} value={i}>
                    {d.month}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* ── Enrollment Trend (Bar Chart) ─────────────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        {t.enrollment}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge variant="success" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" /> +12.3%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleExportChart(isRTL ? "اتجاه التسجيل" : "Enrollment Trend")}
                          title={t.exportChart}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BarChartSVG
                      data={filteredEnrollment.map((d) => ({
                        label: d.month,
                        value: d.value,
                      }))}
                      maxVal={maxEnrollment}
                      color="fill-primary"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Attendance Pie Chart ──────────────────────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-emerald-500" />
                        {t.attendance}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge variant="warning" className="gap-1">
                          <ArrowDownRight className="h-3 w-3" /> -2.1%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleExportChart(
                              isRTL ? "توزيع الحضور" : "Attendance Distribution"
                            )
                          }
                          title={t.exportChart}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PieChartSVG segments={attendancePieData} />
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Development Domains (Horizontal Bars) ─────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        {t.development}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          handleExportChart(
                            isRTL ? "مجالات التطور" : "Development Domains"
                          )
                        }
                        title={t.exportChart}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {developmentData.map((d, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span>{d.domain}</span>
                            <span
                              className={`font-bold ${
                                d.value >= 80
                                  ? "text-success"
                                  : d.value >= 70
                                    ? "text-warning"
                                    : "text-destructive"
                              }`}
                            >
                              {d.value}%
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              className={`h-full rounded-full ${
                                d.value >= 80
                                  ? "bg-success"
                                  : d.value >= 70
                                    ? "bg-warning"
                                    : "bg-destructive"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${d.value}%` }}
                              transition={{
                                delay: 0.5 + i * 0.1,
                                duration: 0.6,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── Revenue Trend (Line Chart) ────────────────── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        {t.revenue}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Badge variant="success" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" /> +8.2%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleExportChart(
                              isRTL ? "اتجاه الإيرادات" : "Revenue Trend"
                            )
                          }
                          title={t.exportChart}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LineTrendSVG
                      data={revenueData.map((d) => ({
                        label: d.month,
                        value: d.value,
                      }))}
                      maxVal={maxRevenue}
                      color="stop-accent text-accent"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── Report Templates Tab ─────────────────────────── */}
          <TabsContent value="templates">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardContent className="p-5">
                      <div
                        className={`mb-4 w-fit rounded-xl p-2.5 ${template.color}`}
                      >
                        <template.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold mb-1">{template.title}</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {template.frequency === "weekly"
                            ? isRTL
                              ? "أسبوعي"
                              : "Weekly"
                            : template.frequency === "monthly"
                              ? t.monthly
                              : template.frequency === "quarterly"
                                ? t.quarterly
                                : t.annual}
                        </Badge>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleTemplateGenerate(template)}
                        >
                          <Download className="h-3 w-3" />
                          {t.generateBtn}
                        </Button>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {t.lastGenerated}: {template.lastGenerated}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── AI Insights Tab ───────────────────────────────── */}
          <TabsContent value="ai">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  {isRTL
                    ? "رؤى مولّدة بالذكاء الاصطناعي"
                    : "AI-Generated Insights"}
                </h3>
                <Badge variant="info">
                  {isRTL ? "محدث اليوم" : "Updated today"}
                </Badge>
                {insights.some((i) => i.dismissed) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto gap-1 text-xs"
                    onClick={() => {
                      setInsights((prev) =>
                        prev.map((ins) => ({ ...ins, dismissed: false }))
                      );
                      info(
                        isRTL ? "تمت الاستعادة" : "Restored",
                        isRTL
                          ? "تمت استعادة جميع الرؤى المتجاهلة"
                          : "All dismissed insights have been restored"
                      );
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                    {isRTL ? "استعادة الكل" : "Restore All"}
                  </Button>
                )}
              </div>

              {activeInsights.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                    <Lightbulb className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? "تم تجاهل جميع الرؤى. اضغط على استعادة الكل لإعادتها."
                        : "All insights dismissed. Click Restore All to bring them back."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {activeInsights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className={`transition-all hover:shadow-md ${
                      insight.type === "positive"
                        ? "border-success/30 bg-success/5"
                        : insight.type === "warning"
                          ? "border-warning/30 bg-warning/5"
                          : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <CardContent className="flex flex-col sm:flex-row items-start gap-4 p-5">
                      <div
                        className={`rounded-xl p-2.5 flex-shrink-0 ${
                          insight.type === "positive"
                            ? "bg-success/10 text-success"
                            : insight.type === "warning"
                              ? "bg-warning/10 text-warning"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        <insight.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge
                            variant={
                              insight.confidence >= 90
                                ? "success"
                                : insight.confidence >= 80
                                  ? "info"
                                  : "warning"
                            }
                            className="text-[10px]"
                          >
                            {t.confidence}: {insight.confidence}%
                          </Badge>
                          {insight.applied && (
                            <Badge variant="success" className="gap-1 text-[10px]">
                              <Check className="h-3 w-3" />
                              {isRTL ? "مطبق" : "Applied"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.insight}
                        </p>
                        <div className="flex items-start gap-2 rounded-lg bg-white/60 border border-gray-100 p-2.5 mb-3">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-600">
                              {t.recommendation}:
                            </p>
                            <p className="text-xs text-gray-500">
                              {insight.recommendation}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!insight.applied && (
                            <Button
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={() => handleApplyInsight(insight.id)}
                            >
                              <Check className="h-3 w-3" />
                              {t.apply}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 text-xs"
                            onClick={() => handleDismissInsight(insight.id)}
                          >
                            <X className="h-3 w-3" />
                            {t.dismissBtn}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
