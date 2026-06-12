export const GARAGE_WHATSAPP_PHONE = "33621025631";

export type GarageWhatsappRequestLike = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | string | null;
  mileage?: number | string | null;
  plateNumber?: string | null;
  problemType?: string | null;
  symptoms?: string[] | string | null;
  description?: string | null;
  quoteTotal?: number | null;
  quoteNote?: string | null;
  interventions?: GarageWhatsappInterventionLine[];
};

export type GarageWhatsappInterventionLine = {
  code?: string | null;
  label: string;
  qty: number;
  unitPrice: number;
  total: number;
};

function cleanText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function valueOrFallback(value: unknown) {
  const text = cleanText(value);
  return text || "Non renseigné";
}

function formatName(request: GarageWhatsappRequestLike) {
  const name = [request.firstName, request.lastName]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");

  return name || "Non renseigné";
}

function formatSymptoms(symptoms: GarageWhatsappRequestLike["symptoms"]) {
  if (Array.isArray(symptoms)) {
    return symptoms.map(cleanText).filter(Boolean).join(", ") || "Non renseigné";
  }

  return valueOrFallback(symptoms);
}

export function formatGarageEuro(value?: number | null) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0 €";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)} €`;
}

function buildWhatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function normalizePhoneForWhatsapp(phone: string) {
  let cleaned = cleanText(phone).replace(/[\s.\-()]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  cleaned = cleaned.replace(/\D/g, "");

  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `33${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("6") && cleaned.length === 9) {
    return `352${cleaned}`;
  }

  return cleaned;
}

export function buildGarageClientRequestWhatsappUrl(
  request: GarageWhatsappRequestLike
) {
  const vehicleName = [request.vehicleBrand, request.vehicleModel]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");

  const message = [
    "Bonjour SL Automotive,",
    "",
    "Je souhaite faire une demande de diagnostic.",
    "",
    "Client :",
    `- Nom : ${formatName(request)}`,
    `- Téléphone : ${valueOrFallback(request.phone)}`,
    `- Email : ${valueOrFallback(request.email)}`,
    "",
    "Véhicule :",
    `- Marque / modèle : ${vehicleName || "Non renseigné"}`,
    `- Année : ${valueOrFallback(request.vehicleYear)}`,
    `- Kilométrage : ${valueOrFallback(request.mileage)} km`,
    `- Plaque : ${valueOrFallback(request.plateNumber)}`,
    "",
    "Problème :",
    `- Type : ${valueOrFallback(request.problemType)}`,
    `- Symptômes : ${formatSymptoms(request.symptoms)}`,
    `- Description : ${valueOrFallback(request.description)}`,
    "",
    "Merci de me recontacter pour confirmer la prise en charge.",
  ].join("\n");

  return buildWhatsappUrl(GARAGE_WHATSAPP_PHONE, message);
}

export function buildGarageQuoteWhatsappUrl(request: GarageWhatsappRequestLike) {
  const clientPhone = normalizePhoneForWhatsapp(cleanText(request.phone));
  const firstName = cleanText(request.firstName);
  const vehicleName = [request.vehicleBrand, request.vehicleModel]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");
  const interventions = request.interventions || [];

  const interventionLines = interventions.map((line, index) => {
    const code = cleanText(line.code);
    const codePrefix = code ? `${code} ` : "";

    return `${index + 1}. ${codePrefix}${line.label} - ${line.qty} x ${formatGarageEuro(
      line.unitPrice
    )} = ${formatGarageEuro(line.total)}`;
  });

  const note = cleanText(request.quoteNote);
  const message = [
    firstName ? `Bonjour ${firstName},` : "Bonjour,",
    "",
    `Suite à votre demande de diagnostic${
      vehicleName ? ` pour votre ${vehicleName}` : ""
    }, voici notre estimation :`,
    "",
    "Interventions :",
    ...interventionLines,
    "",
    `Total estimatif : ${formatGarageEuro(request.quoteTotal)}`,
    ...(note ? ["", "Note :", note] : []),
    "",
    "Ce devis est indicatif et reste soumis à confirmation après contrôle du véhicule au garage.",
    "",
    "SL Automotive",
  ].join("\n");

  return buildWhatsappUrl(clientPhone, message);
}
