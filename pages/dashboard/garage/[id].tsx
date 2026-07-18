import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  GARAGE_WHATSAPP_PHONE,
  buildGarageQuoteWhatsappUrl,
  normalizePhoneForWhatsapp,
} from "../../../lib/garage-whatsapp";
import { getDashboardPageAuthRedirect } from "../../../lib/simple-auth";

type GarageRequest = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  clientVatNumber?: string | null;
  clientBillingAddress?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  mileage?: number | null;
  plateNumber?: string | null;
  problemType?: string | null;
  symptoms: string[];
  description?: string | null;
  preferredContactMethod?: string | null;
  preferredDate?: string | null;
  status: string;
  priority: string;
  quoteTotal?: number | null;
  quoteNote?: string | null;
  mechanicNotes?: string | null;
  invoiceNumber?: string | null;
  invoiceTotal?: number | null;
  invoiceCurrency?: string | null;
  invoicePdfUrl?: string | null;
  invoicePdfGeneratedAt?: string | null;
  createdAt: string;
  interventions: GarageInterventionLine[];
};

type GarageInterventionLine = {
  id: string;
  code?: string | null;
  label: string;
  category?: string | null;
  qty: number;
  unitPrice: number;
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
};

type RequestForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientVatNumber: string;
  clientBillingAddress: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  mileage: string;
  plateNumber: string;
  problemType: string;
  symptoms: string;
  description: string;
  preferredContactMethod: string;
  preferredDate: string;
  status: string;
  priority: string;
  quoteNote: string;
  mechanicNotes: string;
};

type CodeLineForm = {
  interventionCodeId: string;
  qty: string;
  unitPrice: string;
};

type FreeLineForm = {
  code: string;
  label: string;
  category: string;
  qty: string;
  unitPrice: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const STATUSES = [
  "NEW",
  "IN_REVIEW",
  "WAITING_CLIENT",
  "QUOTE_READY",
  "QUOTE_SENT",
  "ACCEPTED",
  "REJECTED",
  "DONE",
];

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

const EMPTY_FORM: RequestForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  clientVatNumber: "",
  clientBillingAddress: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleYear: "",
  mileage: "",
  plateNumber: "",
  problemType: "",
  symptoms: "",
  description: "",
  preferredContactMethod: "",
  preferredDate: "",
  status: "NEW",
  priority: "NORMAL",
  quoteNote: "",
  mechanicNotes: "",
};

const EMPTY_CODE_LINE: CodeLineForm = {
  interventionCodeId: "",
  qty: "",
  unitPrice: "",
};

const EMPTY_FREE_LINE: FreeLineForm = {
  code: "",
  label: "",
  category: "",
  qty: "1",
  unitPrice: "",
};

const inputClass =
  "w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20";

const compactInputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300";

const buttonClass =
  "inline-flex items-center justify-center rounded-2xl border border-yellow-300/70 bg-yellow-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const ghostButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:-translate-y-0.5 hover:border-yellow-300/50 hover:text-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const dangerButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-LU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    NEW: "Nouveau",
    IN_REVIEW: "En analyse",
    WAITING_CLIENT: "Attente client",
    QUOTE_READY: "Devis prêt",
    QUOTE_SENT: "Devis envoyé",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    DONE: "Terminé",
  };

  return map[status] || status;
}

function priorityLabel(priority: string) {
  const map: Record<string, string> = {
    LOW: "Basse",
    NORMAL: "Normale",
    HIGH: "Haute",
    URGENT: "Urgente",
  };

  return map[priority] || priority;
}

function toInputValue(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNullableNumber(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function dateForInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });
  const json = await res.json();

  if (!res.ok || !json.success) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error(json.message || `Erreur API ${res.status}`);
  }

  return json;
}

export default function GarageRequestDetail() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const [request, setRequest] = useState<GarageRequest | null>(null);
  const [codes, setCodes] = useState<InterventionCode[]>([]);
  const [form, setForm] = useState<RequestForm>(EMPTY_FORM);
  const [codeLineForm, setCodeLineForm] = useState<CodeLineForm>(EMPTY_CODE_LINE);
  const [freeLineForm, setFreeLineForm] = useState<FreeLineForm>(EMPTY_FREE_LINE);
  const [codeSearch, setCodeSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lineBusyId, setLineBusyId] = useState<string | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateForm<K extends keyof RequestForm>(key: K, value: RequestForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateCodeLineForm<K extends keyof CodeLineForm>(
    key: K,
    value: CodeLineForm[K]
  ) {
    setCodeLineForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateFreeLineForm<K extends keyof FreeLineForm>(
    key: K,
    value: FreeLineForm[K]
  ) {
    setFreeLineForm((prev) => ({ ...prev, [key]: value }));
  }

  function hydrateForm(data: GarageRequest) {
    setForm({
      firstName: toInputValue(data.firstName),
      lastName: toInputValue(data.lastName),
      email: toInputValue(data.email),
      phone: toInputValue(data.phone),
      clientVatNumber: toInputValue(data.clientVatNumber),
      clientBillingAddress: toInputValue(data.clientBillingAddress),
      vehicleBrand: toInputValue(data.vehicleBrand),
      vehicleModel: toInputValue(data.vehicleModel),
      vehicleYear: toInputValue(data.vehicleYear),
      mileage: toInputValue(data.mileage),
      plateNumber: toInputValue(data.plateNumber),
      problemType: toInputValue(data.problemType),
      symptoms: data.symptoms.join(", "),
      description: toInputValue(data.description),
      preferredContactMethod: toInputValue(data.preferredContactMethod),
      preferredDate: dateForInput(data.preferredDate),
      status: data.status,
      priority: data.priority,
      quoteNote: toInputValue(data.quoteNote),
      mechanicNotes: toInputValue(data.mechanicNotes),
    });
  }

  async function loadRequest() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const json = await fetchJson<GarageRequest>(`/api/garage/requests/${id}`);
      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
    } catch (err: any) {
      setError(err?.message || "Impossible de charger la demande.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCodes() {
    try {
      const json = await fetchJson<InterventionCode[]>(
        "/api/garage/intervention-codes?activeOnly=true"
      );
      setCodes(json.data || []);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les codes.");
    }
  }

  async function saveRequest(e?: FormEvent) {
    e?.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const json = await fetchJson<GarageRequest>(`/api/garage/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicleYear: toNullableNumber(form.vehicleYear),
          mileage: toNullableNumber(form.mileage),
          preferredDate: form.preferredDate || null,
          symptoms: form.symptoms,
        }),
      });

      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
      setMessage("Demande sauvegardée.");
    } catch (err: any) {
      setError(err?.message || "Sauvegarde impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function addCodeLine(e: FormEvent) {
    e.preventDefault();
    if (!id || !codeLineForm.interventionCodeId) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const json = await fetchJson<GarageRequest>(
        `/api/garage/requests/${id}/interventions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interventionCodeId: codeLineForm.interventionCodeId,
            qty: toOptionalNumber(codeLineForm.qty),
            unitPrice: toOptionalNumber(codeLineForm.unitPrice),
          }),
        }
      );

      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
      setCodeLineForm(EMPTY_CODE_LINE);
      setMessage("Ligne ajoutée au devis.");
    } catch (err: any) {
      setError(err?.message || "Ajout impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function addFreeLine(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const json = await fetchJson<GarageRequest>(
        `/api/garage/requests/${id}/interventions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...freeLineForm,
            qty: toNullableNumber(freeLineForm.qty),
            unitPrice: toNullableNumber(freeLineForm.unitPrice),
          }),
        }
      );

      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
      setFreeLineForm(EMPTY_FREE_LINE);
      setMessage("Ligne libre ajoutée.");
    } catch (err: any) {
      setError(err?.message || "Ajout impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function updateLine(line: GarageInterventionLine, patch: Partial<GarageInterventionLine>) {
    try {
      setLineBusyId(line.id);
      setError(null);
      setMessage(null);

      const json = await fetchJson<GarageRequest>(`/api/garage/interventions/${line.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: patch.label ?? line.label,
          code: patch.code ?? line.code,
          category: patch.category ?? line.category,
          qty: patch.qty ?? line.qty,
          unitPrice: patch.unitPrice ?? line.unitPrice,
        }),
      });

      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
    } catch (err: any) {
      setError(err?.message || "Mise à jour de ligne impossible.");
    } finally {
      setLineBusyId(null);
    }
  }

  async function deleteLine(lineId: string) {
    try {
      setLineBusyId(lineId);
      setError(null);
      setMessage(null);

      const json = await fetchJson<GarageRequest>(`/api/garage/interventions/${lineId}`, {
        method: "DELETE",
      });

      if (json.data) {
        setRequest(json.data);
        hydrateForm(json.data);
      }
      setMessage("Ligne supprimée.");
    } catch (err: any) {
      setError(err?.message || "Suppression impossible.");
    } finally {
      setLineBusyId(null);
    }
  }

  async function sendQuoteWhatsapp() {
    if (!request) return;

    const phone = normalizePhoneForWhatsapp(request.phone || "");
    const hasQuote = Boolean(
      request.quoteTotal && request.quoteTotal > 0 && request.interventions.length > 0
    );

    if (!phone || !hasQuote) return;

    window.open(buildGarageQuoteWhatsappUrl(request), "_blank", "noopener,noreferrer");

    if (window.confirm("Marquer ce devis comme envoyé ?")) {
      try {
        setSaving(true);
        setError(null);
        setMessage(null);

        const json = await fetchJson<GarageRequest>(`/api/garage/requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "QUOTE_SENT" }),
        });

        if (json.data) {
          setRequest(json.data);
          hydrateForm(json.data);
        }
        setMessage("Devis marqué comme envoyé.");
      } catch (err: any) {
        setError(err?.message || "Impossible de marquer le devis comme envoyé.");
      } finally {
        setSaving(false);
      }
    }
  }

  async function generateInvoice() {
    if (!request) return;

    if (request.interventions.length === 0) {
      setError(
        "Ajoutez au moins une ligne d’intervention avant de générer la facture."
      );
      return;
    }

    try {
      setInvoiceBusy(true);
      setError(null);
      setMessage(null);

      const json = await fetchJson<{
        request: GarageRequest;
        invoiceNumber: string;
        invoicePdfUrl: string;
        invoicePdfGeneratedAt: string;
        invoiceTotal: number;
      }>(`/api/garage/requests/${id}/invoice`, {
        method: "POST",
      });

      const invoice = json.data;
      if (invoice?.request) {
        setRequest(invoice.request);
        hydrateForm(invoice.request);
      }
      setMessage(
        invoice?.invoiceNumber
          ? `Facture ${invoice.invoiceNumber} générée.`
          : "Facture générée."
      );

      if (invoice?.invoicePdfUrl) {
        window.open(invoice.invoicePdfUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      setError(err?.message || "Génération de la facture impossible.");
    } finally {
      setInvoiceBusy(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    loadRequest();
    loadCodes();
  }, [id]);

  const filteredCodes = useMemo(() => {
    const term = codeSearch.trim().toLowerCase();
    if (!term) return codes;

    return codes.filter((code) =>
      [code.code, code.label, code.category, code.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [codeSearch, codes]);

  const selectedCode = useMemo(
    () => codes.find((code) => code.id === codeLineForm.interventionCodeId),
    [codeLineForm.interventionCodeId, codes]
  );

  if (loading && !request) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-zinc-950 p-6">
          Chargement de la demande garage...
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-400/30 bg-red-500/10 p-6">
          {error || "Demande introuvable."}
        </div>
      </main>
    );
  }

  const quoteWhatsappPhone = normalizePhoneForWhatsapp(request.phone || "");
  const canSendQuoteWhatsapp = Boolean(
    quoteWhatsappPhone &&
      request.quoteTotal &&
      request.quoteTotal > 0 &&
      request.interventions.length > 0
  );
  const quoteWhatsappTitle = !quoteWhatsappPhone
    ? "Téléphone client manquant"
    : !request.quoteTotal || request.quoteTotal <= 0 || request.interventions.length === 0
    ? "Ajoutez au moins une intervention pour générer un devis"
    : "Envoyer devis WhatsApp";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/dashboard/garage">
                <a className="text-sm font-semibold text-yellow-200 hover:text-yellow-100">
                  Retour dashboard
                </a>
              </Link>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
                SL Automotive · Garage cockpit
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {[request.firstName, request.lastName].filter(Boolean).join(" ") ||
                  "Demande garage"}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                WhatsApp préparé pour le numéro atelier {GARAGE_WHATSAPP_PHONE}.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                  request.status
                )}`}
              >
                {statusLabel(request.status)}
              </span>
              <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-100">
                {priorityLabel(request.priority)}
              </span>
              <div className="rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-yellow-100/70">
                  Total devis
                </p>
                <p className="text-2xl font-black text-yellow-100">
                  {formatMoney(request.quoteTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className={buttonClass} onClick={() => saveRequest()} disabled={saving}>
              {saving ? "Sauvegarde..." : "Sauvegarder infos"}
            </button>
            <button
              className={buttonClass}
              onClick={sendQuoteWhatsapp}
              disabled={!canSendQuoteWhatsapp || saving}
              title={quoteWhatsappTitle}
            >
              Envoyer devis WhatsApp
            </button>
            <button
              className={buttonClass}
              onClick={generateInvoice}
              disabled={invoiceBusy || request.interventions.length === 0}
              title={
                request.interventions.length === 0
                  ? "Ajoutez au moins une ligne d’intervention avant de générer la facture."
                  : undefined
              }
            >
              {invoiceBusy
                ? "Génération..."
                : request.invoicePdfUrl
                ? "Regénérer facture PDF"
                : "Générer facture PDF"}
            </button>
            {request.invoicePdfUrl ? (
              <a
                className={ghostButtonClass}
                href={request.invoicePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir facture
              </a>
            ) : null}
            <button className={ghostButtonClass} onClick={loadRequest} disabled={loading}>
              Rafraîchir
            </button>
          </div>
          {request.invoiceNumber || request.invoicePdfUrl ? (
            <p className="mt-3 text-xs text-zinc-500">
              Facture {request.invoiceNumber || "générée"}
              {request.invoicePdfGeneratedAt
                ? ` · ${formatDate(request.invoicePdfGeneratedAt)}`
                : ""}
            </p>
          ) : null}
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

        <form onSubmit={saveRequest} className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <h2 className="text-lg font-black">Infos client</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={inputClass} value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} placeholder="Prénom" />
              <input className={inputClass} value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} placeholder="Nom" />
              <input className={inputClass} value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="Téléphone" />
              <input className={inputClass} value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="Email" />
              <input className={inputClass} value={form.preferredContactMethod} onChange={(e) => updateForm("preferredContactMethod", e.target.value)} placeholder="Méthode contact préférée" />
              <input className={inputClass} value={form.preferredDate} onChange={(e) => updateForm("preferredDate", e.target.value)} type="date" />
              <input className={inputClass} value={form.clientVatNumber} onChange={(e) => updateForm("clientVatNumber", e.target.value)} placeholder="TVA client" />
              <textarea className={`${inputClass} min-h-[100px] sm:col-span-2`} value={form.clientBillingAddress} onChange={(e) => updateForm("clientBillingAddress", e.target.value)} placeholder="Adresse de facturation" />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <h2 className="text-lg font-black">Véhicule</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={inputClass} value={form.vehicleBrand} onChange={(e) => updateForm("vehicleBrand", e.target.value)} placeholder="Marque" />
              <input className={inputClass} value={form.vehicleModel} onChange={(e) => updateForm("vehicleModel", e.target.value)} placeholder="Modèle" />
              <input className={inputClass} value={form.vehicleYear} onChange={(e) => updateForm("vehicleYear", e.target.value)} placeholder="Année" inputMode="numeric" />
              <input className={inputClass} value={form.mileage} onChange={(e) => updateForm("mileage", e.target.value)} placeholder="Kilométrage" inputMode="numeric" />
              <input className={inputClass} value={form.plateNumber} onChange={(e) => updateForm("plateNumber", e.target.value)} placeholder="Plaque" />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-black">Demande</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className={inputClass} value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
                <select className={inputClass} value={form.priority} onChange={(e) => updateForm("priority", e.target.value)}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabel(priority)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <input className={inputClass} value={form.problemType} onChange={(e) => updateForm("problemType", e.target.value)} placeholder="Type de problème" />
              <input className={inputClass} value={form.symptoms} onChange={(e) => updateForm("symptoms", e.target.value)} placeholder="Symptômes séparés par virgules" />
              <textarea className={`${inputClass} min-h-[130px]`} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Description client" />
              <textarea className={`${inputClass} min-h-[130px]`} value={form.mechanicNotes} onChange={(e) => updateForm("mechanicNotes", e.target.value)} placeholder="Notes mécanicien" />
              <textarea className={`${inputClass} min-h-[100px] lg:col-span-2`} value={form.quoteNote} onChange={(e) => updateForm("quoteNote", e.target.value)} placeholder="Note devis" />
            </div>
          </section>
        </form>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black">Devis / interventions</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {request.interventions.length} ligne
                {request.interventions.length > 1 ? "s" : ""} · total{" "}
                {formatMoney(request.quoteTotal)}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-3">Code</th>
                  <th className="py-3 pr-3">Libellé</th>
                  <th className="py-3 pr-3">Catégorie</th>
                  <th className="py-3 pr-3">Qté</th>
                  <th className="py-3 pr-3">PU</th>
                  <th className="py-3 pr-3">Total</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {request.interventions.length === 0 ? (
                  <tr>
                    <td className="py-5 text-zinc-500" colSpan={7}>
                      Aucune ligne d'intervention pour le moment.
                    </td>
                  </tr>
                ) : (
                  request.interventions.map((line) => (
                    <tr key={line.id} className="border-b border-white/5 align-top">
                      <td className="py-3 pr-3 text-zinc-300">{line.code || "-"}</td>
                      <td className="py-3 pr-3 font-semibold text-white">{line.label}</td>
                      <td className="py-3 pr-3 text-zinc-400">{line.category || "-"}</td>
                      <td className="py-3 pr-3">
                        <input
                          className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white"
                          defaultValue={line.qty}
                          inputMode="decimal"
                          onBlur={(e) => {
                            const qty = Number(e.target.value);
                            if (Number.isFinite(qty) && qty !== line.qty) {
                              updateLine(line, { qty });
                            }
                          }}
                          disabled={lineBusyId === line.id}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <input
                          className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white"
                          defaultValue={line.unitPrice}
                          inputMode="decimal"
                          onBlur={(e) => {
                            const unitPrice = Number(e.target.value);
                            if (
                              Number.isFinite(unitPrice) &&
                              unitPrice !== line.unitPrice
                            ) {
                              updateLine(line, { unitPrice });
                            }
                          }}
                          disabled={lineBusyId === line.id}
                        />
                      </td>
                      <td className="py-3 pr-3 font-bold text-yellow-100">
                        {formatMoney(line.total)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          className={dangerButtonClass}
                          onClick={() => deleteLine(line.id)}
                          disabled={lineBusyId === line.id}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={addCodeLine} className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <h2 className="text-lg font-black">Ajouter depuis la bibliothèque</h2>
            <div className="mt-4 grid gap-3">
              <input className={inputClass} value={codeSearch} onChange={(e) => setCodeSearch(e.target.value)} placeholder="Filtrer les codes..." />
              <select
                className={inputClass}
                value={codeLineForm.interventionCodeId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  const code = codes.find((item) => item.id === nextId);
                  updateCodeLineForm("interventionCodeId", nextId);
                  updateCodeLineForm("qty", code ? String(code.defaultQty) : "");
                  updateCodeLineForm("unitPrice", code ? String(code.unitPrice) : "");
                }}
              >
                <option value="">Sélectionner un code intervention</option>
                {filteredCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.category} · {code.code} · {code.label}
                  </option>
                ))}
              </select>
              {selectedCode && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
                  <p className="font-semibold text-white">
                    {selectedCode.code} · {selectedCode.label}
                  </p>
                  <p className="mt-1 text-zinc-500">{selectedCode.description}</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={compactInputClass} value={codeLineForm.qty} onChange={(e) => updateCodeLineForm("qty", e.target.value)} placeholder="Qté" inputMode="decimal" />
                <input className={compactInputClass} value={codeLineForm.unitPrice} onChange={(e) => updateCodeLineForm("unitPrice", e.target.value)} placeholder="Prix override" inputMode="decimal" />
              </div>
              <button className={buttonClass} disabled={saving || !codeLineForm.interventionCodeId}>
                Ajouter le code
              </button>
            </div>
          </form>

          <form onSubmit={addFreeLine} className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
            <h2 className="text-lg font-black">Ajouter une ligne libre</h2>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputClass} value={freeLineForm.code} onChange={(e) => updateFreeLineForm("code", e.target.value)} placeholder="Code optionnel" />
                <input className={inputClass} value={freeLineForm.category} onChange={(e) => updateFreeLineForm("category", e.target.value)} placeholder="Catégorie" />
              </div>
              <input className={inputClass} value={freeLineForm.label} onChange={(e) => updateFreeLineForm("label", e.target.value)} placeholder="Libellé" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={compactInputClass} value={freeLineForm.qty} onChange={(e) => updateFreeLineForm("qty", e.target.value)} placeholder="Qté" inputMode="decimal" />
                <input className={compactInputClass} value={freeLineForm.unitPrice} onChange={(e) => updateFreeLineForm("unitPrice", e.target.value)} placeholder="Prix unitaire" inputMode="decimal" />
              </div>
              <button className={buttonClass} disabled={saving || !freeLineForm.label || !freeLineForm.unitPrice}>
                Ajouter la ligne libre
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getDashboardPageAuthRedirect(context);
};
