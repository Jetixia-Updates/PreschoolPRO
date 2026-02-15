"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast-container";
import { FormDialog, FormField } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Target,
  FileText,
  Download,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  GraduationCap,
  Lightbulb,
  Folder,
  Video,
  Image,
  Music,
  Star,
  FolderOpen,
  Brain,
  MessageCircle,
  Users,
  Dumbbell,
  Palette,
} from "lucide-react";

// ── animation helper ──────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ── types ─────────────────────────────────────────────
interface LessonPlan {
  id: number;
  title: string;
  domain: string;
  iscedLevel: string;
  duration: number;
  objectives: string;
  materials: string;
  activities: string;
  assessment: string;
  status: "active" | "draft";
}

interface LearningOutcome {
  id: number;
  title: string;
  domain: string;
  description: string;
  indicators: string;
  achieved: number;
}

interface Resource {
  id: number;
  name: string;
  type: "document" | "video" | "image" | "audio";
  domain: string;
  downloads: number;
}

// ── initial data builders (locale-aware) ──────────────
function buildLessonPlans(isRTL: boolean): LessonPlan[] {
  return [
    {
      id: 1,
      title: isRTL ? "استكشاف الألوان والأشكال" : "Exploring Colors & Shapes",
      domain: "cognitive",
      iscedLevel: "ISCED 0",
      duration: 30,
      objectives: isRTL
        ? "تمييز 8 ألوان أساسية\nربط الألوان بأشياء حقيقية\nتسمية 4 أشكال هندسية\nتصنيف أشياء حسب اللون"
        : "Identify 8 basic colors\nAssociate colors with real objects\nName 4 geometric shapes\nSort objects by color",
      materials: isRTL
        ? "بطاقات ألوان\nأشكال خشبية\nأقلام ملونة\nورق أبيض"
        : "Color flashcards\nWooden shapes\nColored pencils\nWhite paper",
      activities: isRTL
        ? "حلقة الألوان الصباحية\nلعبة تصنيف الأشكال\nالرسم الحر"
        : "Morning color circle\nShape sorting game\nFree drawing activity",
      assessment: isRTL
        ? "ملاحظة مباشرة أثناء النشاط وتسجيل النتائج"
        : "Direct observation during activity and results recording",
      status: "active",
    },
    {
      id: 2,
      title: isRTL ? "قصة وأغنية الأسبوع" : "Story & Song of the Week",
      domain: "language",
      iscedLevel: "ISCED 0",
      duration: 25,
      objectives: isRTL
        ? "الاستماع لقصة كاملة\nإعادة سرد الأحداث\nتعلم أغنية جديدة"
        : "Listen to a full story\nRetell events in order\nLearn a new song",
      materials: isRTL
        ? "كتاب قصة مصور\nمسجل صوت\nدمى أصابع"
        : "Illustrated storybook\nAudio recorder\nFinger puppets",
      activities: isRTL
        ? "قراءة القصة التفاعلية\nترديد الأغنية\nتمثيل القصة"
        : "Interactive story reading\nSong rehearsal\nStory role-play",
      assessment: isRTL
        ? "تقييم قدرة الطفل على إعادة السرد"
        : "Assess child's ability to retell the story",
      status: "active",
    },
    {
      id: 3,
      title: isRTL ? "اللعب التعاوني" : "Cooperative Play",
      domain: "social",
      iscedLevel: "ISCED 0",
      duration: 40,
      objectives: isRTL
        ? "المشاركة في نشاط جماعي\nاحترام الأدوار\nالتواصل مع الأقران\nحل النزاعات البسيطة\nالانتظار للدور"
        : "Participate in group activity\nRespect assigned roles\nCommunicate with peers\nResolve simple conflicts\nWait for turns",
      materials: isRTL
        ? "مكعبات بناء كبيرة\nأدوات لعب تمثيلي\nبطاقات أدوار"
        : "Large building blocks\nRole-play props\nRole cards",
      activities: isRTL
        ? "بناء جماعي\nلعب أدوار\nحل مشكلة مشتركة"
        : "Group building\nRole playing\nShared problem solving",
      assessment: isRTL
        ? "ملاحظة التفاعل الاجتماعي وتسجيل السلوكيات"
        : "Observe social interaction and record behaviors",
      status: "active",
    },
    {
      id: 4,
      title: isRTL ? "حركة وإيقاع" : "Movement & Rhythm",
      domain: "physical",
      iscedLevel: "ISCED 0",
      duration: 35,
      objectives: isRTL
        ? "الجري والقفز بتوازن\nتقليد حركات إيقاعية\nتطوير المهارات الحركية"
        : "Run and jump with balance\nImitate rhythmic movements\nDevelop motor skills",
      materials: isRTL
        ? "مسجل موسيقى\nأطواق\nكرات صغيرة\nشرائط ملونة"
        : "Music player\nHula hoops\nSmall balls\nColorful ribbons",
      activities: isRTL
        ? "إحماء موسيقي\nمسار حركي\nرقص حر"
        : "Musical warm-up\nMovement course\nFree dance",
      assessment: isRTL
        ? "تقييم التوازن والتنسيق الحركي"
        : "Evaluate balance and motor coordination",
      status: "draft",
    },
    {
      id: 5,
      title: isRTL ? "الرسم بالأصابع" : "Finger Painting Fun",
      domain: "creative",
      iscedLevel: "ISCED 0",
      duration: 30,
      objectives: isRTL
        ? "التعبير الفني الحر\nمزج الألوان"
        : "Free artistic expression\nColor mixing",
      materials: isRTL
        ? "ألوان أصابع آمنة\nأوراق كبيرة\nمرايل"
        : "Safe finger paints\nLarge paper sheets\nAprons",
      activities: isRTL
        ? "تجربة مزج الألوان\nرسم حر\nعرض الأعمال"
        : "Color mixing experiment\nFree painting\nArtwork display",
      assessment: isRTL
        ? "تقييم الإبداع والمشاركة"
        : "Evaluate creativity and participation",
      status: "active",
    },
    {
      id: 6,
      title: isRTL ? "العد واللعب" : "Counting & Play",
      domain: "cognitive",
      iscedLevel: "ISCED 0",
      duration: 25,
      objectives: isRTL
        ? "العد من 1 إلى 10\nربط الأرقام بالكميات\nحل مسائل بسيطة\nتصنيف حسب العدد"
        : "Count from 1 to 10\nMatch numbers to quantities\nSolve simple problems\nSort by number",
      materials: isRTL
        ? "بطاقات أرقام\nخرز عد\nلوح مغناطيسي\nأشكال عد ملونة"
        : "Number cards\nCounting beads\nMagnetic board\nColored counting shapes",
      activities: isRTL
        ? "حلقة الأرقام\nلعبة عد تفاعلية\nتمارين على اللوح"
        : "Number circle\nInteractive counting game\nBoard exercises",
      assessment: isRTL
        ? "اختبار شفهي للعد والتصنيف"
        : "Oral test for counting and sorting",
      status: "active",
    },
  ];
}

function buildLearningOutcomes(isRTL: boolean): LearningOutcome[] {
  return [
    {
      id: 1,
      title: isRTL ? "التعرف على 8 ألوان أساسية" : "Identify 8 basic colors",
      domain: "cognitive",
      description: isRTL
        ? "يستطيع الطفل تمييز وتسمية 8 ألوان أساسية بشكل مستقل"
        : "Child can distinguish and name 8 basic colors independently",
      indicators: isRTL
        ? "يشير إلى الألوان عند الطلب\nيسمي الألوان بدون مساعدة\nيصنف أشياء حسب اللون"
        : "Points to colors when asked\nNames colors without help\nSorts objects by color",
      achieved: 85,
    },
    {
      id: 2,
      title: isRTL ? "تكوين جملة من 3-4 كلمات" : "Form 3-4 word sentences",
      domain: "language",
      description: isRTL
        ? "يستطيع الطفل تكوين جمل بسيطة من 3 إلى 4 كلمات"
        : "Child can form simple sentences of 3-4 words",
      indicators: isRTL
        ? "يستخدم جملاً في المحادثة\nيعبر عن احتياجاته بجمل\nيسرد أحداثاً بسيطة"
        : "Uses sentences in conversation\nExpresses needs in sentences\nNarrates simple events",
      achieved: 72,
    },
    {
      id: 3,
      title: isRTL ? "المشاركة في أنشطة جماعية" : "Participate in group activities",
      domain: "social",
      description: isRTL
        ? "يشارك الطفل بفاعلية في الأنشطة الجماعية ويتعاون مع أقرانه"
        : "Child actively participates in group activities and cooperates with peers",
      indicators: isRTL
        ? "ينضم للمجموعة طوعاً\nيشارك الأدوات\nينتظر دوره"
        : "Joins group voluntarily\nShares tools\nWaits for turn",
      achieved: 90,
    },
    {
      id: 4,
      title: isRTL ? "الجري والقفز بثبات" : "Run and jump with stability",
      domain: "physical",
      description: isRTL
        ? "يستطيع الطفل الجري والقفز مع الحفاظ على التوازن"
        : "Child can run and jump while maintaining balance",
      indicators: isRTL
        ? "يجري بدون تعثر\nيقفز بقدمين معاً\nيمشي على خط مستقيم"
        : "Runs without stumbling\nJumps with both feet\nWalks on a straight line",
      achieved: 88,
    },
    {
      id: 5,
      title: isRTL ? "التعبير الفني الحر" : "Express through free art",
      domain: "creative",
      description: isRTL
        ? "يعبر الطفل عن مشاعره وأفكاره من خلال الفن"
        : "Child expresses feelings and ideas through art",
      indicators: isRTL
        ? "يختار الألوان بنفسه\nيرسم أشكالاً معبرة\nيصف عمله الفني"
        : "Chooses colors independently\nDraws expressive shapes\nDescribes own artwork",
      achieved: 95,
    },
    {
      id: 6,
      title: isRTL ? "العد من 1 إلى 10" : "Count from 1 to 10",
      domain: "cognitive",
      description: isRTL
        ? "يستطيع الطفل العد من 1 إلى 10 وربط كل رقم بالكمية المناسبة"
        : "Child can count from 1 to 10 and match each number with the appropriate quantity",
      indicators: isRTL
        ? "يعد بالترتيب\nيربط الرقم بالكمية\nيحل مسائل بسيطة"
        : "Counts in order\nMatches number to quantity\nSolves simple problems",
      achieved: 68,
    },
  ];
}

function buildResources(isRTL: boolean): Resource[] {
  return [
    { id: 1, name: isRTL ? "بطاقات الألوان" : "Color Flashcards", type: "image", domain: "cognitive", downloads: 45 },
    { id: 2, name: isRTL ? "أغاني الحروف" : "Alphabet Songs", type: "audio", domain: "language", downloads: 120 },
    { id: 3, name: isRTL ? "فيديو اللعب التعاوني" : "Cooperative Play Video", type: "video", domain: "social", downloads: 38 },
    { id: 4, name: isRTL ? "تمارين حركية" : "Motor Skill Exercises", type: "document", domain: "physical", downloads: 67 },
    { id: 5, name: isRTL ? "قوالب فنية" : "Art Templates", type: "image", domain: "creative", downloads: 89 },
    { id: 6, name: isRTL ? "ألغاز تعليمية" : "Educational Puzzles", type: "document", domain: "cognitive", downloads: 55 },
    { id: 7, name: isRTL ? "قصص مصورة" : "Picture Stories", type: "document", domain: "language", downloads: 98 },
    { id: 8, name: isRTL ? "أنشطة موسيقية" : "Musical Activities", type: "audio", domain: "creative", downloads: 72 },
  ];
}

// ── component ─────────────────────────────────────────
export default function CurriculumPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toasts, success, dismiss } = useToast();

  // ── search / filter state ───────────────────────────
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("plans");

  // ── data state ──────────────────────────────────────
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => buildLessonPlans(isRTL));
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(() => buildLearningOutcomes(isRTL));
  const [resources] = useState<Resource[]>(() => buildResources(isRTL));

  // ── dialog state: add / edit lesson plan ────────────
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    title: "",
    domain: "cognitive",
    iscedLevel: "ISCED 0",
    duration: 30,
    objectives: "",
    materials: "",
    activities: "",
    assessment: "",
  });

  // ── dialog state: delete lesson plan ────────────────
  const [deletePlanOpen, setDeletePlanOpen] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);

  // ── dialog state: add learning outcome ──────────────
  const [addOutcomeOpen, setAddOutcomeOpen] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    title: "",
    domain: "cognitive",
    description: "",
    indicators: "",
  });

  // ── translations ────────────────────────────────────
  const t = {
    title: isRTL ? "إدارة المناهج" : "Curriculum Management",
    subtitle: isRTL ? "خطط الدروس والموارد ومخرجات التعلم" : "Lesson plans, resources, and learning outcomes",
    lessonPlans: isRTL ? "خطط الدروس" : "Lesson Plans",
    weeklySchedule: isRTL ? "الجدول الأسبوعي" : "Weekly Schedule",
    learningOutcomes: isRTL ? "مخرجات التعلم" : "Learning Outcomes",
    resources: isRTL ? "مكتبة الموارد" : "Resource Library",
    addPlan: isRTL ? "إضافة خطة" : "Add Plan",
    addOutcome: isRTL ? "إضافة مخرج تعلم" : "Add Outcome",
    search: isRTL ? "البحث..." : "Search...",
    allDomains: isRTL ? "جميع المجالات" : "All Domains",
    cognitive: isRTL ? "المعرفي" : "Cognitive",
    language: isRTL ? "اللغة" : "Language",
    social: isRTL ? "الاجتماعي" : "Social",
    physical: isRTL ? "الجسدي" : "Physical",
    creative: isRTL ? "الإبداعي" : "Creative",
    totalPlans: isRTL ? "إجمالي الخطط" : "Total Plans",
    activeThemes: isRTL ? "المواضيع النشطة" : "Active Themes",
    resourcesAvailable: isRTL ? "الموارد المتاحة" : "Resources Available",
    outcomesTracked: isRTL ? "المخرجات المتتبعة" : "Outcomes Tracked",
    duration: isRTL ? "المدة" : "Duration",
    domain: isRTL ? "المجال" : "Domain",
    mins: isRTL ? "دقيقة" : "mins",
    edit: isRTL ? "تعديل" : "Edit",
    delete: isRTL ? "حذف" : "Delete",
    save: isRTL ? "حفظ" : "Save",
    cancel: isRTL ? "إلغاء" : "Cancel",
    download: isRTL ? "تحميل" : "Download",
    planTitle: isRTL ? "عنوان الخطة" : "Plan Title",
    iscedLevel: isRTL ? "مستوى ISCED" : "ISCED Level",
    objectives: isRTL ? "الأهداف" : "Objectives",
    materials: isRTL ? "المواد" : "Materials",
    activities: isRTL ? "الأنشطة" : "Activities",
    assessment: isRTL ? "التقييم" : "Assessment",
    outcomeTitle: isRTL ? "عنوان المخرج" : "Outcome Title",
    description: isRTL ? "الوصف" : "Description",
    indicators: isRTL ? "المؤشرات" : "Indicators",
    addPlanTitle: isRTL ? "إضافة خطة درس جديدة" : "Add New Lesson Plan",
    editPlanTitle: isRTL ? "تعديل خطة الدرس" : "Edit Lesson Plan",
    deletePlanTitle: isRTL ? "حذف خطة الدرس" : "Delete Lesson Plan",
    deletePlanDesc: isRTL
      ? "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء."
      : "Are you sure you want to delete this lesson plan? This action cannot be undone.",
    addOutcomeTitle: isRTL ? "إضافة مخرج تعلم جديد" : "Add New Learning Outcome",
    confirm: isRTL ? "تأكيد" : "Confirm",
  };

  // ── weekly schedule (static) ────────────────────────
  const weekDays = isRTL
    ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"]
    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const weeklyScheduleData = [
    {
      time: "8:00 - 8:30",
      activities: [
        isRTL ? "حلقة الصباح" : "Morning Circle",
        isRTL ? "حلقة الصباح" : "Morning Circle",
        isRTL ? "حلقة الصباح" : "Morning Circle",
        isRTL ? "حلقة الصباح" : "Morning Circle",
        isRTL ? "حلقة الصباح" : "Morning Circle",
      ],
    },
    {
      time: "8:30 - 9:15",
      activities: [
        isRTL ? "ألوان وأشكال" : "Colors & Shapes",
        isRTL ? "قصة وأغنية" : "Story & Song",
        isRTL ? "عد ولعب" : "Counting & Play",
        isRTL ? "لعب تعاوني" : "Cooperative Play",
        isRTL ? "رسم بالأصابع" : "Finger Painting",
      ],
    },
    {
      time: "9:15 - 9:45",
      activities: [
        isRTL ? "وجبة خفيفة" : "Snack",
        isRTL ? "وجبة خفيفة" : "Snack",
        isRTL ? "وجبة خفيفة" : "Snack",
        isRTL ? "وجبة خفيفة" : "Snack",
        isRTL ? "وجبة خفيفة" : "Snack",
      ],
    },
    {
      time: "9:45 - 10:30",
      activities: [
        isRTL ? "لعب خارجي" : "Outdoor Play",
        isRTL ? "حركة وإيقاع" : "Movement",
        isRTL ? "لعب خارجي" : "Outdoor Play",
        isRTL ? "حركة وإيقاع" : "Movement",
        isRTL ? "لعب خارجي" : "Outdoor Play",
      ],
    },
    {
      time: "10:30 - 11:15",
      activities: [
        isRTL ? "لعب حر" : "Free Play",
        isRTL ? "ألوان وأشكال" : "Colors & Shapes",
        isRTL ? "قصة وأغنية" : "Story & Song",
        isRTL ? "عد ولعب" : "Counting & Play",
        isRTL ? "لعب تعاوني" : "Cooperative Play",
      ],
    },
  ];

  // ── helpers ─────────────────────────────────────────
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "cognitive": return Brain;
      case "language": return MessageCircle;
      case "social": return Users;
      case "physical": return Dumbbell;
      case "creative": return Palette;
      default: return BookOpen;
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "cognitive": return "bg-blue-500/10 text-blue-600";
      case "language": return "bg-purple-500/10 text-purple-600";
      case "social": return "bg-pink-500/10 text-pink-600";
      case "physical": return "bg-green-500/10 text-green-600";
      case "creative": return "bg-orange-500/10 text-orange-600";
      default: return "bg-primary/10 text-primary";
    }
  };

  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case "cognitive": return t.cognitive;
      case "language": return t.language;
      case "social": return t.social;
      case "physical": return t.physical;
      case "creative": return t.creative;
      default: return domain;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "audio": return Music;
      case "image": return Image;
      case "document": return FileText;
      default: return FolderOpen;
    }
  };

  // ── filtering ───────────────────────────────────────
  const filteredPlans = lessonPlans.filter((plan) => {
    const matchesSearch = plan.title.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === "all" || plan.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const filteredOutcomes = learningOutcomes.filter((o) => {
    const matchesSearch = o.title.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === "all" || o.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === "all" || r.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  // ── lesson plan CRUD ────────────────────────────────
  const resetPlanForm = () =>
    setPlanForm({ title: "", domain: "cognitive", iscedLevel: "ISCED 0", duration: 30, objectives: "", materials: "", activities: "", assessment: "" });

  const openAddPlan = () => {
    resetPlanForm();
    setAddPlanOpen(true);
  };

  const handleAddPlan = () => {
    if (!planForm.title.trim()) return;
    const newPlan: LessonPlan = {
      id: Date.now(),
      title: planForm.title,
      domain: planForm.domain,
      iscedLevel: planForm.iscedLevel,
      duration: planForm.duration,
      objectives: planForm.objectives,
      materials: planForm.materials,
      activities: planForm.activities,
      assessment: planForm.assessment,
      status: "active",
    };
    setLessonPlans((prev) => [...prev, newPlan]);
    setAddPlanOpen(false);
    resetPlanForm();
    success(
      isRTL ? "تمت الإضافة" : "Plan Added",
      isRTL ? "تم إضافة خطة الدرس بنجاح" : "Lesson plan has been added successfully"
    );
  };

  const openEditPlan = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      title: plan.title,
      domain: plan.domain,
      iscedLevel: plan.iscedLevel,
      duration: plan.duration,
      objectives: plan.objectives,
      materials: plan.materials,
      activities: plan.activities,
      assessment: plan.assessment,
    });
    setEditPlanOpen(true);
  };

  const handleEditPlan = () => {
    if (!editingPlan || !planForm.title.trim()) return;
    setLessonPlans((prev) =>
      prev.map((p) =>
        p.id === editingPlan.id
          ? { ...p, title: planForm.title, domain: planForm.domain, iscedLevel: planForm.iscedLevel, duration: planForm.duration, objectives: planForm.objectives, materials: planForm.materials, activities: planForm.activities, assessment: planForm.assessment }
          : p
      )
    );
    setEditPlanOpen(false);
    setEditingPlan(null);
    resetPlanForm();
    success(
      isRTL ? "تم التحديث" : "Plan Updated",
      isRTL ? "تم تحديث خطة الدرس بنجاح" : "Lesson plan has been updated successfully"
    );
  };

  const openDeletePlan = (id: number) => {
    setDeletingPlanId(id);
    setDeletePlanOpen(true);
  };

  const handleDeletePlan = () => {
    if (deletingPlanId === null) return;
    setLessonPlans((prev) => prev.filter((p) => p.id !== deletingPlanId));
    setDeletePlanOpen(false);
    setDeletingPlanId(null);
    success(
      isRTL ? "تم الحذف" : "Plan Deleted",
      isRTL ? "تم حذف خطة الدرس بنجاح" : "Lesson plan has been deleted successfully"
    );
  };

  // ── learning outcome add ────────────────────────────
  const resetOutcomeForm = () =>
    setOutcomeForm({ title: "", domain: "cognitive", description: "", indicators: "" });

  const openAddOutcome = () => {
    resetOutcomeForm();
    setAddOutcomeOpen(true);
  };

  const handleAddOutcome = () => {
    if (!outcomeForm.title.trim()) return;
    const newOutcome: LearningOutcome = {
      id: Date.now(),
      title: outcomeForm.title,
      domain: outcomeForm.domain,
      description: outcomeForm.description,
      indicators: outcomeForm.indicators,
      achieved: 0,
    };
    setLearningOutcomes((prev) => [...prev, newOutcome]);
    setAddOutcomeOpen(false);
    resetOutcomeForm();
    success(
      isRTL ? "تمت الإضافة" : "Outcome Added",
      isRTL ? "تم إضافة مخرج التعلم بنجاح" : "Learning outcome has been added successfully"
    );
  };

  // ── download resource ───────────────────────────────
  const handleDownload = (resource: Resource) => {
    success(
      isRTL ? "جاري التحميل" : "Downloading",
      isRTL ? `جاري تحميل "${resource.name}"` : `Downloading "${resource.name}"`
    );
  };

  // ── shared form field styling ───────────────────────
  const inputClass =
    "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none";
  const selectClass =
    "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none";
  const textareaClass =
    "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:outline-none resize-none";

  // ── plan form fields (shared between add & edit) ────
  const renderPlanFormFields = () => (
    <div className="space-y-4">
      <FormField label={t.planTitle} required>
        <input
          className={inputClass}
          value={planForm.title}
          onChange={(e) => setPlanForm((f) => ({ ...f, title: e.target.value }))}
          placeholder={isRTL ? "أدخل عنوان الخطة" : "Enter plan title"}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.domain} required>
          <select
            className={selectClass}
            value={planForm.domain}
            onChange={(e) => setPlanForm((f) => ({ ...f, domain: e.target.value }))}
          >
            <option value="cognitive">{t.cognitive}</option>
            <option value="language">{t.language}</option>
            <option value="social">{t.social}</option>
            <option value="physical">{t.physical}</option>
            <option value="creative">{t.creative}</option>
          </select>
        </FormField>

        <FormField label={t.iscedLevel} required>
          <select
            className={selectClass}
            value={planForm.iscedLevel}
            onChange={(e) => setPlanForm((f) => ({ ...f, iscedLevel: e.target.value }))}
          >
            <option value="ISCED 0">ISCED 0 – Early childhood</option>
            <option value="ISCED 1">ISCED 1 – Primary</option>
            <option value="ISCED 2">ISCED 2 – Lower secondary</option>
          </select>
        </FormField>
      </div>

      <FormField label={`${t.duration} (${t.mins})`} required>
        <input
          type="number"
          className={inputClass}
          min={5}
          max={120}
          value={planForm.duration}
          onChange={(e) => setPlanForm((f) => ({ ...f, duration: Number(e.target.value) }))}
        />
      </FormField>

      <FormField label={t.objectives} required>
        <textarea
          className={textareaClass}
          rows={3}
          value={planForm.objectives}
          onChange={(e) => setPlanForm((f) => ({ ...f, objectives: e.target.value }))}
          placeholder={isRTL ? "هدف واحد في كل سطر" : "One objective per line"}
        />
      </FormField>

      <FormField label={t.materials}>
        <textarea
          className={textareaClass}
          rows={3}
          value={planForm.materials}
          onChange={(e) => setPlanForm((f) => ({ ...f, materials: e.target.value }))}
          placeholder={isRTL ? "مادة واحدة في كل سطر" : "One material per line"}
        />
      </FormField>

      <FormField label={t.activities}>
        <textarea
          className={textareaClass}
          rows={3}
          value={planForm.activities}
          onChange={(e) => setPlanForm((f) => ({ ...f, activities: e.target.value }))}
          placeholder={isRTL ? "نشاط واحد في كل سطر" : "One activity per line"}
        />
      </FormField>

      <FormField label={t.assessment}>
        <textarea
          className={textareaClass}
          rows={2}
          value={planForm.assessment}
          onChange={(e) => setPlanForm((f) => ({ ...f, assessment: e.target.value }))}
          placeholder={isRTL ? "وصف طريقة التقييم" : "Describe the assessment method"}
        />
      </FormField>
    </div>
  );

  // ── outcome form fields ─────────────────────────────
  const renderOutcomeFormFields = () => (
    <div className="space-y-4">
      <FormField label={t.outcomeTitle} required>
        <input
          className={inputClass}
          value={outcomeForm.title}
          onChange={(e) => setOutcomeForm((f) => ({ ...f, title: e.target.value }))}
          placeholder={isRTL ? "أدخل عنوان المخرج" : "Enter outcome title"}
        />
      </FormField>

      <FormField label={t.domain} required>
        <select
          className={selectClass}
          value={outcomeForm.domain}
          onChange={(e) => setOutcomeForm((f) => ({ ...f, domain: e.target.value }))}
        >
          <option value="cognitive">{t.cognitive}</option>
          <option value="language">{t.language}</option>
          <option value="social">{t.social}</option>
          <option value="physical">{t.physical}</option>
          <option value="creative">{t.creative}</option>
        </select>
      </FormField>

      <FormField label={t.description} required>
        <textarea
          className={textareaClass}
          rows={3}
          value={outcomeForm.description}
          onChange={(e) => setOutcomeForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={isRTL ? "وصف مخرج التعلم" : "Describe the learning outcome"}
        />
      </FormField>

      <FormField label={t.indicators}>
        <textarea
          className={textareaClass}
          rows={3}
          value={outcomeForm.indicators}
          onChange={(e) => setOutcomeForm((f) => ({ ...f, indicators: e.target.value }))}
          placeholder={isRTL ? "مؤشر واحد في كل سطر" : "One indicator per line"}
        />
      </FormField>
    </div>
  );

  // ── count helpers for stat cards ────────────────────
  const activeCount = lessonPlans.filter((p) => p.status === "active").length;
  const uniqueDomains = new Set(lessonPlans.map((p) => p.domain)).size;

  // ── render ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            {activeTab === "outcomes" && (
              <Button size="lg" variant="outline" className="gap-2" onClick={openAddOutcome}>
                <Lightbulb className="h-4 w-4" />
                {t.addOutcome}
              </Button>
            )}
            <Button size="lg" className="gap-2" onClick={openAddPlan}>
              <Plus className="h-4 w-4" />
              {t.addPlan}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title={t.totalPlans}
            value={String(lessonPlans.length)}
            change={`${activeCount} active`}
            changeType="neutral"
            icon={BookOpen}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title={t.activeThemes}
            value={String(uniqueDomains)}
            change={isRTL ? "مجالات مختلفة" : "Unique domains"}
            changeType="neutral"
            icon={Star}
            iconColor="bg-secondary/10 text-secondary"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title={t.resourcesAvailable}
            value={String(resources.length)}
            change={isRTL ? "ملفات متاحة" : "Files available"}
            changeType="positive"
            icon={FolderOpen}
            iconColor="bg-accent/10 text-accent"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title={t.outcomesTracked}
            value={String(learningOutcomes.length)}
            change={`${Math.round(learningOutcomes.reduce((s, o) => s + o.achieved, 0) / (learningOutcomes.length || 1))}% avg`}
            changeType="positive"
            icon={Target}
            iconColor="bg-success/10 text-success"
          />
        </motion.div>
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="plans" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              {t.lessonPlans}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              {t.weeklySchedule}
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {t.learningOutcomes}
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              <Folder className="h-4 w-4" />
              {t.resources}
            </TabsTrigger>
          </TabsList>

          {/* ─── Lesson Plans Tab ────────────────────── */}
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder={t.search}
                      icon={<Search className="h-4 w-4" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allDomains}</SelectItem>
                      <SelectItem value="cognitive">{t.cognitive}</SelectItem>
                      <SelectItem value="language">{t.language}</SelectItem>
                      <SelectItem value="social">{t.social}</SelectItem>
                      <SelectItem value="physical">{t.physical}</SelectItem>
                      <SelectItem value="creative">{t.creative}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-muted-foreground">{isRTL ? "لا توجد خطط مطابقة" : "No matching lesson plans"}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredPlans.map((plan, i) => {
                      const DomainIcon = getDomainIcon(plan.domain);
                      const objectiveCount = plan.objectives.split("\n").filter(Boolean).length;
                      const materialCount = plan.materials.split("\n").filter(Boolean).length;
                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <Card className="h-full transition-all hover:shadow-md">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className={`rounded-xl p-2 ${getDomainColor(plan.domain)}`}>
                                  <DomainIcon className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant={plan.status === "active" ? "success" : "outline"}>
                                    {plan.status === "active" ? (isRTL ? "نشط" : "Active") : (isRTL ? "مسودة" : "Draft")}
                                  </Badge>
                                </div>
                              </div>

                              <h3 className="font-semibold mb-1">{plan.title}</h3>
                              <Badge variant="outline" className="mb-3 text-[10px]">{plan.iscedLevel}</Badge>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {plan.duration} {t.mins}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Target className="h-3 w-3" /> {objectiveCount} {isRTL ? "أهداف" : "objectives"}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <FolderOpen className="h-3 w-3" /> {materialCount} {isRTL ? "مواد" : "materials"}
                                </span>
                              </div>

                              <div className="mt-3 flex items-center justify-between border-t pt-3">
                                <Badge variant="info">{getDomainLabel(plan.domain)}</Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                                    onClick={() => openEditPlan(plan)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                                    onClick={() => openDeletePlan(plan.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Weekly Schedule Tab ─────────────────── */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-primary" />
                  {isRTL ? "الجدول الأسبوعي — الأسبوع الحالي" : "Weekly Schedule — Current Week"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    {/* Header */}
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      <div className="text-xs font-medium text-muted-foreground p-2">
                        {isRTL ? "الوقت" : "Time"}
                      </div>
                      {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-semibold p-2 rounded-lg bg-muted">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Rows */}
                    {weeklyScheduleData.map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="grid grid-cols-6 gap-2 mb-2"
                      >
                        <div className="text-xs font-mono text-muted-foreground p-2 flex items-center">
                          {row.time}
                        </div>
                        {row.activities.map((activity, ai) => (
                          <div
                            key={ai}
                            className="rounded-lg bg-primary/5 p-2 text-center text-xs font-medium hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            {activity}
                          </div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Learning Outcomes Tab ────────────────── */}
          <TabsContent value="outcomes">
            {/* Search / Filter bar */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder={t.search}
                      icon={<Search className="h-4 w-4" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allDomains}</SelectItem>
                      <SelectItem value="cognitive">{t.cognitive}</SelectItem>
                      <SelectItem value="language">{t.language}</SelectItem>
                      <SelectItem value="social">{t.social}</SelectItem>
                      <SelectItem value="physical">{t.physical}</SelectItem>
                      <SelectItem value="creative">{t.creative}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="gap-2" onClick={openAddOutcome}>
                    <Plus className="h-4 w-4" />
                    {t.addOutcome}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {filteredOutcomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">{isRTL ? "لا توجد مخرجات مطابقة" : "No matching outcomes"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOutcomes.map((outcome, i) => {
                  const OutcomeIcon = getDomainIcon(outcome.domain);
                  const indicatorList = outcome.indicators.split("\n").filter(Boolean);
                  return (
                    <motion.div
                      key={outcome.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`rounded-xl p-2.5 ${getDomainColor(outcome.domain)}`}>
                              <OutcomeIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold">{outcome.title}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">{outcome.description}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="info">{getDomainLabel(outcome.domain)}</Badge>
                              </div>
                              {indicatorList.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  {indicatorList.map((ind, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Lightbulb className="h-3 w-3 shrink-0 text-amber-500" />
                                      {ind}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-end w-20 shrink-0">
                              <p
                                className={`text-lg font-bold ${
                                  outcome.achieved >= 80
                                    ? "text-success"
                                    : outcome.achieved >= 60
                                      ? "text-warning"
                                      : "text-destructive"
                                }`}
                              >
                                {outcome.achieved}%
                              </p>
                              <p className="text-[10px] text-muted-foreground">{isRTL ? "محقق" : "achieved"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Resource Library Tab ─────────────────── */}
          <TabsContent value="resources">
            {/* Search / Filter bar */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder={t.search}
                      icon={<Search className="h-4 w-4" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allDomains}</SelectItem>
                      <SelectItem value="cognitive">{t.cognitive}</SelectItem>
                      <SelectItem value="language">{t.language}</SelectItem>
                      <SelectItem value="social">{t.social}</SelectItem>
                      <SelectItem value="physical">{t.physical}</SelectItem>
                      <SelectItem value="creative">{t.creative}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Folder className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">{isRTL ? "لا توجد موارد مطابقة" : "No matching resources"}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredResources.map((resource, i) => {
                  const ResIcon = getResourceIcon(resource.type);
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="h-full transition-all hover:shadow-md">
                        <CardContent className="p-4 text-center">
                          <div className={`mx-auto mb-3 w-fit rounded-xl p-3 ${getDomainColor(resource.domain)}`}>
                            <ResIcon className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-semibold mb-1">{resource.name}</h4>
                          <Badge variant="outline" className="mb-2">
                            {getDomainLabel(resource.domain)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mb-3">
                            <Download className="me-1 inline h-3 w-3" />
                            {resource.downloads} {isRTL ? "تحميل" : "downloads"}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5"
                            onClick={() => handleDownload(resource)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t.download}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ── Dialogs ─────────────────────────────────── */}

      {/* Add Lesson Plan */}
      <FormDialog
        open={addPlanOpen}
        title={t.addPlanTitle}
        description={isRTL ? "أدخل تفاصيل خطة الدرس الجديدة" : "Enter the details for the new lesson plan"}
        onClose={() => setAddPlanOpen(false)}
        onSubmit={handleAddPlan}
        submitLabel={t.save}
        cancelLabel={t.cancel}
        size="lg"
      >
        {renderPlanFormFields()}
      </FormDialog>

      {/* Edit Lesson Plan */}
      <FormDialog
        open={editPlanOpen}
        title={t.editPlanTitle}
        description={isRTL ? "قم بتعديل تفاصيل خطة الدرس" : "Modify the lesson plan details"}
        onClose={() => { setEditPlanOpen(false); setEditingPlan(null); }}
        onSubmit={handleEditPlan}
        submitLabel={t.save}
        cancelLabel={t.cancel}
        size="lg"
      >
        {renderPlanFormFields()}
      </FormDialog>

      {/* Delete Lesson Plan */}
      <ConfirmDialog
        open={deletePlanOpen}
        title={t.deletePlanTitle}
        description={t.deletePlanDesc}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        variant="danger"
        onConfirm={handleDeletePlan}
        onCancel={() => { setDeletePlanOpen(false); setDeletingPlanId(null); }}
      />

      {/* Add Learning Outcome */}
      <FormDialog
        open={addOutcomeOpen}
        title={t.addOutcomeTitle}
        description={isRTL ? "أدخل تفاصيل مخرج التعلم الجديد" : "Enter the details for the new learning outcome"}
        onClose={() => setAddOutcomeOpen(false)}
        onSubmit={handleAddOutcome}
        submitLabel={t.save}
        cancelLabel={t.cancel}
        size="md"
      >
        {renderOutcomeFormFields()}
      </FormDialog>

      {/* ── Toasts ──────────────────────────────────── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
