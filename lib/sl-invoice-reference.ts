type InvoiceReferenceSource = {
  id: string;
  invoiceNumber?: string | null;
  reference?: string | null;
  requestReference?: string | null;
};

function sanitizeBlock(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getLastSixBlock(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const sanitized = sanitizeBlock(value);
  return sanitized.slice(-6);
}

export function extractShortInvoiceBlock(
  value: string | null | undefined,
  fallbackRequestId?: string | null
) {
  const segments =
    value
      ?.split("-")
      .map((segment) => sanitizeBlock(segment))
      .filter(Boolean) ?? [];

  const block = segments.at(-1) ?? sanitizeBlock(value ?? "");

  if (block) {
    return block;
  }

  return getLastSixBlock(fallbackRequestId) || "UNKNOWN";
}

function getPreferredReference(source: InvoiceReferenceSource) {
  return (
    source.invoiceNumber ??
    source.reference ??
    source.requestReference ??
    null
  );
}

export function buildExternalInvoiceNumber(source: InvoiceReferenceSource) {
  const preferredReference = getPreferredReference(source);
  const shortBlock = preferredReference
    ? extractShortInvoiceBlock(preferredReference, source.id)
    : getLastSixBlock(source.id);

  return `EXT-${shortBlock || "UNKNOWN"}`;
}

export function buildGarageInvoiceNumber(source: InvoiceReferenceSource) {
  const preferredReference = getPreferredReference(source);
  const shortBlock = preferredReference
    ? extractShortInvoiceBlock(preferredReference, source.id)
    : getLastSixBlock(source.id);

  return `GAR-${shortBlock || "UNKNOWN"}`;
}
