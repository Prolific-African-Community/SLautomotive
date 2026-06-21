import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  EXTERNAL_MAINTENANCE_STATUSES,
  externalMaintenanceInterventionTypeLabel,
  externalMaintenanceStatusLabel,
  externalMaintenanceUrgencyLabel,
  externalMaintenanceVehicleTypeLabel,
} from "../../lib/external-maintenance-ui";
import { GARAGE_WHATSAPP_PHONE } from "../../lib/garage-whatsapp";

type GarageRequest = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  mileage?: number | null;
  plateNumber?: string | null;
  problemType?: string | null;
  symptoms: string[];
  description?: string | null;
  status: string;
  priority: string;
  quoteTotal?: number | null;
  createdAt: string;
  interventions: GarageInterventionLine[];
  summary?: {
    interventionCount: number;
    quoteTotal?: number | null;
  };
};

type GarageInterventionLine = {
  id: string;
  total: number;
};

type InterventionCode = {
  id: string;
  code: string;
  label: string;
  category: string;
  description?: string | null;
  unitPrice: number;
  defaultQty: number;
  estimatedMinutes?: number | null;
  isActive: boolean;
  updatedAt: string;
};

type ExternalMaintenanceStatusHistory = {
  id: string;
  oldStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  createdAt: string;
};

type ExternalMaintenanceWebhookDelivery = {
  id: string;
  status: "PENDING" | "DELIVERED" | "FAILED";
  attempts: number;
  httpStatus?: number | null;
  errorMessage?: string | null;
  createdAt: string;
};

type ExternalMaintenanceRequest = {
  id: string;
  sourceCompany: string;
  sourceSystem: string;
  externalRequestId: string;
  externalVehicleId?: string | null;
  vehicleType: string;
  plateNumber?: string | null;
  interventionType: string;
  urgency: string;
  status: string;
  mileage?: number | null;
  immobilizationRequired: boolean;
  preferredDate?: string | null;
  issueDescription: string;
  internalNotes?: string | null;
  quoteAmount?: number | null;
  invoiceAmount?: number | null;
  quotePdfUrl?: string | null;
  invoicePdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: ExternalMaintenanceStatusHistory[];
  webhookDeliveries: ExternalMaintenanceWebhookDelivery[];
};

type RequestForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  mileage: string;
  plateNumber: string;
  problemType: string;
  symptoms: string;
  description: string;
  priority: string;
};

type CodeForm = {
  id?: string;
  code: string;
  label: string;
  category: string;
  customCategory: string;
  description: string;
  unitPrice: string;
  defaultQty: string;
  estimatedMinutes: string;
  isActive: boolean;
};

type QuoteDraft = {
  amount: string;
  comment: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const STATUSES = [
  "ALL",
  "NEW",
  "IN_REVIEW",
  "WAITING_CLIENT",
  "QUOTE_READY",
  "QUOTE_SENT",
  "ACCEPTED",
  "REJECTED",
  "DONE",
];

const PRIORITIES = ["ALL", "LOW", "NORMAL", "HIGH", "URGENT"];

const CODE_STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

const CATEGORY_OPTIONS = [
  "Diagnostic",
  "Entretien",
  "Freinage",
  "Pneumatiques",
  "Train roulant",
  "Moteur",
  "Électricité",
  "Climatisation",
  "Performance",
  "Carrosserie",
  "Main d’œuvre",
  "Divers",
];

const EMPTY_FORM: RequestForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleYear: "",
  mileage: "",
  plateNumber: "",
  problemType: "",
  symptoms: "",
  description: "",
  priority: "NORMAL",
};

const EMPTY_CODE_FORM: CodeForm = {
  code: "",
  label: "",
  category: "Diagnostic",
  customCategory: "",
  description: "",
  unitPrice: "",
  defaultQty: "1",
  estimatedMinutes: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20";

const lightInputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20";

const buttonClass =
  "inline-flex items-center justify-center rounded-2xl border border-yellow-300/70 bg-yellow-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const ghostButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:border-yellow-300/50 hover:text-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-LU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("fr-LU").format(value);
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ALL: "Tous",
    NEW: "Nouveau",
    IN_REVIEW: "En analyse",
    WAITING_CLIENT: "Attente client",
    QUOTE_READY: "Frais prêts",
    QUOTE_SENT: "Frais proposés",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    DONE: "Terminé",
  };

  return map[status] || status;
}

function priorityLabel(priority: string) {
  const map: Record<string, string> = {
    ALL: "Toutes",
    LOW: "Basse",
    NORMAL: "Normale",
    HIGH: "Haute",
    URGENT: "Urgente",
  };

  return map[priority] || priority;
}

function statusClass(status: string) {
  if (status === "QUOTE_READY" || status === "QUOTE_SENT") {
    return "bg-yellow-300 text-black";
  }

  if (status === "ACCEPTED" || status === "DONE") {
    return "bg-emerald-400 text-black";
  }

  if (status === "REJECTED") {
    return "bg-red-500 text-white";
  }

  return "bg-white/10 text-zinc-300";
}

function priorityClass(priority: string) {
  if (priority === "URGENT") return "border-red-400/50 bg-red-500/15 text-red-200";
  if (priority === "HIGH") return "border-orange-300/50 bg-orange-400/15 text-orange-100";
  if (priority === "LOW") return "border-white/10 bg-white/5 text-zinc-400";
  return "border-yellow-300/30 bg-yellow-300/10 text-yellow-100";
}

function externalStatusClass(status: string) {
  if (status === "RECEIVED") return "bg-yellow-300 text-black";
  if (status === "UNDER_REVIEW" || status === "QUOTE_PREPARING") {
    return "bg-blue-400 text-black";
  }
  if (
    status === "QUOTE_APPROVED" ||
    status === "SCHEDULED" ||
    status === "IN_PROGRESS" ||
    status === "COMPLETED" ||
    status === "INVOICED" ||
    status === "PAID" ||
    status === "CLOSED"
  ) {
    return "bg-emerald-400 text-black";
  }
  if (status === "QUOTE_REJECTED" || status === "CANCELLED") {
    return "bg-red-500 text-white";
  }
  return "bg-white/10 text-zinc-300";
}

function externalUrgencyClass(urgency: string) {
  if (urgency === "CRITICAL") return "border-red-400/50 bg-red-500/15 text-red-100";
  if (urgency === "HIGH") return "border-orange-300/50 bg-orange-500/15 text-orange-100";
  if (urgency === "LOW") return "border-white/10 bg-white/5 text-zinc-400";
  return "border-yellow-300/30 bg-yellow-300/10 text-yellow-100";
}

function toNullableNumber(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Erreur API ${res.status}`);
  }

  return json;
}

export default function GarageDashboard() {
  const [activeTab, setActiveTab] = useState<"requests" | "external" | "codes">("requests");
  const [requests, setRequests] = useState<GarageRequest[]>([]);
  const [codes, setCodes] = useState<InterventionCode[]>([]);
  const [externalRequests, setExternalRequests] = useState<ExternalMaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [codesLoading, setCodesLoading] = useState(false);
  const [externalLoading, setExternalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCode, setSavingCode] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [externalActionId, setExternalActionId] = useState<string | null>(null);
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, QuoteDraft>>({});
  const [selectedExternalRequestId, setSelectedExternalRequestId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [form, setForm] = useState<RequestForm>(EMPTY_FORM);
  const [codeForm, setCodeForm] = useState<CodeForm>(EMPTY_CODE_FORM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [codeSearch, setCodeSearch] = useState("");
  const [codeCategoryFilter, setCodeCategoryFilter] = useState("ALL");
  const [codeStatusFilter, setCodeStatusFilter] = useState("ALL");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateForm<K extends keyof RequestForm>(key: K, value: RequestForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateCodeForm<K extends keyof CodeForm>(key: K, value: CodeForm[K]) {
    setCodeForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetCodeForm() {
    setCodeForm(EMPTY_CODE_FORM);
    setShowCodeForm(false);
  }

  function openNewCodeForm() {
    setCodeForm(EMPTY_CODE_FORM);
    setShowCodeForm(true);
  }

  function openEditCodeForm(code: InterventionCode) {
    const categoryIsStandard = CATEGORY_OPTIONS.includes(code.category);

    setCodeForm({
      id: code.id,
      code: code.code,
      label: code.label,
      category: categoryIsStandard ? code.category : "Divers",
      customCategory: categoryIsStandard ? "" : code.category,
      description: code.description || "",
      unitPrice: String(code.unitPrice),
      defaultQty: String(code.defaultQty),
      estimatedMinutes:
        code.estimatedMinutes === null || code.estimatedMinutes === undefined ? "" : String(code.estimatedMinutes),
      isActive: code.isActive,
    });
    setShowCodeForm(true);
  }

  function getCodeCategory(formState: CodeForm) {
    return formState.customCategory.trim() || formState.category;
  }

  function validateCodeForm() {
    const unitPrice = Number(codeForm.unitPrice);
    const defaultQty = Number(codeForm.defaultQty);
    const estimatedMinutes = codeForm.estimatedMinutes.trim() ? Number(codeForm.estimatedMinutes) : null;

    if (!codeForm.code.trim()) return "Le code est obligatoire.";
    if (!codeForm.label.trim()) return "Le libellé est obligatoire.";
    if (!getCodeCategory(codeForm).trim()) return "La catégorie est obligatoire.";
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return "Le prix unitaire doit être supérieur ou égal à 0.";
    }
    if (!Number.isFinite(defaultQty) || defaultQty <= 0) {
      return "La quantité par défaut doit être supérieure à 0.";
    }
    if (estimatedMinutes !== null && (!Number.isFinite(estimatedMinutes) || estimatedMinutes < 0)) {
      return "La durée estimée doit être supérieure ou égale à 0.";
    }

    return null;
  }

  function buildCodePayload() {
    return {
      code: codeForm.code.trim(),
      label: codeForm.label.trim(),
      category: getCodeCategory(codeForm).trim(),
      description: codeForm.description.trim() || null,
      unitPrice: Number(codeForm.unitPrice),
      defaultQty: Number(codeForm.defaultQty),
      estimatedMinutes: codeForm.estimatedMinutes.trim() ? Number(codeForm.estimatedMinutes) : null,
      isActive: codeForm.isActive,
    };
  }

  async function loadRequests() {
    try {
      setLoading(true);
      setError(null);

      const json = await fetchJson<GarageRequest[]>("/api/garage/requests");
      setRequests(json.data || []);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les demandes garage.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCodes() {
    try {
      setCodesLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (codeSearch.trim()) params.set("search", codeSearch.trim());
      if (codeCategoryFilter !== "ALL") params.set("category", codeCategoryFilter);
      if (codeStatusFilter === "ACTIVE") params.set("activeOnly", "true");

      const json = await fetchJson<InterventionCode[]>(
        `/api/garage/intervention-codes${params.toString() ? `?${params.toString()}` : ""}`
      );
      const data = json.data || [];
      setCodes(codeStatusFilter === "INACTIVE" ? data.filter((code) => !code.isActive) : data);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les codes intervention.");
    } finally {
      setCodesLoading(false);
    }
  }

  async function loadExternalRequests() {
    try {
      setExternalLoading(true);
      setError(null);

      const json = await fetchJson<ExternalMaintenanceRequest[]>("/api/garage/external-maintenance");
      setExternalRequests(json.data || []);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les demandes de maintenance externe.");
    } finally {
      setExternalLoading(false);
    }
  }

  async function createRequest(e: FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      await fetchJson<GarageRequest>("/api/garage/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicleYear: toNullableNumber(form.vehicleYear),
          mileage: toNullableNumber(form.mileage),
          symptoms: form.symptoms,
        }),
      });

      setForm(EMPTY_FORM);
      setShowForm(false);
      setMessage("Demande garage créée.");
      await loadRequests();
    } catch (err: any) {
      setError(err?.message || "Création impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function seedCodes(overwrite = false) {
    if (overwrite && !window.confirm("Cela peut écraser les prix et descriptions des codes standards. Continuer ?")) {
      return;
    }

    try {
      setSeeding(true);
      setError(null);
      setMessage(null);

      const json = await fetchJson<{
        createdCount: number;
        updatedCount: number;
        skippedCount: number;
        totalCodes: number;
      }>(`/api/garage/seed-intervention-codes${overwrite ? "?overwrite=true" : ""}`, {
        method: "POST",
      });

      const result = json.data;
      setMessage(
        result
          ? `Codes standards : ${result.createdCount} créés, ${result.updatedCount} mis à jour, ${result.skippedCount} ignorés.`
          : "Codes intervention initialisés."
      );
      await loadCodes();
    } catch (err: any) {
      setError(err?.message || "Seed impossible.");
    } finally {
      setSeeding(false);
    }
  }

  async function quickStatus(id: string, status: string) {
    try {
      setError(null);
      await fetchJson(`/api/garage/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadRequests();
    } catch (err: any) {
      setError(err?.message || "Mise à jour impossible.");
    }
  }

  async function quickExternalStatus(id: string, status: string, statusComment: string) {
    try {
      setExternalActionId(id);
      setError(null);
      setMessage(null);

      await fetchJson<ExternalMaintenanceRequest>(`/api/garage/external-maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, statusComment }),
      });

      setMessage("Statut maintenance externe mis à jour.");
      await loadExternalRequests();
    } catch (err: any) {
      setError(err?.message || "Mise à jour maintenance externe impossible.");
    } finally {
      setExternalActionId(null);
    }
  }

  async function retryExternalWebhook(requestId: string, deliveryId: string) {
    try {
      setExternalActionId(requestId);
      setError(null);
      setMessage(null);
      await fetchJson<ExternalMaintenanceWebhookDelivery>(
        `/api/garage/external-maintenance/webhook-deliveries/${deliveryId}/retry`,
        { method: "POST" }
      );
      setMessage("Synchronisation NovoTralux réessayée avec succès.");
      await loadExternalRequests();
    } catch (err: any) {
      setError(err?.message || "Nouvelle tentative de synchronisation impossible.");
      await loadExternalRequests();
    } finally {
      setExternalActionId(null);
    }
  }

  function updateQuoteDraft(id: string, field: keyof QuoteDraft, value: string) {
    setQuoteDrafts((current) => ({
      ...current,
      [id]: {
        amount: current[id]?.amount ?? "",
        comment: current[id]?.comment ?? "",
        [field]: value,
      },
    }));
  }

  async function sendExternalQuote(request: ExternalMaintenanceRequest) {
    const draft = quoteDrafts[request.id];
    const quoteAmount = Number(draft?.amount);

    if (!draft?.amount.trim() || !Number.isFinite(quoteAmount) || quoteAmount < 0) {
      setError("Le montant des frais est obligatoire et doit être valide.");
      return;
    }

    try {
      setExternalActionId(request.id);
      setError(null);
      setMessage(null);
      await fetchJson<ExternalMaintenanceRequest>(`/api/garage/external-maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_quote",
          quoteAmount,
          statusComment: draft.comment.trim() || null,
        }),
      });
      setMessage("Frais proposés à NovoTralux.");
      setQuoteDrafts((current) => {
        const next = { ...current };
        delete next[request.id];
        return next;
      });
      await loadExternalRequests();
    } catch (err: any) {
      setError(err?.message || "Proposition des frais impossible.");
    } finally {
      setExternalActionId(null);
    }
  }

  async function saveCode(e: FormEvent) {
    e.preventDefault();

    const validationMessage = validateCodeForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSavingCode(true);
      setError(null);
      setMessage(null);

      const payload = buildCodePayload();
      const isEditing = Boolean(codeForm.id);

      await fetchJson<InterventionCode>(
        isEditing ? `/api/garage/intervention-codes/${codeForm.id}` : "/api/garage/intervention-codes",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      setMessage(isEditing ? "Code intervention mis à jour." : "Code intervention créé.");
      resetCodeForm();
      await loadCodes();
    } catch (err: any) {
      setError(err?.message || "Sauvegarde du code impossible.");
    } finally {
      setSavingCode(false);
    }
  }

  async function disableCode(code: InterventionCode) {
    if (!window.confirm(`Désactiver le code ${code.code} ?`)) return;

    try {
      setError(null);
      setMessage(null);
      await fetchJson<InterventionCode>(`/api/garage/intervention-codes/${code.id}`, {
        method: "DELETE",
      });
      setMessage(`Code ${code.code} désactivé.`);
      await loadCodes();
    } catch (err: any) {
      setError(err?.message || "Désactivation impossible.");
    }
  }

  async function reactivateCode(code: InterventionCode) {
    try {
      setError(null);
      setMessage(null);
      await fetchJson<InterventionCode>(`/api/garage/intervention-codes/${code.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      setMessage(`Code ${code.code} réactivé.`);
      await loadCodes();
    } catch (err: any) {
      setError(err?.message || "Réactivation impossible.");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (activeTab !== "external") return;
    loadExternalRequests();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "codes") return;
    loadCodes();
  }, [activeTab, codeCategoryFilter, codeSearch, codeStatusFilter]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const searchable = [
        request.firstName,
        request.lastName,
        request.phone,
        request.email,
        request.vehicleBrand,
        request.vehicleModel,
        request.plateNumber,
        request.problemType,
        request.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (statusFilter === "ALL" || request.status === statusFilter) &&
        (priorityFilter === "ALL" || request.priority === priorityFilter)
      );
    });
  }, [priorityFilter, requests, search, statusFilter]);

  const kpis = useMemo(() => {
    const count = (status: string) => requests.filter((request) => request.status === status).length;
    const potentialRevenue = requests
      .filter((request) => ["QUOTE_READY", "QUOTE_SENT", "ACCEPTED"].includes(request.status))
      .reduce((sum, request) => sum + (request.quoteTotal || 0), 0);

    return [
      { label: "Total demandes", value: requests.length.toString() },
      { label: "Nouvelles", value: count("NEW").toString() },
      { label: "En analyse", value: count("IN_REVIEW").toString() },
      { label: "Frais prêts", value: count("QUOTE_READY").toString() },
      { label: "Frais proposés", value: count("QUOTE_SENT").toString() },
      { label: "Acceptées", value: count("ACCEPTED").toString() },
      { label: "CA potentiel", value: formatMoney(potentialRevenue) },
    ];
  }, [requests]);

  const availableCodeCategories = useMemo(() => {
    const dynamicCategories = codes.map((code) => code.category).filter(Boolean);
    return Array.from(new Set([...CATEGORY_OPTIONS, ...dynamicCategories])).sort((a, b) => a.localeCompare(b));
  }, [codes]);

  const codeStats = useMemo(
    () => ({
      total: codes.length,
      active: codes.filter((code) => code.isActive).length,
      inactive: codes.filter((code) => !code.isActive).length,
    }),
    [codes]
  );

  const externalKpis = useMemo(() => {
    const count = (status: string) => externalRequests.filter((request) => request.status === status).length;

    return [
      { label: "Total queue", value: externalRequests.length.toString() },
      { label: "Reçues", value: count("RECEIVED").toString() },
      { label: "En analyse", value: count("UNDER_REVIEW").toString() },
      {
        label: "Infos demandées",
        value: count("MORE_INFO_REQUESTED").toString(),
      },
      { label: "Frais à préparer", value: count("QUOTE_PREPARING").toString() },
      {
        label: "Urgences critiques",
        value: externalRequests.filter((request) => request.urgency === "CRITICAL").length.toString(),
      },
    ];
  }, [externalRequests]);

  const selectedExternalRequest = externalRequests.find((request) => request.id === selectedExternalRequestId) ?? null;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="from-zinc-950 flex flex-col gap-5 rounded-3xl border border-white/10 bg-gradient-to-br via-black to-zinc-900 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">SL Automotive</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Garage cockpit</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Pilotage des diagnostics, lignes atelier et frais d&apos;intervention. WhatsApp sera branché sur le numéro
              atelier {GARAGE_WHATSAPP_PHONE}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={buttonClass} onClick={() => setShowForm(true)}>
              Nouvelle demande
            </button>
            <button className={ghostButtonClass} onClick={() => seedCodes(false)} disabled={seeding}>
              {seeding ? "Initialisation..." : "Initialiser codes"}
            </button>
            <button
              className={ghostButtonClass}
              onClick={() => {
                if (activeTab === "codes") {
                  loadCodes();
                  return;
                }
                if (activeTab === "external") {
                  loadExternalRequests();
                  return;
                }
                loadRequests();
              }}
              disabled={activeTab === "codes" ? codesLoading : activeTab === "external" ? externalLoading : loading}
            >
              Rafraîchir
            </button>
          </div>
        </header>

        {(error || message) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-400/30 bg-red-500/10 text-red-100"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="flex flex-wrap gap-3">
          <button
            className={activeTab === "requests" ? buttonClass : ghostButtonClass}
            onClick={() => setActiveTab("requests")}
          >
            Demandes
          </button>
          <button
            className={activeTab === "codes" ? buttonClass : ghostButtonClass}
            onClick={() => setActiveTab("codes")}
          >
            Codes intervention
          </button>
          <button
            className={activeTab === "external" ? buttonClass : ghostButtonClass}
            onClick={() => setActiveTab("external")}
          >
            Maintenance externe
          </button>
        </section>

        {activeTab === "requests" && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-zinc-950 rounded-3xl border border-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{kpi.label}</p>
                  <p className="mt-3 text-2xl font-black text-white">{kpi.value}</p>
                </div>
              ))}
            </section>

            <section className="bg-zinc-950 grid gap-3 rounded-3xl border border-white/10 p-4 md:grid-cols-[1fr_220px_220px]">
              <input
                className={inputClass}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Recherche client, téléphone, véhicule, description..."
              />
              <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
              <select className={inputClass} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </option>
                ))}
              </select>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {loading ? (
                <div className="bg-zinc-950 rounded-3xl border border-white/10 p-6 text-zinc-300">
                  Chargement des demandes garage...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="bg-zinc-950 rounded-3xl border border-white/10 p-6 text-zinc-300">
                  Aucune demande ne correspond aux filtres.
                </div>
              ) : (
                filteredRequests.map((request) => {
                  const clientName =
                    [request.firstName, request.lastName].filter(Boolean).join(" ") || "Client non renseigné";
                  const vehicle =
                    [request.vehicleBrand, request.vehicleModel, request.vehicleYear].filter(Boolean).join(" ") ||
                    "Véhicule à préciser";
                  const lineCount = request.summary?.interventionCount ?? request.interventions.length;
                  const hasQuote = Boolean(request.quoteTotal && request.quoteTotal > 0);

                  return (
                    <article
                      key={request.id}
                      className="from-zinc-950 via-zinc-950 rounded-3xl border border-white/10 bg-gradient-to-br to-zinc-900 p-5 transition hover:-translate-y-0.5 hover:border-yellow-300/40"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(request.status)}`}>
                              {statusLabel(request.status)}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(
                                request.priority
                              )}`}
                            >
                              {priorityLabel(request.priority)}
                            </span>
                          </div>
                          <h2 className="mt-4 text-xl font-black">{clientName}</h2>
                          <p className="mt-1 text-sm text-zinc-400">{request.phone || "-"}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                request.phone
                                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                                  : "border-white/10 bg-white/5 text-zinc-500"
                              }`}
                            >
                              {request.phone ? "WhatsApp possible" : "Téléphone manquant"}
                            </span>
                            {hasQuote && (
                              <span className="rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-100">
                                Frais prêts
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="rounded-2xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-3xl font-black text-yellow-200">
                            {formatMoney(request.quoteTotal)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {lineCount} ligne{lineCount > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Véhicule</p>
                          <p className="mt-1 font-semibold text-white">{vehicle}</p>
                          <p className="text-zinc-500">
                            {request.plateNumber || "Plaque non renseignée"} · {formatNumber(request.mileage)} km
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Problème</p>
                          <p className="mt-1 font-semibold text-white">
                            {request.problemType || "Diagnostic à qualifier"}
                          </p>
                          <p className="line-clamp-2 text-zinc-500">
                            {request.description || request.symptoms.join(", ") || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-zinc-500">Créée le {formatDate(request.createdAt)}</p>
                        <div className="flex flex-wrap gap-2">
                          {request.status === "NEW" && (
                            <button className={ghostButtonClass} onClick={() => quickStatus(request.id, "IN_REVIEW")}>
                              Passer en analyse
                            </button>
                          )}
                          {request.status !== "QUOTE_READY" && lineCount > 0 && (
                            <button className={ghostButtonClass} onClick={() => quickStatus(request.id, "QUOTE_READY")}>
                              Frais prêts
                            </button>
                          )}
                          <Link href={`/dashboard/garage/${request.id}`}>
                            <a className={buttonClass}>Ouvrir</a>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </>
        )}

        {activeTab === "external" && (
          <section className="flex flex-col gap-5">
            <div className="bg-zinc-950 rounded-3xl border border-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Flux partenaires</p>
              <h2 className="mt-2 text-2xl font-black">Maintenance externe</h2>
              <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                File interne SL Automotive pour les demandes de maintenance entrantes NovoTralux. Cette étape reste
                dédiée à la réception, l&apos;analyse et au suivi des frais d&apos;intervention synchronisés avec
                NovoTralux.
              </p>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {externalKpis.map((kpi) => (
                <div key={kpi.label} className="bg-zinc-950 rounded-3xl border border-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{kpi.label}</p>
                  <p className="mt-3 text-2xl font-black text-white">{kpi.value}</p>
                </div>
              ))}
            </section>

            <div className="bg-zinc-950 rounded-3xl border border-white/10 p-4">
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_MAINTENANCE_STATUSES.map((status) => (
                  <span
                    key={status}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${externalStatusClass(status)}`}
                  >
                    {externalMaintenanceStatusLabel(status)}
                  </span>
                ))}
              </div>
            </div>

            {selectedExternalRequest ? (
              <button
                type="button"
                aria-label="Fermer le détail"
                className="fixed inset-0 z-[70] bg-black/75"
                onClick={() => setSelectedExternalRequestId(null)}
              />
            ) : null}

            <section className="space-y-2">
              {externalLoading ? (
                <div className="bg-zinc-950 rounded-3xl border border-white/10 p-6 text-zinc-300">
                  Chargement de la queue maintenance externe...
                </div>
              ) : externalRequests.length === 0 ? (
                <div className="bg-zinc-950 rounded-3xl border border-white/10 p-6 text-zinc-300">
                  Aucune demande de maintenance externe reçue pour le moment.
                </div>
              ) : (
                externalRequests.map((request) => {
                  const latestComment = request.statusHistory[0]?.comment;
                  const latestDelivery = request.webhookDeliveries[0];

                  return (
                    <article
                      key={request.id}
                      role={selectedExternalRequestId === request.id ? undefined : "button"}
                      tabIndex={selectedExternalRequestId === request.id ? undefined : 0}
                      onClick={() => {
                        if (selectedExternalRequestId !== request.id) {
                          setSelectedExternalRequestId(request.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (selectedExternalRequestId !== request.id && (event.key === "Enter" || event.key === " ")) {
                          setSelectedExternalRequestId(request.id);
                        }
                      }}
                      className={
                        selectedExternalRequestId === request.id
                          ? "bg-zinc-950 fixed inset-x-4 top-6 z-[80] mx-auto max-h-[calc(100vh-3rem)] max-w-4xl overflow-y-auto rounded-3xl border border-yellow-300/30 p-5 shadow-2xl sm:p-7"
                          : "bg-zinc-950 grid cursor-pointer grid-cols-2 items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 transition hover:border-yellow-300/40 sm:grid-cols-4 lg:grid-cols-[1.1fr_0.8fr_1fr_1fr_0.8fr_1fr_1fr_1fr_0.9fr]"
                      }
                    >
                      {selectedExternalRequestId !== request.id ? (
                        <>
                          <p className="font-black text-white">{request.plateNumber || "Plaque inconnue"}</p>
                          <p className="text-xs text-zinc-400">
                            {externalMaintenanceVehicleTypeLabel(request.vehicleType)}
                          </p>
                          <p className="text-xs font-semibold text-zinc-300">{request.sourceCompany}</p>
                          <p className="text-xs text-zinc-300">
                            {externalMaintenanceInterventionTypeLabel(request.interventionType)}
                          </p>
                          <span
                            className={`w-fit rounded-full border px-2 py-1 text-[10px] font-bold ${externalUrgencyClass(
                              request.urgency
                            )}`}
                          >
                            {externalMaintenanceUrgencyLabel(request.urgency)}
                          </span>
                          <span
                            className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${externalStatusClass(
                              request.status
                            )}`}
                          >
                            {externalMaintenanceStatusLabel(request.status)}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {latestDelivery?.status === "DELIVERED"
                              ? "Synchronisé"
                              : latestDelivery?.status === "FAILED"
                              ? "Échec synchro"
                              : latestDelivery
                              ? "En attente"
                              : "-"}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {request.preferredDate ? formatDate(request.preferredDate) : "À caler"}
                          </span>
                          <span className="text-sm font-bold text-yellow-200">
                            {request.quoteAmount !== null && request.quoteAmount !== undefined
                              ? formatMoney(request.quoteAmount)
                              : "-"}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                                Détail maintenance externe
                              </p>
                              <h3 className="mt-1 text-2xl font-black text-white">
                                {request.plateNumber || "Plaque inconnue"}
                              </h3>
                            </div>
                            <button
                              type="button"
                              className={ghostButtonClass}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedExternalRequestId(null);
                              }}
                            >
                              Fermer
                            </button>
                          </div>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${externalStatusClass(
                                    request.status
                                  )}`}
                                >
                                  {externalMaintenanceStatusLabel(request.status)}
                                </span>
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${externalUrgencyClass(
                                    request.urgency
                                  )}`}
                                >
                                  {externalMaintenanceUrgencyLabel(request.urgency)}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-300">
                                  {request.sourceCompany}
                                </span>
                                {latestDelivery ? (
                                  <span
                                    className={[
                                      "rounded-full border px-3 py-1 text-xs font-bold",
                                      latestDelivery.status === "DELIVERED"
                                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                                        : latestDelivery.status === "FAILED"
                                        ? "border-red-400/30 bg-red-500/10 text-red-200"
                                        : "border-amber-300/30 bg-amber-400/10 text-amber-100",
                                    ].join(" ")}
                                  >
                                    {latestDelivery.status === "DELIVERED"
                                      ? "Synchronisé"
                                      : latestDelivery.status === "FAILED"
                                      ? "Échec synchro"
                                      : "En attente"}
                                  </span>
                                ) : null}
                              </div>
                              <h2 className="mt-4 text-xl font-black text-white">
                                {request.plateNumber || "Plaque non renseignée"}
                              </h2>
                              <p className="mt-1 text-sm text-zinc-400">
                                {externalMaintenanceVehicleTypeLabel(request.vehicleType)} ·{" "}
                                {externalMaintenanceInterventionTypeLabel(request.interventionType)} · Ref{" "}
                                {request.externalRequestId}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Date souhaitée</p>
                              <p className="mt-2 text-sm font-semibold text-white">
                                {request.preferredDate ? formatDate(request.preferredDate) : "À caler"}
                              </p>
                              {request.immobilizationRequired && (
                                <p className="mt-3 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-100">
                                  Immobilisation requise
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Signalement</p>
                              <p className="line-clamp-4 mt-1 text-white">{request.issueDescription}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Repères internes</p>
                              <p className="mt-1 text-white">Kilométrage {formatNumber(request.mileage)} km</p>
                              <p className="line-clamp-3 mt-1 text-zinc-400">
                                {request.internalNotes || latestComment || "Aucune note interne."}
                              </p>
                            </div>
                          </div>

                          {request.quoteAmount !== null ||
                          request.invoiceAmount !== null ||
                          request.quotePdfUrl ||
                          request.invoicePdfUrl ? (
                            <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/5 p-4 text-sm">
                              {request.quoteAmount !== null && request.quoteAmount !== undefined ? (
                                <p className="font-bold text-yellow-100">Frais : {formatMoney(request.quoteAmount)}</p>
                              ) : null}
                              {request.quotePdfUrl || request.invoicePdfUrl ? (
                                <a
                                  href={request.quotePdfUrl || request.invoicePdfUrl || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-block text-yellow-300 underline"
                                >
                                  Ouvrir le PDF des frais
                                </a>
                              ) : null}
                            </div>
                          ) : null}

                          {["UNDER_REVIEW", "QUOTE_PREPARING", "SCHEDULED"].includes(request.status) ? (
                            <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                              <input
                                className={inputClass}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Montant des frais (€)"
                                value={quoteDrafts[request.id]?.amount ?? ""}
                                onChange={(event) => updateQuoteDraft(request.id, "amount", event.target.value)}
                              />
                              <input
                                className={inputClass}
                                placeholder="Commentaire (optionnel)"
                                value={quoteDrafts[request.id]?.comment ?? ""}
                                onChange={(event) => updateQuoteDraft(request.id, "comment", event.target.value)}
                              />
                              <button
                                className={buttonClass}
                                onClick={() => void sendExternalQuote(request)}
                                disabled={externalActionId === request.id}
                              >
                                {externalActionId === request.id ? "Envoi en cours..." : "Proposer les frais"}
                              </button>
                            </div>
                          ) : null}

                          {request.statusHistory.length > 0 ? (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Historique</p>
                              <div className="mt-3 space-y-2">
                                {request.statusHistory.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex flex-col justify-between gap-1 border-b border-white/5 pb-2 text-xs sm:flex-row"
                                  >
                                    <span className="font-semibold text-zinc-200">
                                      {externalMaintenanceStatusLabel(entry.newStatus)}
                                    </span>
                                    <span className="text-zinc-500">
                                      {entry.comment || "Mise à jour"} · {formatDate(entry.createdAt)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
                            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                              <span>Créée le {formatDate(request.createdAt)}</span>
                              <span>·</span>
                              <span>{request.sourceSystem}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {latestDelivery?.status === "FAILED" ? (
                                <button
                                  className={ghostButtonClass}
                                  onClick={() => void retryExternalWebhook(request.id, latestDelivery.id)}
                                  disabled={externalActionId === request.id}
                                >
                                  Réessayer synchro
                                </button>
                              ) : null}
                              {request.status === "RECEIVED" ? (
                                <button
                                  className={ghostButtonClass}
                                  onClick={() =>
                                    quickExternalStatus(
                                      request.id,
                                      "UNDER_REVIEW",
                                      "Pris en analyse par l'atelier SL Automotive."
                                    )
                                  }
                                  disabled={externalActionId === request.id}
                                >
                                  Passer en analyse
                                </button>
                              ) : null}
                              {["RECEIVED", "UNDER_REVIEW", "QUOTE_PREPARING"].includes(request.status) ? (
                                <button
                                  className={ghostButtonClass}
                                  onClick={() =>
                                    quickExternalStatus(
                                      request.id,
                                      "MORE_INFO_REQUESTED",
                                      "Informations complémentaires demandées au partenaire."
                                    )
                                  }
                                  disabled={externalActionId === request.id}
                                >
                                  Demander plus d&apos;infos
                                </button>
                              ) : null}
                              {["UNDER_REVIEW", "MORE_INFO_REQUESTED"].includes(request.status) ? (
                                <button
                                  className={ghostButtonClass}
                                  onClick={() =>
                                    quickExternalStatus(
                                      request.id,
                                      "QUOTE_PREPARING",
                                      "Préparation de la proposition de frais."
                                    )
                                  }
                                  disabled={externalActionId === request.id}
                                >
                                  Préparer les frais
                                </button>
                              ) : null}
                              {request.status === "QUOTE_APPROVED" ? (
                                <button
                                  className={buttonClass}
                                  onClick={() =>
                                    quickExternalStatus(request.id, "SCHEDULED", "Intervention planifiée.")
                                  }
                                  disabled={externalActionId === request.id}
                                >
                                  Planifier intervention
                                </button>
                              ) : null}
                              {request.status === "SCHEDULED" ? (
                                <button
                                  className={buttonClass}
                                  onClick={() =>
                                    quickExternalStatus(request.id, "IN_PROGRESS", "Intervention démarrée.")
                                  }
                                  disabled={externalActionId === request.id}
                                >
                                  Démarrer intervention
                                </button>
                              ) : null}
                              {request.status === "IN_PROGRESS" ? (
                                <button
                                  className={buttonClass}
                                  onClick={() => quickExternalStatus(request.id, "COMPLETED", "Intervention terminée.")}
                                  disabled={externalActionId === request.id}
                                >
                                  Marquer terminée
                                </button>
                              ) : null}
                              {request.status === "COMPLETED" ? (
                                <button
                                  className={buttonClass}
                                  onClick={() => quickExternalStatus(request.id, "PAID", "Frais marqués comme payés.")}
                                  disabled={externalActionId === request.id}
                                >
                                  Marquer payée
                                </button>
                              ) : null}
                              {request.status === "PAID" || request.status === "INVOICED" ? (
                                <button
                                  className={buttonClass}
                                  onClick={() => quickExternalStatus(request.id, "CLOSED", "Intervention clôturée.")}
                                  disabled={externalActionId === request.id}
                                >
                                  Clôturer intervention
                                </button>
                              ) : null}
                              {!["COMPLETED", "INVOICED", "PAID", "CLOSED", "CANCELLED"].includes(request.status) ? (
                                <button
                                  className={ghostButtonClass}
                                  onClick={() => quickExternalStatus(request.id, "CANCELLED", "Intervention annulée.")}
                                  disabled={externalActionId === request.id}
                                >
                                  Annuler
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          </section>
        )}

        {activeTab === "codes" && (
          <section className="flex flex-col gap-5">
            <div className="bg-zinc-950 flex flex-col gap-4 rounded-3xl border border-white/10 p-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Bibliothèque atelier</p>
                <h2 className="mt-2 text-2xl font-black">Codes intervention</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {codeStats.total} codes · {codeStats.active} actifs · {codeStats.inactive} inactifs
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className={buttonClass} onClick={openNewCodeForm}>
                  Nouveau code
                </button>
                <button className={ghostButtonClass} onClick={() => seedCodes(false)} disabled={seeding}>
                  Initialiser codes standards
                </button>
                <button className={ghostButtonClass} onClick={() => seedCodes(true)} disabled={seeding}>
                  Réinitialiser standards
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 grid gap-3 rounded-3xl border border-white/10 p-4 lg:grid-cols-[1fr_220px_180px]">
              <input
                className={inputClass}
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder="Recherche code, libellé, catégorie, description..."
              />
              <select
                className={inputClass}
                value={codeCategoryFilter}
                onChange={(e) => setCodeCategoryFilter(e.target.value)}
              >
                <option value="ALL">Toutes catégories</option>
                {availableCodeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                value={codeStatusFilter}
                onChange={(e) => setCodeStatusFilter(e.target.value)}
              >
                {CODE_STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "Tous" : status === "ACTIVE" ? "Actifs" : "Inactifs"}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-950 overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[130px_1.3fr_180px_100px_90px_90px_120px_170px] gap-3 border-b border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 xl:grid">
                <span>Code</span>
                <span>Libellé</span>
                <span>Catégorie</span>
                <span>Prix</span>
                <span>Qté</span>
                <span>Durée</span>
                <span>Statut</span>
                <span className="text-right">Actions</span>
              </div>

              {codesLoading ? (
                <div className="p-6 text-sm text-zinc-400">Chargement des codes...</div>
              ) : codes.length === 0 ? (
                <div className="p-6 text-sm text-zinc-400">Aucun code ne correspond aux filtres.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {codes.map((code) => (
                    <article
                      key={code.id}
                      className="grid gap-3 px-5 py-4 text-sm xl:grid-cols-[130px_1.3fr_180px_100px_90px_90px_120px_170px] xl:items-center"
                    >
                      <div>
                        <p className="font-black text-yellow-100">{code.code}</p>
                        <p className="mt-1 text-xs text-zinc-500 xl:hidden">Modifié le {formatDate(code.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{code.label}</p>
                        <p className="line-clamp-2 mt-1 text-xs text-zinc-500">
                          {code.description || "Aucune description"}
                        </p>
                      </div>
                      <p className="text-zinc-300">{code.category}</p>
                      <p className="font-bold text-yellow-100">{formatMoney(code.unitPrice)}</p>
                      <p className="text-zinc-300">{code.defaultQty}</p>
                      <p className="text-zinc-300">
                        {code.estimatedMinutes !== null && code.estimatedMinutes !== undefined
                          ? `${code.estimatedMinutes} min`
                          : "-"}
                      </p>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          code.isActive ? "bg-emerald-400 text-black" : "bg-white/10 text-zinc-400"
                        }`}
                      >
                        {code.isActive ? "Actif" : "Inactif"}
                      </span>
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button className={ghostButtonClass} onClick={() => openEditCodeForm(code)}>
                          Modifier
                        </button>
                        {code.isActive ? (
                          <button className={ghostButtonClass} onClick={() => disableCode(code)}>
                            Désactiver
                          </button>
                        ) : (
                          <button className={buttonClass} onClick={() => reactivateCode(code)}>
                            Réactiver
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showCodeForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <form
            onSubmit={saveCode}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 text-black shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">Code intervention</p>
                <h2 className="mt-2 text-2xl font-black">{codeForm.id ? "Modifier le code" : "Nouveau code"}</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold"
                onClick={resetCodeForm}
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={lightInputClass}
                value={codeForm.code}
                onChange={(e) => updateCodeForm("code", e.target.value.toUpperCase())}
                placeholder="Code"
              />
              <input
                className={lightInputClass}
                value={codeForm.label}
                onChange={(e) => updateCodeForm("label", e.target.value)}
                placeholder="Libellé"
              />
              <select
                className={lightInputClass}
                value={codeForm.category}
                onChange={(e) => updateCodeForm("category", e.target.value)}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                className={lightInputClass}
                value={codeForm.customCategory}
                onChange={(e) => updateCodeForm("customCategory", e.target.value)}
                placeholder="Catégorie libre optionnelle"
              />
              <input
                className={lightInputClass}
                value={codeForm.unitPrice}
                onChange={(e) => updateCodeForm("unitPrice", e.target.value)}
                placeholder="Prix unitaire"
                inputMode="decimal"
              />
              <input
                className={lightInputClass}
                value={codeForm.defaultQty}
                onChange={(e) => updateCodeForm("defaultQty", e.target.value)}
                placeholder="Quantité par défaut"
                inputMode="decimal"
              />
              <input
                className={lightInputClass}
                value={codeForm.estimatedMinutes}
                onChange={(e) => updateCodeForm("estimatedMinutes", e.target.value)}
                placeholder="Durée estimée en minutes"
                inputMode="numeric"
              />
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={codeForm.isActive}
                  onChange={(e) => updateCodeForm("isActive", e.target.checked)}
                />
                Actif
              </label>
              <textarea
                className={`${lightInputClass} min-h-[120px] sm:col-span-2`}
                value={codeForm.description}
                onChange={(e) => updateCodeForm("description", e.target.value)}
                placeholder="Description"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold"
                onClick={resetCodeForm}
              >
                Annuler
              </button>
              <button type="submit" className={buttonClass} disabled={savingCode}>
                {savingCode ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:justify-center">
          <form
            onSubmit={createRequest}
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 text-black shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600">Nouvelle demande</p>
                <h2 className="mt-2 text-2xl font-black">Diagnostic garage</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold"
                onClick={() => setShowForm(false)}
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={lightInputClass}
                value={form.firstName}
                onChange={(e) => updateForm("firstName", e.target.value)}
                placeholder="Prénom"
              />
              <input
                className={lightInputClass}
                value={form.lastName}
                onChange={(e) => updateForm("lastName", e.target.value)}
                placeholder="Nom"
              />
              <input
                className={lightInputClass}
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="Téléphone"
              />
              <input
                className={lightInputClass}
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="Email"
              />
              <input
                className={lightInputClass}
                value={form.vehicleBrand}
                onChange={(e) => updateForm("vehicleBrand", e.target.value)}
                placeholder="Marque"
              />
              <input
                className={lightInputClass}
                value={form.vehicleModel}
                onChange={(e) => updateForm("vehicleModel", e.target.value)}
                placeholder="Modèle"
              />
              <input
                className={lightInputClass}
                value={form.vehicleYear}
                onChange={(e) => updateForm("vehicleYear", e.target.value)}
                placeholder="Année"
                inputMode="numeric"
              />
              <input
                className={lightInputClass}
                value={form.mileage}
                onChange={(e) => updateForm("mileage", e.target.value)}
                placeholder="Kilométrage"
                inputMode="numeric"
              />
              <input
                className={lightInputClass}
                value={form.plateNumber}
                onChange={(e) => updateForm("plateNumber", e.target.value)}
                placeholder="Plaque"
              />
              <select
                className={lightInputClass}
                value={form.priority}
                onChange={(e) => updateForm("priority", e.target.value)}
              >
                {PRIORITIES.filter((priority) => priority !== "ALL").map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabel(priority)}
                  </option>
                ))}
              </select>
              <input
                className={lightInputClass}
                value={form.problemType}
                onChange={(e) => updateForm("problemType", e.target.value)}
                placeholder="Type de problème"
              />
              <input
                className={lightInputClass}
                value={form.symptoms}
                onChange={(e) => updateForm("symptoms", e.target.value)}
                placeholder="Symptômes séparés par virgules"
              />
              <textarea
                className={`${lightInputClass} min-h-[130px] sm:col-span-2`}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Description"
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-bold"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
              <button type="submit" className={buttonClass} disabled={saving}>
                {saving ? "Création..." : "Créer la demande"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
