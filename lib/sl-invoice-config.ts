/**
 * Single source of truth for SL Automotive invoice issuer, tax, customer, and
 * payment details. Keep fiscal wording here so every PDF can be updated from
 * one place.
 */

export const SL_AUTOMOTIVE_ISSUER_TEXT =
  "STANLEY ARTHUR LISHOU\nSIRET : 911 982 643 00015\n+33 6 21 02 56 31\nsl-automotive.vercel.app\nSED-X Industrial Hub, Sedan, France";

export const SL_AUTOMOTIVE_PAYMENT_TEXT =
  "Paiement à l’ordre de Stanley Arthur Lishou\nIBAN: FR802043302626N261441545654\nBIC: NTSBFRM1XXX";

export const SL_INVOICE_TAX_PROFILE = {
  mode: "FR_VAT_FRANCHISE",
  vatRate: 0,
  vatLabel: "TVA non applicable",
  legalMention: "TVA non applicable, art. 293 B du Code général des impôts.",
  totalLabel: "Total net à payer",
} as const;

// From 1 September 2026, the 293 B CGI mention may need to be replaced by the
// CIBS wording. Keep this centralized so the invoice wording can be changed in
// one place.

export const SL_AUTOMOTIVE_BILLING_PROFILE = {
  name: "STANLEY ARTHUR LISHOU",
  vatNumber: process.env.SL_AUTOMOTIVE_VAT_NUMBER?.trim() || null,
  intraCommunityVatNumber:
    process.env.SL_AUTOMOTIVE_INTRACOM_VAT_NUMBER?.trim() || null,
} as const;

const NOVOTRALUX_ADDRESS_LINES = [
  "21 Stawelerstrooss, 9964",
  "Huldang Ëlwen,",
  "Luxembourg",
] as const;

export const NOVOTRALUX_BILLING_PROFILE = {
  name: "NOVOTRALUX S.À R.L.",
  address: NOVOTRALUX_ADDRESS_LINES,
  addressLines: NOVOTRALUX_ADDRESS_LINES,
  vatNumber: "LU31249718",
} as const;

export const NOVOTRALUX_BILLING_TEXT = [
  NOVOTRALUX_BILLING_PROFILE.name,
  ...NOVOTRALUX_BILLING_PROFILE.addressLines,
  `TVA client : ${NOVOTRALUX_BILLING_PROFILE.vatNumber}`,
].join("\n");

type InvoiceTaxTotals = {
  subtotalHt: number;
  vatAmount: number;
  totalPayable: number;
};

export function roundInvoiceMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatInvoiceCurrency(amount: number) {
  return new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateInvoiceTaxTotals(subtotalHt: number): InvoiceTaxTotals {
  const roundedSubtotalHt = roundInvoiceMoney(subtotalHt);

  if (SL_INVOICE_TAX_PROFILE.mode === "FR_VAT_FRANCHISE") {
    return {
      subtotalHt: roundedSubtotalHt,
      vatAmount: 0,
      totalPayable: roundedSubtotalHt,
    };
  }

  const vatAmount = roundInvoiceMoney(
    roundedSubtotalHt * SL_INVOICE_TAX_PROFILE.vatRate
  );

  return {
    subtotalHt: roundedSubtotalHt,
    vatAmount,
    totalPayable: roundInvoiceMoney(roundedSubtotalHt + vatAmount),
  };
}

export function buildSlAutomotiveIssuerText() {
  const issuerLines = [SL_AUTOMOTIVE_ISSUER_TEXT];

  if (SL_AUTOMOTIVE_BILLING_PROFILE.intraCommunityVatNumber) {
    issuerLines.push(
      `TVA intracom : ${SL_AUTOMOTIVE_BILLING_PROFILE.intraCommunityVatNumber}`
    );
  } else if (SL_AUTOMOTIVE_BILLING_PROFILE.vatNumber) {
    issuerLines.push(`TVA : ${SL_AUTOMOTIVE_BILLING_PROFILE.vatNumber}`);
  }

  return issuerLines.join("\n");
}

export function buildNovoTraluxBillingText() {
  return NOVOTRALUX_BILLING_TEXT;
}

export function normalizeInvoiceCustomerName(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/gi, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function isNovoTraluxCustomer(value?: string | null) {
  const normalized = normalizeInvoiceCustomerName(value);
  const compact = normalized.replace(/\s+/g, "");

  return (
    normalized === "NOVOTRALUX" ||
    normalized === "NOVOTRALUX S A R L" ||
    compact === "NOVOTRALUXSARL" ||
    compact === "NOVOTRALUXSRL"
  );
}

export function warnMissingSlIntraCommunityVatForEuCompany(customerName: string) {
  if (
    process.env.NODE_ENV !== "production" &&
    isNovoTraluxCustomer(customerName) &&
    !SL_AUTOMOTIVE_BILLING_PROFILE.intraCommunityVatNumber
  ) {
    console.warn(
      "SL_AUTOMOTIVE_INTRACOM_VAT_NUMBER is not configured for an invoice addressed to an EU company."
    );
  }
}
