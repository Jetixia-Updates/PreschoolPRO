"use client";

import React, { useState, useMemo } from "react";
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
  DollarSign,
  FileText,
  Download,
  Eye,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Receipt,
  TrendingUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  student: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidDate: string | null;
  items: InvoiceItem[];
}

interface PaymentPlan {
  id: string;
  student: string;
  totalAmount: number;
  installments: number;
  frequency: "weekly" | "monthly" | "quarterly";
  paidInstallments: number;
  startDate: string;
}

interface Transaction {
  id: number;
  student: string;
  amount: number;
  type: "payment" | "refund" | "plan_payment";
  date: string;
  method: string;
}

// ─── Animation ────────────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    student: "Ahmed Al-Omari",
    description: "Spring Semester Tuition",
    amount: 7000,
    dueDate: "2026-02-28",
    status: "paid",
    paidDate: "2026-02-10",
    items: [
      { description: "Tuition Fee", amount: 5500 },
      { description: "Lab Materials", amount: 800 },
      { description: "Activity Fee", amount: 700 },
    ],
  },
  {
    id: "INV-2026-002",
    student: "Sara Al-Hassan",
    description: "Spring Semester Tuition",
    amount: 3500,
    dueDate: "2026-02-28",
    status: "pending",
    paidDate: null,
    items: [
      { description: "Tuition Fee", amount: 3000 },
      { description: "Activity Fee", amount: 500 },
    ],
  },
  {
    id: "INV-2026-003",
    student: "Omar Al-Saeed",
    description: "Spring Semester Tuition",
    amount: 3500,
    dueDate: "2026-02-28",
    status: "paid",
    paidDate: "2026-02-12",
    items: [
      { description: "Tuition Fee", amount: 3000 },
      { description: "Lab Materials", amount: 500 },
    ],
  },
  {
    id: "INV-2026-004",
    student: "Layla Ibrahim",
    description: "Winter Semester Balance",
    amount: 3500,
    dueDate: "2026-01-31",
    status: "overdue",
    paidDate: null,
    items: [
      { description: "Outstanding Tuition", amount: 2800 },
      { description: "Late Registration Fee", amount: 700 },
    ],
  },
  {
    id: "INV-2026-005",
    student: "Khalid Al-Harbi",
    description: "Spring Semester Tuition",
    amount: 7000,
    dueDate: "2026-02-28",
    status: "paid",
    paidDate: "2026-02-05",
    items: [
      { description: "Tuition Fee", amount: 5500 },
      { description: "Lab Materials", amount: 800 },
      { description: "Activity Fee", amount: 700 },
    ],
  },
  {
    id: "INV-2026-006",
    student: "Nora Al-Shammari",
    description: "Spring Semester Tuition",
    amount: 3500,
    dueDate: "2026-02-28",
    status: "pending",
    paidDate: null,
    items: [
      { description: "Tuition Fee", amount: 3000 },
      { description: "Activity Fee", amount: 500 },
    ],
  },
  {
    id: "INV-2026-007",
    student: "Faisal Al-Dosari",
    description: "Spring Semester Tuition",
    amount: 3500,
    dueDate: "2026-02-28",
    status: "paid",
    paidDate: "2026-02-08",
    items: [
      { description: "Tuition Fee", amount: 3000 },
      { description: "Activity Fee", amount: 500 },
    ],
  },
  {
    id: "INV-2026-008",
    student: "Reem Al-Mansour",
    description: "Spring Semester Tuition",
    amount: 7000,
    dueDate: "2026-02-28",
    status: "paid",
    paidDate: "2026-02-14",
    items: [
      { description: "Tuition Fee", amount: 5500 },
      { description: "Lab Materials", amount: 800 },
      { description: "Activity Fee", amount: 700 },
    ],
  },
];

const initialPaymentPlans: PaymentPlan[] = [
  {
    id: "PP-001",
    student: "Layla Ibrahim",
    totalAmount: 12000,
    installments: 6,
    frequency: "monthly",
    paidInstallments: 3,
    startDate: "2025-09-01",
  },
  {
    id: "PP-002",
    student: "Sara Al-Hassan",
    totalAmount: 9000,
    installments: 4,
    frequency: "quarterly",
    paidInstallments: 1,
    startDate: "2025-10-01",
  },
  {
    id: "PP-003",
    student: "Nora Al-Shammari",
    totalAmount: 7000,
    installments: 3,
    frequency: "monthly",
    paidInstallments: 2,
    startDate: "2025-11-01",
  },
];

const initialTransactions: Transaction[] = [
  { id: 1, student: "Reem Al-Mansour", amount: 7000, type: "payment", date: "Feb 14, 2026", method: "Bank Transfer" },
  { id: 2, student: "Khalid Al-Harbi", amount: 7000, type: "payment", date: "Feb 5, 2026", method: "Credit Card" },
  { id: 3, student: "Omar Al-Saeed", amount: 3500, type: "payment", date: "Feb 12, 2026", method: "Cash" },
  { id: 4, student: "Ahmed Al-Omari", amount: 7000, type: "payment", date: "Feb 10, 2026", method: "Bank Transfer" },
  { id: 5, student: "Faisal Al-Dosari", amount: 3500, type: "plan_payment", date: "Feb 8, 2026", method: "Credit Card" },
  { id: 6, student: "Layla Ibrahim", amount: -500, type: "refund", date: "Feb 3, 2026", method: "Refund" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const toast = useToast();

  // ── State ──
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(initialPaymentPlans);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");

  // Dialog states
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const [addPlanOpen, setAddPlanOpen] = useState(false);

  // Create invoice form
  const [newInvoice, setNewInvoice] = useState({
    student: "",
    description: "",
    dueDate: "",
    items: [{ description: "", amount: 0 }] as InvoiceItem[],
  });

  // Add payment plan form
  const [newPlan, setNewPlan] = useState({
    student: "",
    totalAmount: 0,
    installments: 3,
    frequency: "monthly" as "weekly" | "monthly" | "quarterly",
  });

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const pendingAmount = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
    const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const paidCount = invoices.filter((i) => i.status === "paid").length;
    const collectionRate = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;
    return { totalRevenue, pendingAmount, overdueAmount, collectionRate };
  }, [invoices]);

  // ── Filtered Invoices ──
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.student.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  // ── Handlers ──

  function handleCreateInvoice() {
    if (!newInvoice.student.trim() || !newInvoice.description.trim() || !newInvoice.dueDate) {
      toast.warning("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const validItems = newInvoice.items.filter((item) => item.description.trim() && item.amount > 0);
    if (validItems.length === 0) {
      toast.warning("Missing Items", "Please add at least one line item with a description and amount.");
      return;
    }
    const totalAmount = validItems.reduce((s, item) => s + item.amount, 0);
    const nextNum = invoices.length + 1;
    const invoice: Invoice = {
      id: `INV-2026-${String(nextNum).padStart(3, "0")}`,
      student: newInvoice.student,
      description: newInvoice.description,
      amount: totalAmount,
      dueDate: newInvoice.dueDate,
      status: "pending",
      paidDate: null,
      items: validItems,
    };
    setInvoices((prev) => [invoice, ...prev]);
    setCreateInvoiceOpen(false);
    setNewInvoice({ student: "", description: "", dueDate: "", items: [{ description: "", amount: 0 }] });
    toast.success("Invoice Created", `Invoice ${invoice.id} for ${invoice.student} has been created.`);
  }

  function handleMarkAsPaid(invoiceId: string) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] }
          : inv
      )
    );
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      const newTx: Transaction = {
        id: Date.now(),
        student: inv.student,
        amount: inv.amount,
        type: "payment",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        method: "Manual Entry",
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
    toast.success("Invoice Paid", `Invoice ${invoiceId} has been marked as paid.`);
  }

  function handleSendReminder(invoice: Invoice) {
    toast.info("Reminder Sent", `Payment reminder sent to ${invoice.student} for ${invoice.id}.`);
  }

  function handleDeleteInvoice() {
    if (!deleteInvoice) return;
    setInvoices((prev) => prev.filter((inv) => inv.id !== deleteInvoice.id));
    toast.success("Invoice Deleted", `Invoice ${deleteInvoice.id} has been deleted.`);
    setDeleteInvoice(null);
  }

  function handleAddPaymentPlan() {
    if (!newPlan.student.trim() || newPlan.totalAmount <= 0 || newPlan.installments < 1) {
      toast.warning("Missing Fields", "Please fill in all required fields.");
      return;
    }
    const plan: PaymentPlan = {
      id: `PP-${String(paymentPlans.length + 1).padStart(3, "0")}`,
      student: newPlan.student,
      totalAmount: newPlan.totalAmount,
      installments: newPlan.installments,
      frequency: newPlan.frequency,
      paidInstallments: 0,
      startDate: new Date().toISOString().split("T")[0],
    };
    setPaymentPlans((prev) => [...prev, plan]);
    setAddPlanOpen(false);
    setNewPlan({ student: "", totalAmount: 0, installments: 3, frequency: "monthly" });
    toast.success("Payment Plan Added", `Payment plan for ${plan.student} created successfully.`);
  }

  function handleExportCSV() {
    const headers = ["Invoice #", "Student", "Description", "Amount (SAR)", "Due Date", "Status", "Paid Date"];
    const rows = invoices.map((inv) => [
      inv.id,
      inv.student,
      inv.description,
      inv.amount.toString(),
      inv.dueDate,
      inv.status,
      inv.paidDate || "",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoices_export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export Complete", `${invoices.length} invoices exported to CSV.`);
  }

  // ── Invoice item helpers ──
  function addInvoiceItem() {
    setNewInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: 0 }],
    }));
  }

  function updateInvoiceItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  }

  function removeInvoiceItem(index: number) {
    if (newInvoice.items.length <= 1) return;
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  // ── Status badge helper ──
  function getStatusBadge(status: string) {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return null;
    }
  }

  function getTransactionIcon(type: string) {
    switch (type) {
      case "payment":
        return (
          <div className="rounded-xl bg-success/10 p-2">
            <ArrowDownRight className="h-4 w-4 text-success" />
          </div>
        );
      case "refund":
        return (
          <div className="rounded-xl bg-destructive/10 p-2">
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </div>
        );
      case "plan_payment":
        return (
          <div className="rounded-xl bg-primary/10 p-2">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
        );
      default:
        return null;
    }
  }

  const newInvoiceTotal = newInvoice.items.reduce((s, item) => s + (Number(item.amount) || 0), 0);

  // ── Render ──
  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />

      {/* ── Header ── */}
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing &amp; Finance</h1>
            <p className="mt-1 text-muted-foreground">
              Manage invoices, payment plans and transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="lg" className="gap-2" onClick={() => setCreateInvoiceOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <StatCard
            title="Total Revenue"
            value={`${stats.totalRevenue.toLocaleString()} SAR`}
            change="+12.5% YoY"
            changeType="positive"
            icon={DollarSign}
            iconColor="bg-success/10 text-success"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <StatCard
            title="Pending"
            value={`${stats.pendingAmount.toLocaleString()} SAR`}
            change={`${invoices.filter((i) => i.status === "pending").length} invoices`}
            changeType="neutral"
            icon={Clock}
            iconColor="bg-warning/10 text-warning"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <StatCard
            title="Overdue"
            value={`${stats.overdueAmount.toLocaleString()} SAR`}
            change={`${invoices.filter((i) => i.status === "overdue").length} invoices`}
            changeType="negative"
            icon={AlertCircle}
            iconColor="bg-destructive/10 text-destructive"
          />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
          <StatCard
            title="Collection Rate"
            value={`${stats.collectionRate}%`}
            change="Based on all invoices"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-primary/10 text-primary"
          />
        </motion.div>
      </div>

      {/* ── Tabs ── */}
      <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Plans
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* ── Invoices Tab ── */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by student name or invoice #..."
                      icon={<Search className="h-4 w-4" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <Filter className="h-4 w-4 mr-2 opacity-50" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-3 opacity-30" />
                    <p className="font-medium">No invoices found</p>
                    <p className="text-sm">Try adjusting your search or filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInvoices.map((invoice, i) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex flex-col gap-3 rounded-xl border p-4 transition-all hover:bg-muted/50 sm:flex-row sm:items-center"
                      >
                        {/* Invoice info */}
                        <div className="flex items-center gap-3 sm:w-56 min-w-0">
                          <div className="rounded-xl bg-primary/10 p-2.5">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-medium">{invoice.id}</p>
                            <p className="text-xs text-muted-foreground truncate">{invoice.student}</p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 items-center gap-6 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-bold">{invoice.amount.toLocaleString()} SAR</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p>{invoice.dueDate}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-xs text-muted-foreground">Description</p>
                            <p className="truncate max-w-[160px]">{invoice.description}</p>
                          </div>
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(invoice.status)}

                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Invoice"
                            onClick={() => setViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {invoice.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Mark as Paid"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}

                          {invoice.status === "overdue" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Send Reminder"
                                onClick={() => handleSendReminder(invoice)}
                              >
                                <Send className="h-4 w-4 text-warning" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Mark as Paid"
                                onClick={() => handleMarkAsPaid(invoice.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Invoice"
                            onClick={() => setDeleteInvoice(invoice)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Payment Plans Tab ── */}
          <TabsContent value="plans">
            <div className="mb-4 flex justify-end">
              <Button className="gap-2" onClick={() => setAddPlanOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Payment Plan
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paymentPlans.map((plan, i) => {
                const progressPercent = Math.round((plan.paidInstallments / plan.installments) * 100);
                const perInstallment = Math.round(plan.totalAmount / plan.installments);
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">{plan.id}</p>
                            <h3 className="text-lg font-bold mt-1">{plan.student}</h3>
                          </div>
                          <Badge variant={progressPercent === 100 ? "success" : "info"}>
                            {progressPercent === 100 ? "Complete" : "Active"}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-bold">{plan.totalAmount.toLocaleString()} SAR</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Per Installment</span>
                            <span className="font-medium">{perInstallment.toLocaleString()} SAR</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frequency</span>
                            <span className="capitalize font-medium">{plan.frequency}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {plan.paidInstallments} / {plan.installments}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-primary h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {progressPercent}% paid
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Transactions Tab ── */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 rounded-xl border p-4"
                    >
                      {getTransactionIcon(tx.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{tx.student}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.method} &middot;{" "}
                          <span className="capitalize">{tx.type.replace("_", " ")}</span>
                        </p>
                      </div>
                      <div className="text-end">
                        <p
                          className={`font-bold ${
                            tx.amount > 0 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount.toLocaleString()} SAR
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ═══════════════════════ DIALOGS ═══════════════════════ */}

      {/* ── Create Invoice Dialog ── */}
      <FormDialog
        open={createInvoiceOpen}
        title="Create Invoice"
        description="Fill in the details below to create a new invoice."
        onClose={() => setCreateInvoiceOpen(false)}
        onSubmit={handleCreateInvoice}
        submitLabel="Create Invoice"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Student Name" required>
              <Input
                placeholder="e.g. Ahmed Al-Omari"
                value={newInvoice.student}
                onChange={(e) => setNewInvoice((p) => ({ ...p, student: e.target.value }))}
              />
            </FormField>
            <FormField label="Due Date" required>
              <Input
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </FormField>
          </div>
          <FormField label="Description" required>
            <Input
              placeholder="e.g. Spring Semester Tuition"
              value={newInvoice.description}
              onChange={(e) => setNewInvoice((p) => ({ ...p, description: e.target.value }))}
            />
          </FormField>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Line Items <span className="text-red-500">*</span>
              </label>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={addInvoiceItem}>
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {newInvoice.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateInvoiceItem(idx, "description", e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={item.amount || ""}
                      onChange={(e) => updateInvoiceItem(idx, "amount", Number(e.target.value))}
                    />
                  </div>
                  {newInvoice.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => removeInvoiceItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <p className="text-sm font-semibold">
                Total: <span className="text-primary">{newInvoiceTotal.toLocaleString()} SAR</span>
              </p>
            </div>
          </div>
        </div>
      </FormDialog>

      {/* ── View Invoice Dialog ── */}
      <FormDialog
        open={!!viewInvoice}
        title={viewInvoice ? `Invoice ${viewInvoice.id}` : ""}
        description={viewInvoice?.description}
        onClose={() => setViewInvoice(null)}
        onSubmit={() => setViewInvoice(null)}
        submitLabel="Close"
        size="lg"
      >
        {viewInvoice && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="font-semibold">{viewInvoice.student}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <div>{getStatusBadge(viewInvoice.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{viewInvoice.dueDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Paid Date</p>
                <p className="font-medium">{viewInvoice.paidDate || "—"}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <p className="text-sm font-semibold mb-2">Line Items</p>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="px-4 py-2.5">{item.description}</td>
                        <td className="px-4 py-2.5 text-right font-medium">
                          {item.amount.toLocaleString()} SAR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30">
                      <td className="px-4 py-2.5 font-semibold">Total</td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary">
                        {viewInvoice.amount.toLocaleString()} SAR
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </FormDialog>

      {/* ── Delete Invoice Confirm Dialog ── */}
      <ConfirmDialog
        open={!!deleteInvoice}
        title="Delete Invoice"
        description={
          deleteInvoice
            ? `Are you sure you want to delete invoice ${deleteInvoice.id} for ${deleteInvoice.student}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteInvoice}
        onCancel={() => setDeleteInvoice(null)}
      />

      {/* ── Add Payment Plan Dialog ── */}
      <FormDialog
        open={addPlanOpen}
        title="Add Payment Plan"
        description="Set up a new payment plan for a student."
        onClose={() => setAddPlanOpen(false)}
        onSubmit={handleAddPaymentPlan}
        submitLabel="Create Plan"
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Student Name" required>
            <Input
              placeholder="e.g. Sara Al-Hassan"
              value={newPlan.student}
              onChange={(e) => setNewPlan((p) => ({ ...p, student: e.target.value }))}
            />
          </FormField>
          <FormField label="Total Amount (SAR)" required>
            <Input
              type="number"
              placeholder="e.g. 12000"
              value={newPlan.totalAmount || ""}
              onChange={(e) => setNewPlan((p) => ({ ...p, totalAmount: Number(e.target.value) }))}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Number of Installments" required>
              <Input
                type="number"
                min={1}
                max={24}
                value={newPlan.installments}
                onChange={(e) => setNewPlan((p) => ({ ...p, installments: Number(e.target.value) }))}
              />
            </FormField>
            <FormField label="Frequency" required>
              <Select
                value={newPlan.frequency}
                onValueChange={(v) =>
                  setNewPlan((p) => ({ ...p, frequency: v as "weekly" | "monthly" | "quarterly" }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          {newPlan.totalAmount > 0 && newPlan.installments > 0 && (
            <div className="rounded-xl bg-muted/50 p-4 text-sm">
              <p className="text-muted-foreground">
                Each installment:{" "}
                <span className="font-bold text-foreground">
                  {Math.round(newPlan.totalAmount / newPlan.installments).toLocaleString()} SAR
                </span>{" "}
                &middot; {newPlan.frequency}
              </p>
            </div>
          )}
        </div>
      </FormDialog>
    </div>
  );
}
