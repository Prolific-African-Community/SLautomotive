import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Listing = {
  id: string;
  source: string;
  sourceUrl: string;
  brand: string;
  model: string;
  version?: string | null;
  title?: string | null;
  year?: number | null;
  mileage?: number | null;
  price?: number | null;
  currency: string;
  fuel?: string | null;
  transmission?: string | null;
  power?: string | null;
  location?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  internalStatus: string;
  createdAt: string;
  analysis?: {
    repairCostEstimate?: number | null;
    transportCost?: number | null;
    customsCost?: number | null;
    otherCosts?: number | null;
    expectedSalePrice?: number | null;
    expectedMargin?: number | null;
    marginRate?: number | null;
    plannedWorks?: string | null;
    notes?: string | null;
    priorityScore?: number | null;
    isFavorite?: boolean;
  } | null;
};

type ApiResponse = {
  success: boolean;
  data?: Listing[];
  message?: string;
};

type NewListingForm = {
  source: string;
  sourceUrl: string;
  brand: string;
  model: string;
  version: string;
  title: string;
  year: string;
  mileage: string;
  price: string;
  currency: string;
  fuel: string;
  transmission: string;
  power: string;
  location: string;
  country: string;
  imageUrl: string;
  repairCostEstimate: string;
  transportCost: string;
  customsCost: string;
  otherCosts: string;
  expectedSalePrice: string;
  plannedWorks: string;
  notes: string;
  priorityScore: string;
  isFavorite: boolean;
};

type EditListingForm = {
  id: string;
  internalStatus: string;
  price: string;
  repairCostEstimate: string;
  transportCost: string;
  customsCost: string;
  otherCosts: string;
  expectedSalePrice: string;
  plannedWorks: string;
  notes: string;
  priorityScore: string;
  isFavorite: boolean;
};

type SourcingRule = {
  id: string;
  brand: string;
  model: string;
  yearMin?: number | null;
  yearMax?: number | null;
  priceMax?: number | null;
  mileageMax?: number | null;
  countries: string[];
  sources: string[];
  isActive: boolean;
  _count?: {
    listings: number;
  };
};

type NewRuleForm = {
  brand: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMax: string;
  mileageMax: string;
  countries: string[];
  sources: string[];
  isActive: boolean;
};

type ActiveTab = "overview" | "rules" | "listings" | "analysis";

type IconProps = {
  className?: string;
};

function IconOverview({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 13h7V4H4v9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M13 20h7V4h-7v16Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20h7v-5H4v5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconRules({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 7h12M6 12h8M6 17h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconListings({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5 7h14l1.5 4H3.5L5 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 11h16v6H4v-6Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7.5" cy="17" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconAnalysis({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 17V9M12 17V5M19 17v-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAdd({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12a7 7 0 1 1-2.05-4.95L20 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRun({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M8 5v14l11-7L8 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconOpen({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 7h9v9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 7 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconEdit({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 17.5V20h2.5L18.8 8.7l-2.5-2.5L5 17.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m15.5 7 2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconStar({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="m12 4 2.3 4.7 5.2.75-3.75 3.65.9 5.15L12 15.8 7.35 18.25l.9-5.15L4.5 9.45l5.2-.75L12 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 5h3l1 4-2 1.2a10 10 0 0 0 4.8 4.8L15 13l4 1v3c0 1.1-.9 2-2 2C10.4 19 5 13.6 5 7c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReject({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M7 7 17 17M17 7 7 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClean({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 19h14M8 16l8-8M15 7l2 2M7 17l3 2 8-8-3-3-8 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconArrow({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconActivity({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 13h4l2-6 4 12 2-6h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATUSES = [
  "ALL",
  "NEW",
  "TO_REVIEW",
  "INTERESTING",
  "TO_CALL",
  "NEGOTIATION",
  "BOUGHT",
  "REJECTED",
  "EXPIRED",
  "PUBLISHED",
];

const EMPTY_FORM: NewListingForm = {
  source: "luxauto",
  sourceUrl: "",
  brand: "",
  model: "",
  version: "",
  title: "",
  year: "",
  mileage: "",
  price: "",
  currency: "EUR",
  fuel: "",
  transmission: "",
  power: "",
  location: "",
  country: "LU",
  imageUrl: "",
  repairCostEstimate: "",
  transportCost: "",
  customsCost: "",
  otherCosts: "",
  expectedSalePrice: "",
  plannedWorks: "",
  notes: "",
  priorityScore: "",
  isFavorite: false,
};

const EMPTY_RULE_FORM: NewRuleForm = {
  brand: "",
  model: "",
  yearMin: "",
  yearMax: "",
  priceMax: "",
  mileageMax: "",
  countries: ["LU", "BE", "FR", "DE", "AT", "ES", "IT", "NL"],
  sources: ["luxauto", "autoscout"],
  isActive: true,
};

const COUNTRY_OPTIONS = [
  { code: "LU", label: "Luxembourg" },
  { code: "BE", label: "Belgique" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "AT", label: "Autriche" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
  { code: "NL", label: "Pays-Bas" },
];

const SOURCE_OPTIONS = [
  { code: "luxauto", label: "Luxauto", description: "Luxembourg" },
  { code: "autoscout", label: "AutoScout24", description: "Europe" },
  { code: "mobile", label: "Mobile.de", description: "Allemagne — limité" },
];

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-zinc-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20";

const iconButtonClass =
  "group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-300 transition-all duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-yellow-300 before:transition-transform before:duration-300 hover:-translate-y-0.5 hover:border-yellow-300/60 hover:text-black hover:shadow-[0_0_28px_rgba(250,204,21,0.14)] hover:before:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

const dangerIconButtonClass =
  "group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-red-500/25 bg-red-500/[0.06] text-red-300 transition-all duration-300 before:absolute before:inset-0 before:translate-y-full before:bg-red-500 before:transition-transform before:duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:text-white hover:shadow-[0_0_28px_rgba(239,68,68,0.18)] hover:before:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40";

function formatMoney(value?: number | null, currency = "EUR") {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-LU").format(value);
}

function toNumberOrNull(value: string) {
  if (!value.trim()) return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    NEW: "Nouveau",
    TO_REVIEW: "À analyser",
    INTERESTING: "Intéressant",
    TO_CALL: "À appeler",
    NEGOTIATION: "Négociation",
    BOUGHT: "Acheté",
    REJECTED: "Refusé",
    EXPIRED: "Expiré",
    PUBLISHED: "Publié",
  };

  return map[status] || status;
}

function statusClass(status: string) {
  if (status === "INTERESTING" || status === "TO_CALL") {
    return "bg-yellow-300 text-black";
  }

  if (status === "BOUGHT" || status === "PUBLISHED") {
    return "bg-emerald-400 text-black";
  }

  if (status === "REJECTED" || status === "EXPIRED") {
    return "bg-red-500 text-white";
  }

  return "bg-white/10 text-zinc-300";
}

function cardClass(extra = "") {
  return `group rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-300/40 hover:shadow-[0_0_40px_rgba(250,204,21,0.07),inset_0_1px_0_rgba(255,255,255,0.06)] ${extra}`;
}

async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();

  try {
    const json = JSON.parse(text);

    if (!res.ok) {
      throw new Error(json.message || `Erreur API ${res.status} sur ${url}`);
    }

    return json;
  } catch (err: any) {
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      throw new Error(
        `Endpoint non JSON : ${url} — status ${res.status}. L’API renvoie une page HTML.`
      );
    }

    throw new Error(
      `Réponse invalide depuis ${url} — status ${res.status} — ${text.slice(0, 180)}`
    );
  }
}

export default function SourcingDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [form, setForm] = useState<NewListingForm>(EMPTY_FORM);

  const [editingListing, setEditingListing] = useState<EditListingForm | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [rules, setRules] = useState<SourcingRule[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState<NewRuleForm>(EMPTY_RULE_FORM);
  const [savingRule, setSavingRule] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
  const [cleaningRuleId, setCleaningRuleId] = useState<string | null>(null);
  const [ruleActionMessage, setRuleActionMessage] = useState<string | null>(null);

  function updateForm<K extends keyof NewListingForm>(key: K, value: NewListingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function updateRuleForm<K extends keyof NewRuleForm>(key: K, value: NewRuleForm[K]) {
    setRuleForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRuleArrayValue(key: "countries" | "sources", value: string) {
    setRuleForm((prev) => {
      const current = prev[key];
      const exists = current.includes(value);

      return {
        ...prev,
        [key]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  }

  function resetRuleForm() {
    setRuleForm(EMPTY_RULE_FORM);
    setRuleError(null);
  }

  async function loadRules() {
  try {
    const json = await fetchJson<{
      success: boolean;
      data?: SourcingRule[];
      message?: string;
    }>("/api/sourcing/rules");

    if (!json.success) {
      throw new Error(json.message || "Impossible de charger les règles.");
    }

    setRules(json.data || []);
  } catch (err: any) {
    setRuleError(err?.message || "Erreur chargement règles.");
  }
}

async function loadListings() {
  try {
    setLoading(true);
    setError(null);

    const json = await fetchJson<ApiResponse>("/api/sourcing/listings");

    if (!json.success) {
      throw new Error(json.message || "Impossible de charger les annonces.");
    }

    setListings(json.data || []);
  } catch (err: any) {
    setError(err?.message || "Erreur inconnue.");
  } finally {
    setLoading(false);
  }
}

async function refreshAll() {
  await Promise.all([loadListings(), loadRules()]);
}

async function createRule(e: FormEvent) {
  e.preventDefault();

  try {
    setSavingRule(true);
    setRuleError(null);
    setRuleActionMessage(null);

    if (ruleForm.countries.length === 0) {
      throw new Error("Sélectionne au moins un pays.");
    }

    if (ruleForm.sources.length === 0) {
      throw new Error("Sélectionne au moins une source.");
    }

    const json = await fetchJson<{
      success: boolean;
      data?: SourcingRule;
      message?: string;
    }>("/api/sourcing/rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: ruleForm.brand.trim(),
        model: ruleForm.model.trim(),
        yearMin: toNumberOrNull(ruleForm.yearMin),
        yearMax: toNumberOrNull(ruleForm.yearMax),
        priceMax: toNumberOrNull(ruleForm.priceMax),
        mileageMax: toNumberOrNull(ruleForm.mileageMax),
        countries: ruleForm.countries,
        sources: ruleForm.sources,
        isActive: ruleForm.isActive,
      }),
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de créer la règle.");
    }

    resetRuleForm();
    setShowRuleForm(false);
    setActiveTab("rules");
    await loadRules();
  } catch (err: any) {
    setRuleError(err?.message || "Erreur création règle.");
  } finally {
    setSavingRule(false);
  }
}

async function runRule(ruleId: string) {
  try {
    setRunningRuleId(ruleId);
    setRuleError(null);
    setRuleActionMessage(null);

    const json = await fetchJson<{
      success: boolean;
      data?: {
        rawExtractedCount?: number;
        extractedCount?: number;
        createdCount?: number;
        skippedCount?: number;
      };
      message?: string;
    }>(`/api/sourcing/run-rule/${ruleId}`, {
      method: "POST",
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de lancer le sourcing.");
    }

    const data = json.data || {};

    setRuleActionMessage(
      `Sourcing terminé : ${data.rawExtractedCount || 0} trouvées, ${
        data.extractedCount || 0
      } retenues, ${data.createdCount || 0} créées, ${
        data.skippedCount || 0
      } ignorées.`
    );

    await refreshAll();
  } catch (err: any) {
    setRuleError(err?.message || "Erreur pendant le sourcing.");
  } finally {
    setRunningRuleId(null);
  }
}

async function cleanRuleListings(ruleId: string) {
  const confirmed = window.confirm(
    "Supprimer toutes les annonces rattachées à cette règle ?"
  );

  if (!confirmed) return;

  try {
    setCleaningRuleId(ruleId);
    setRuleError(null);
    setRuleActionMessage(null);

    const json = await fetchJson<{
      success: boolean;
      data?: { deletedCount?: number };
      message?: string;
    }>(`/api/sourcing/rules/${ruleId}/listings`, {
      method: "DELETE",
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de nettoyer les annonces.");
    }

    setRuleActionMessage(
      `Nettoyage terminé : ${json.data?.deletedCount || 0} annonce(s) supprimée(s).`
    );

    await refreshAll();
  } catch (err: any) {
    setRuleError(err?.message || "Erreur pendant le nettoyage.");
  } finally {
    setCleaningRuleId(null);
  }
}

async function deleteRule(ruleId: string) {
  const confirmed = window.confirm(
    "Supprimer définitivement cette règle de sourcing ?"
  );

  if (!confirmed) return;

  try {
    setRuleError(null);
    setRuleActionMessage(null);

    const json = await fetchJson<{
      success: boolean;
      message?: string;
    }>(`/api/sourcing/rules/${ruleId}`, {
      method: "DELETE",
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de supprimer la règle.");
    }

    setRuleActionMessage("Règle supprimée.");
    await refreshAll();
  } catch (err: any) {
    setRuleError(err?.message || "Erreur pendant la suppression de la règle.");
  }
}

async function extractFromUrl() {
  if (!form.sourceUrl.trim()) {
    setFormError("Colle d’abord l’URL de l’annonce.");
    return;
  }

  try {
    setExtracting(true);
    setFormError(null);

    const json = await fetchJson<{
      success: boolean;
      data?: Partial<NewListingForm>;
      message?: string;
    }>("/api/sourcing/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceUrl: form.sourceUrl,
      }),
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible d’extraire les infos.");
    }

    const data = json.data || {};

    setForm((prev) => ({
      ...prev,
      source: data.source || prev.source,
      sourceUrl: data.sourceUrl || prev.sourceUrl,
      title: data.title || prev.title,
      imageUrl: data.imageUrl || prev.imageUrl,
    }));
  } catch (err: any) {
    setFormError(err?.message || "Erreur pendant l’extraction.");
  } finally {
    setExtracting(false);
  }
}

async function updateListingStatus(id: string, internalStatus: string) {
  try {
    const json = await fetchJson<{
      success: boolean;
      message?: string;
    }>(`/api/sourcing/listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ internalStatus }),
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de modifier le statut.");
    }

    await loadListings();
  } catch (err: any) {
    alert(err?.message || "Erreur pendant la mise à jour.");
  }
}

async function deleteListing(id: string) {
  const confirmed = window.confirm(
    "Supprimer cette annonce du dashboard sourcing ?"
  );

  if (!confirmed) return;

  try {
    const json = await fetchJson<{
      success: boolean;
      message?: string;
    }>(`/api/sourcing/listings/${id}`, {
      method: "DELETE",
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de supprimer l’annonce.");
    }

    await refreshAll();
  } catch (err: any) {
    alert(err?.message || "Erreur pendant la suppression.");
  }
}

function openEditForm(listing: Listing) {
  setEditError(null);

  setEditingListing({
    id: listing.id,
    internalStatus: listing.internalStatus,
    price: listing.price?.toString() || "",
    repairCostEstimate: listing.analysis?.repairCostEstimate?.toString() || "",
    transportCost: listing.analysis?.transportCost?.toString() || "",
    customsCost: listing.analysis?.customsCost?.toString() || "",
    otherCosts: listing.analysis?.otherCosts?.toString() || "",
    expectedSalePrice: listing.analysis?.expectedSalePrice?.toString() || "",
    plannedWorks: listing.analysis?.plannedWorks || "",
    notes: listing.analysis?.notes || "",
    priorityScore: listing.analysis?.priorityScore?.toString() || "",
    isFavorite: Boolean(listing.analysis?.isFavorite),
  });
}

function updateEditForm<K extends keyof EditListingForm>(
  key: K,
  value: EditListingForm[K]
) {
  setEditingListing((prev) => {
    if (!prev) return prev;
    return { ...prev, [key]: value };
  });
}

async function saveEditForm(e: FormEvent) {
  e.preventDefault();

  if (!editingListing) return;

  try {
    setUpdating(true);
    setEditError(null);

    const json = await fetchJson<{
      success: boolean;
      message?: string;
    }>(`/api/sourcing/listings/${editingListing.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        internalStatus: editingListing.internalStatus,
        price: editingListing.price,
        repairCostEstimate: editingListing.repairCostEstimate,
        transportCost: editingListing.transportCost,
        customsCost: editingListing.customsCost,
        otherCosts: editingListing.otherCosts,
        expectedSalePrice: editingListing.expectedSalePrice,
        plannedWorks: editingListing.plannedWorks,
        notes: editingListing.notes,
        priorityScore: editingListing.priorityScore,
        isFavorite: editingListing.isFavorite,
      }),
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de modifier l’analyse.");
    }

    setEditingListing(null);
    await refreshAll();
  } catch (err: any) {
    setEditError(err?.message || "Erreur pendant la modification.");
  } finally {
    setUpdating(false);
  }
}

async function createListing(e: FormEvent) {
  e.preventDefault();

  try {
    setSaving(true);
    setFormError(null);

    const json = await fetchJson<{
      success: boolean;
      data?: Listing;
      message?: string;
    }>("/api/sourcing/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!json.success) {
      throw new Error(json.message || "Impossible de créer l’annonce.");
    }

    resetForm();
    setShowForm(false);
    setActiveTab("listings");
    await refreshAll();
  } catch (err: any) {
    setFormError(err?.message || "Erreur inconnue.");
  } finally {
    setSaving(false);
  }
}

  useEffect(() => {
    refreshAll();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const text = `${listing.brand} ${listing.model} ${listing.version || ""} ${listing.source} ${
        listing.location || ""
      }`.toLowerCase();

      const matchesSearch = search.trim()
        ? text.includes(search.trim().toLowerCase())
        : true;

      const matchesStatus =
        statusFilter === "ALL" ? true : listing.internalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [listings, search, statusFilter]);

  const analysisListings = useMemo(() => {
    return listings.filter((listing) => {
      const status = listing.internalStatus;

      return (
        listing.analysis?.isFavorite ||
        status === "INTERESTING" ||
        status === "TO_CALL" ||
        status === "NEGOTIATION"
      );
    });
  }, [listings]);

  const stats = useMemo(() => {
    const active = listings.filter((x) => x.isActive).length;
    const favorites = listings.filter((x) => x.analysis?.isFavorite).length;
    const avgMargin =
      listings.length > 0
        ? listings.reduce((sum, x) => sum + (x.analysis?.expectedMargin || 0), 0) / listings.length
        : 0;

    const activeRules = rules.filter((rule) => rule.isActive).length;

    return {
      total: listings.length,
      active,
      favorites,
      avgMargin,
      activeRules,
    };
  }, [listings, rules]);

  const recentListings = useMemo(() => {
    return [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [listings]);

  const tabs: {
    id: ActiveTab;
    label: string;
    Icon: (props: IconProps) => JSX.Element;
  }[] = [
    { id: "overview", label: "Vue d’ensemble", Icon: IconOverview },
    { id: "rules", label: "Règles", Icon: IconRules },
    { id: "listings", label: "Annonces", Icon: IconListings },
    { id: "analysis", label: "Analyse", Icon: IconAnalysis },
  ];

  function renderListingCard(listing: Listing, compact = false) {
    const analysis = listing.analysis;

    const totalCost =
      (listing.price || 0) +
      (analysis?.repairCostEstimate || 0) +
      (analysis?.transportCost || 0) +
      (analysis?.customsCost || 0) +
      (analysis?.otherCosts || 0);

    return (
      <article key={listing.id} className={cardClass("overflow-hidden")}>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
          <div className="relative h-32 bg-zinc-950 md:h-[170px]">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.title || `${listing.brand} ${listing.model}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                Pas d’image
              </div>
            )}

            <div className="absolute left-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-[10px] font-bold uppercase text-black shadow-[0_0_22px_rgba(250,204,21,0.18)]">
              {listing.source}
            </div>
          </div>

          <div className="p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusClass(
                      listing.internalStatus
                    )}`}
                  >
                    {statusLabel(listing.internalStatus)}
                  </span>

                  {analysis?.isFavorite && (
                    <span className="inline-flex rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2.5 py-1 text-[10px] font-bold uppercase text-yellow-300">
                      Favori
                    </span>
                  )}
                </div>

                <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-white">
                  {listing.brand} {listing.model} {listing.version || ""}
                </h3>

                <p className="mt-1 text-xs text-zinc-400">
                  {listing.year || "—"} · {formatNumber(listing.mileage)} km ·{" "}
                  {listing.fuel || "—"} · {listing.country || "—"}
                </p>
              </div>

              <div className="shrink-0 md:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Prix source
                </p>
                <p className="mt-1 text-lg font-semibold text-yellow-300">
                  {formatMoney(listing.price, listing.currency)}
                </p>
              </div>
            </div>

            {!compact && (
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
                {[
                  {
                    label: "Travaux",
                    value: formatMoney(analysis?.repairCostEstimate),
                  },
                  {
                    label: "Transport",
                    value: formatMoney(analysis?.transportCost),
                  },
                  {
                    label: "Total",
                    value: listing.price ? formatMoney(totalCost) : "—",
                  },
                  {
                    label: "Revente",
                    value: formatMoney(analysis?.expectedSalePrice),
                  },
                  {
                    label: "Marge",
                    value: formatMoney(analysis?.expectedMargin),
                    highlight: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-2.5 transition ${
                      item.highlight
                        ? "border-yellow-300/60 bg-yellow-300 text-black shadow-[0_0_24px_rgba(250,204,21,0.10)]"
                        : "border-white/10 bg-white/[0.03] text-white"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
                        item.highlight ? "text-black/60" : "text-zinc-500"
                      }`}
                    >
                      {item.label}
                    </p>

                    <p className="mt-1 text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noreferrer"
                title="Voir l’annonce"
                className={iconButtonClass}
              >
                <span className="relative z-10">
                  <IconOpen />
                </span>
              </a>

              <button
                type="button"
                onClick={() => openEditForm(listing)}
                title="Modifier l’analyse"
                className={iconButtonClass}
              >
                <span className="relative z-10">
                  <IconEdit />
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateListingStatus(listing.id, "INTERESTING")}
                title="Marquer intéressant"
                className={iconButtonClass}
              >
                <span className="relative z-10">
                  <IconStar />
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateListingStatus(listing.id, "TO_CALL")}
                title="À appeler"
                className={iconButtonClass}
              >
                <span className="relative z-10">
                  <IconPhone />
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateListingStatus(listing.id, "REJECTED")}
                title="Refuser"
                className={iconButtonClass}
              >
                <span className="relative z-10">
                  <IconReject />
                </span>
              </button>

              <button
                type="button"
                onClick={() => deleteListing(listing.id)}
                title="Supprimer"
                className={dangerIconButtonClass}
              >
                <span className="relative z-10">
                  <IconTrash />
                </span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <main className="min-h-screen bg-[#070707] font-sans text-white">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-300">
              SL Automotive
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Sourcing cockpit
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              title="Ajouter une annonce"
              className={iconButtonClass}
            >
              <span className="relative z-10">
                <IconAdd />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowRuleForm(true)}
              title="Créer une règle"
              className={iconButtonClass}
            >
              <span className="relative z-10">
                <IconRules />
              </span>
            </button>

            <button
              type="button"
              onClick={refreshAll}
              title="Rafraîchir"
              className={iconButtonClass}
            >
              <span className="relative z-10">
                <IconRefresh />
              </span>
            </button>

            <a
              href="/dealer"
              className="rounded-2xl border border-white/10 bg-white px-4 py-2.5 text-xs font-semibold uppercase text-black no-underline transition hover:bg-yellow-300 hover:shadow-[0_0_24px_rgba(250,204,21,0.16)]"
            >
              Dealer
            </a>
          </div>
        </div>
      </header>

      <section className="px-5 py-6 md:px-6">
        <div className="mx-auto max-w-7xl">
          <nav className="grid grid-cols-2 gap-3 rounded-[2rem] bg-[#080808] p-3 md:grid-cols-4">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex h-20 items-center justify-center gap-4 rounded-[1.6rem] border-0 px-5 text-sm font-semibold outline-none ring-0 transition-all duration-300 focus:border-0 focus:outline-none focus:ring-0 active:border-0 active:outline-none active:ring-0 ${
                    active
                      ? "bg-yellow-300 text-black shadow-[0_0_38px_rgba(250,204,21,0.18)]"
                      : "bg-black text-zinc-500 shadow-none hover:bg-zinc-950 hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl border-0 outline-none ring-0 transition-all duration-300 ${
                      active
                        ? "bg-black/10 text-black"
                        : "bg-zinc-900 text-yellow-300 group-hover:bg-yellow-300/10 group-hover:text-yellow-300"
                    }`}
                  >
                    <tab.Icon className="h-5 w-5" />
                  </span>

                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {ruleError && (
            <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {ruleError}
            </div>
          )}

          {ruleActionMessage && (
            <div className="mt-5 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4 text-sm font-medium text-yellow-100">
              {ruleActionMessage}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {[
                  { label: "Annonces", value: stats.total, Icon: IconListings },
                  { label: "Actives", value: stats.active, Icon: IconActivity },
                  { label: "Favoris", value: stats.favorites, Icon: IconStar },
                  { label: "Règles actives", value: stats.activeRules, Icon: IconRules },
                  {
                    label: "Marge moyenne",
                    value: formatMoney(stats.avgMargin),
                    Icon: IconOpen,
                  },
                ].map((item) => (
                  <div key={item.label} className={cardClass("p-4")}>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                        {item.label}
                      </p>
                      <span className="grid h-9 w-9 place-items-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 text-yellow-300 transition group-hover:bg-yellow-300 group-hover:text-black group-hover:shadow-[0_0_24px_rgba(250,204,21,0.15)]">
                        <item.Icon />
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className={cardClass("p-5")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                        Règles actives
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">Pilotage rapide</h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("rules")}
                      title="Voir les règles"
                      className={iconButtonClass}
                    >
                      <span className="relative z-10">
                        <IconArrow />
                      </span>
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {rules.filter((rule) => rule.isActive).length === 0 ? (
                      <p className="text-sm text-zinc-500">Aucune règle active.</p>
                    ) : (
                      rules
                        .filter((rule) => rule.isActive)
                        .slice(0, 4)
                        .map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-yellow-300/30"
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {rule.brand} {rule.model}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {rule.yearMin || "—"}–{rule.yearMax || "—"} ·{" "}
                                {formatMoney(rule.priceMax)} · {formatNumber(rule.mileageMax)} km
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => runRule(rule.id)}
                              disabled={runningRuleId === rule.id}
                              title="Lancer sourcing"
                              className={iconButtonClass}
                            >
                              <span className="relative z-10">
                                {runningRuleId === rule.id ? (
                                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                ) : (
                                  <IconRun />
                                )}
                              </span>
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className={cardClass("p-5")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                        Dernières annonces
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">
                        Nouvelles opportunités
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("listings")}
                      title="Voir les annonces"
                      className={iconButtonClass}
                    >
                      <span className="relative z-10">
                        <IconArrow />
                      </span>
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {recentListings.length === 0 ? (
                      <p className="text-sm text-zinc-500">Aucune annonce.</p>
                    ) : (
                      recentListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-yellow-300/30"
                        >
                          <div className="h-14 w-16 overflow-hidden rounded-xl bg-zinc-900">
                            {listing.imageUrl ? (
                              <img
                                src={listing.imageUrl}
                                alt={listing.title || ""}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {listing.brand} {listing.model}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {listing.year || "—"} · {formatNumber(listing.mileage)} km
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-yellow-300">
                            {formatMoney(listing.price, listing.currency)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Règles de sourcing</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Crée, lance et nettoie tes recherches automatisées.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRuleForm(true)}
                  className="rounded-2xl bg-yellow-300 px-4 py-3 text-xs font-semibold uppercase text-black transition hover:bg-white hover:shadow-[0_0_24px_rgba(250,204,21,0.16)]"
                >
                  Créer une règle
                </button>
              </div>

              {rules.length === 0 ? (
                <div className={cardClass("p-6 text-sm text-zinc-500")}>
                  Aucune règle créée.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {rules.map((rule) => {
                    const isRunning = runningRuleId === rule.id;
                    const isCleaning = cleaningRuleId === rule.id;

                    return (
                      <div key={rule.id} className={cardClass("p-5")}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
                              {rule.brand}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-tight">
                              {rule.model}
                            </h3>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                              rule.isActive ? "bg-yellow-300 text-black" : "bg-white/10 text-zinc-400"
                            }`}
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          {[
                            {
                              label: "Années",
                              value: `${rule.yearMin || "—"} - ${rule.yearMax || "—"}`,
                            },
                            {
                              label: "Prix max",
                              value: formatMoney(rule.priceMax),
                            },
                            {
                              label: "Km max",
                              value: `${formatNumber(rule.mileageMax)} km`,
                            },
                            {
                              label: "Annonces",
                              value: rule._count?.listings || 0,
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                            >
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm font-semibold">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {rule.countries.map((country) => (
                            <span
                              key={country}
                              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-zinc-400"
                            >
                              {country}
                            </span>
                          ))}

                          {rule.sources.map((source) => (
                            <span
                              key={source}
                              className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2.5 py-1 text-[10px] font-semibold text-yellow-300"
                            >
                              {source}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => runRule(rule.id)}
                            disabled={isRunning || isCleaning || !rule.isActive}
                            title="Lancer sourcing"
                            className={iconButtonClass}
                          >
                            <span className="relative z-10">
                              {isRunning ? (
                                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                              ) : (
                                <IconRun />
                              )}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => cleanRuleListings(rule.id)}
                            disabled={isRunning || isCleaning}
                            title="Nettoyer les annonces"
                            className={iconButtonClass}
                          >
                            <span className="relative z-10">
                              {isCleaning ? (
                                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                              ) : (
                                <IconClean />
                              )}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteRule(rule.id)}
                            disabled={isRunning || isCleaning}
                            title="Supprimer la règle"
                            className={dangerIconButtonClass}
                          >
                            <span className="relative z-10">
                              <IconTrash />
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Annonces sourcées</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Liste compacte des véhicules récupérés et ajoutés manuellement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-2xl bg-yellow-300 px-4 py-3 text-xs font-semibold uppercase text-black transition hover:bg-white hover:shadow-[0_0_24px_rgba(250,204,21,0.16)]"
                >
                  Ajouter une annonce
                </button>
              </div>

              <div className="sticky top-0 z-20 rounded-3xl border border-white/10 bg-black/80 p-3 backdrop-blur">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher marque, modèle, source..."
                    className={inputClass}
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputClass}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status === "ALL" ? "Tous les statuts" : statusLabel(status)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={loadListings}
                    className="rounded-2xl bg-yellow-300 px-4 py-3 text-xs font-semibold uppercase text-black transition hover:bg-white"
                  >
                    Rafraîchir
                  </button>
                </div>
              </div>

              {loading && (
                <div className={cardClass("p-6 text-sm text-zinc-500")}>
                  Chargement des annonces...
                </div>
              )}

              {!loading && filteredListings.length === 0 && (
                <div className={cardClass("p-6 text-sm text-zinc-500")}>
                  Aucune annonce trouvée.
                </div>
              )}

              {!loading && filteredListings.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {filteredListings.map((listing) => renderListingCard(listing))}
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="mt-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold">Analyse & décisions</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Focus sur les favoris, opportunités, appels et négociations.
                </p>
              </div>

              {analysisListings.length === 0 ? (
                <div className={cardClass("p-6 text-sm text-zinc-500")}>
                  Aucune annonce priorisée.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {analysisListings.map((listing) => renderListingCard(listing))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {showRuleForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={createRule}
            className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 text-black shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-600">
                  Nouvelle règle
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Créer une règle de sourcing
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowRuleForm(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Fermer
              </button>
            </div>

            {ruleError && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700">
                {ruleError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={ruleForm.brand}
                onChange={(e) => updateRuleForm("brand", e.target.value)}
                placeholder="Marque ex: BMW"
                className={inputClass}
                required
              />

              <input
                value={ruleForm.model}
                onChange={(e) => updateRuleForm("model", e.target.value)}
                placeholder="Modèle ex: X3"
                className={inputClass}
                required
              />

              <input
                value={ruleForm.yearMin}
                onChange={(e) => updateRuleForm("yearMin", e.target.value)}
                placeholder="Année min"
                type="number"
                className={inputClass}
              />

              <input
                value={ruleForm.yearMax}
                onChange={(e) => updateRuleForm("yearMax", e.target.value)}
                placeholder="Année max"
                type="number"
                className={inputClass}
              />

              <input
                value={ruleForm.priceMax}
                onChange={(e) => updateRuleForm("priceMax", e.target.value)}
                placeholder="Prix max"
                type="number"
                className={inputClass}
              />

              <input
                value={ruleForm.mileageMax}
                onChange={(e) => updateRuleForm("mileageMax", e.target.value)}
                placeholder="Km max"
                type="number"
                className={inputClass}
              />

              <div className="md:col-span-2">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Pays ciblés
                </p>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {COUNTRY_OPTIONS.map((country) => {
                    const active = ruleForm.countries.includes(country.code);

                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => toggleRuleArrayValue("countries", country.code)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-yellow-400 bg-yellow-300 text-black shadow-[0_0_24px_rgba(250,204,21,0.18)]"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-black"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{country.code}</span>
                        <span className="mt-1 block text-xs opacity-70">{country.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Sources
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {SOURCE_OPTIONS.map((source) => {
                    const active = ruleForm.sources.includes(source.code);

                    return (
                      <button
                        key={source.code}
                        type="button"
                        onClick={() => toggleRuleArrayValue("sources", source.code)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-yellow-400 bg-yellow-300 text-black shadow-[0_0_24px_rgba(250,204,21,0.18)]"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-black"
                        }`}
                      >
                        <span className="block text-sm font-semibold">{source.label}</span>
                        <span className="mt-1 block text-xs opacity-70">
                          {source.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-black">
                <input
                  type="checkbox"
                  checked={ruleForm.isActive}
                  onChange={(e) => updateRuleForm("isActive", e.target.checked)}
                  className="accent-yellow-300"
                />
                Règle active
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingRule}
                className="rounded-xl bg-yellow-300 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-black hover:text-white disabled:opacity-50"
              >
                {savingRule ? "Création..." : "Créer la règle"}
              </button>

              <button
                type="button"
                onClick={resetRuleForm}
                className="rounded-xl border border-zinc-200 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={createListing}
            className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 text-black shadow-2xl md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-600">
                  Nouvelle annonce
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Ajouter une opportunité
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Fermer
              </button>
            </div>

            {formError && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                value={form.source}
                onChange={(e) => updateForm("source", e.target.value)}
                placeholder="Source ex: luxauto"
                className={inputClass}
                required
              />

              <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-[1fr_auto]">
                <input
                  value={form.sourceUrl}
                  onChange={(e) => updateForm("sourceUrl", e.target.value)}
                  placeholder="URL de l’annonce"
                  className={inputClass}
                  required
                />

                <button
                  type="button"
                  onClick={extractFromUrl}
                  disabled={extracting}
                  className="rounded-xl bg-black px-5 py-3 text-xs font-semibold uppercase text-white transition hover:bg-yellow-300 hover:text-black disabled:opacity-50"
                >
                  {extracting ? "Extraction..." : "Pré-remplir"}
                </button>
              </div>

              <input
                value={form.brand}
                onChange={(e) => updateForm("brand", e.target.value)}
                placeholder="Marque"
                className={inputClass}
                required
              />

              <input
                value={form.model}
                onChange={(e) => updateForm("model", e.target.value)}
                placeholder="Modèle"
                className={inputClass}
                required
              />

              <input
                value={form.version}
                onChange={(e) => updateForm("version", e.target.value)}
                placeholder="Version"
                className={inputClass}
              />

              <input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Titre annonce"
                className={`md:col-span-3 ${inputClass}`}
              />

              <input
                value={form.year}
                onChange={(e) => updateForm("year", e.target.value)}
                placeholder="Année"
                type="number"
                className={inputClass}
              />

              <input
                value={form.mileage}
                onChange={(e) => updateForm("mileage", e.target.value)}
                placeholder="Kilométrage"
                type="number"
                className={inputClass}
              />

              <input
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                placeholder="Prix source"
                type="number"
                className={inputClass}
              />

              <input
                value={form.fuel}
                onChange={(e) => updateForm("fuel", e.target.value)}
                placeholder="Carburant"
                className={inputClass}
              />

              <input
                value={form.transmission}
                onChange={(e) => updateForm("transmission", e.target.value)}
                placeholder="Transmission"
                className={inputClass}
              />

              <input
                value={form.power}
                onChange={(e) => updateForm("power", e.target.value)}
                placeholder="Puissance"
                className={inputClass}
              />

              <input
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
                placeholder="Localisation"
                className={inputClass}
              />

              <input
                value={form.country}
                onChange={(e) => updateForm("country", e.target.value)}
                placeholder="Pays"
                className={inputClass}
              />

              <input
                value={form.imageUrl}
                onChange={(e) => updateForm("imageUrl", e.target.value)}
                placeholder="Image URL"
                className={inputClass}
              />

              {form.imageUrl && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 md:col-span-3">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-600">
                    Aperçu image
                  </p>
                  <img
                    src={form.imageUrl}
                    alt="Aperçu annonce"
                    className="h-56 w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-600">
                Analyse business
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                  value={form.repairCostEstimate}
                  onChange={(e) => updateForm("repairCostEstimate", e.target.value)}
                  placeholder="Coût travaux"
                  type="number"
                  className={inputClass}
                />

                <input
                  value={form.transportCost}
                  onChange={(e) => updateForm("transportCost", e.target.value)}
                  placeholder="Transport"
                  type="number"
                  className={inputClass}
                />

                <input
                  value={form.customsCost}
                  onChange={(e) => updateForm("customsCost", e.target.value)}
                  placeholder="Douane"
                  type="number"
                  className={inputClass}
                />

                <input
                  value={form.otherCosts}
                  onChange={(e) => updateForm("otherCosts", e.target.value)}
                  placeholder="Autres frais"
                  type="number"
                  className={inputClass}
                />

                <input
                  value={form.expectedSalePrice}
                  onChange={(e) => updateForm("expectedSalePrice", e.target.value)}
                  placeholder="Prix de revente cible"
                  type="number"
                  className={inputClass}
                />

                <input
                  value={form.priorityScore}
                  onChange={(e) => updateForm("priorityScore", e.target.value)}
                  placeholder="Score priorité /10"
                  type="number"
                  className={inputClass}
                />

                <textarea
                  value={form.plannedWorks}
                  onChange={(e) => updateForm("plannedWorks", e.target.value)}
                  placeholder="Travaux prévus"
                  className={`min-h-[90px] resize-none md:col-span-3 ${inputClass}`}
                />

                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Notes internes"
                  className={`min-h-[90px] resize-none md:col-span-3 ${inputClass}`}
                />
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-black">
                <input
                  type="checkbox"
                  checked={form.isFavorite}
                  onChange={(e) => updateForm("isFavorite", e.target.checked)}
                  className="accent-yellow-300"
                />
                Marquer comme favori
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-yellow-300 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-black hover:text-white disabled:opacity-50"
              >
                {saving ? "Création..." : "Créer l’annonce"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-zinc-200 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      )}

      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <form
            onSubmit={saveEditForm}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-yellow-300/40 bg-white p-5 text-black shadow-2xl md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-600">
                  Modification analyse
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Mettre à jour l’opportunité
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Fermer
              </button>
            </div>

            {editError && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700">
                {editError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <select
                value={editingListing.internalStatus}
                onChange={(e) => updateEditForm("internalStatus", e.target.value)}
                className={inputClass}
              >
                {STATUSES.filter((s) => s !== "ALL").map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>

              <input
                value={editingListing.price}
                onChange={(e) => updateEditForm("price", e.target.value)}
                placeholder="Prix source"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.expectedSalePrice}
                onChange={(e) => updateEditForm("expectedSalePrice", e.target.value)}
                placeholder="Prix de revente cible"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.repairCostEstimate}
                onChange={(e) => updateEditForm("repairCostEstimate", e.target.value)}
                placeholder="Coût travaux"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.transportCost}
                onChange={(e) => updateEditForm("transportCost", e.target.value)}
                placeholder="Transport"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.customsCost}
                onChange={(e) => updateEditForm("customsCost", e.target.value)}
                placeholder="Douane"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.otherCosts}
                onChange={(e) => updateEditForm("otherCosts", e.target.value)}
                placeholder="Autres frais"
                type="number"
                className={inputClass}
              />

              <input
                value={editingListing.priorityScore}
                onChange={(e) => updateEditForm("priorityScore", e.target.value)}
                placeholder="Score priorité /10"
                type="number"
                className={inputClass}
              />

              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-black">
                <input
                  type="checkbox"
                  checked={editingListing.isFavorite}
                  onChange={(e) => updateEditForm("isFavorite", e.target.checked)}
                  className="accent-yellow-300"
                />
                Favori
              </label>

              <textarea
                value={editingListing.plannedWorks}
                onChange={(e) => updateEditForm("plannedWorks", e.target.value)}
                placeholder="Travaux prévus"
                className={`min-h-[100px] resize-none md:col-span-3 ${inputClass}`}
              />

              <textarea
                value={editingListing.notes}
                onChange={(e) => updateEditForm("notes", e.target.value)}
                placeholder="Notes internes"
                className={`min-h-[100px] resize-none md:col-span-3 ${inputClass}`}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-yellow-300 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-black hover:text-white disabled:opacity-50"
              >
                {updating ? "Sauvegarde..." : "Sauvegarder"}
              </button>

              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="rounded-xl border border-zinc-200 px-5 py-3 text-xs font-semibold uppercase text-black transition hover:bg-yellow-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}