import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { put } from "@vercel/blob";
import PDFDocument from "pdfkit";
import type { GarageInterventionLine, GarageRequest } from "@prisma/client";
import {
  hasVercelBlobCredentials,
  resolveSlAutomotivePublicBaseUrl,
} from "./external-maintenance-invoice";
import {
  NOVOTRALUX_BILLING_PROFILE,
  SL_INVOICE_TAX_PROFILE,
  SL_AUTOMOTIVE_PAYMENT_TEXT,
  buildSlAutomotiveIssuerText,
  calculateInvoiceTaxTotals,
  formatInvoiceCurrency,
  isNovoTraluxCustomer,
  warnMissingSlIntraCommunityVatForEuCompany,
} from "./sl-invoice-config";
import { buildGarageInvoiceNumber as buildStableGarageInvoiceNumber } from "./sl-invoice-reference";

const GENERATED_GARAGE_INVOICES_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "garage-invoices"
);
const GENERATED_GARAGE_QUOTES_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "garage-quotes"
);

export type GarageRequestDocumentType = "INVOICE" | "QUOTE";

export type GarageInvoiceRequestData = Pick<
  GarageRequest,
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "clientVatNumber"
  | "clientBillingAddress"
  | "vehicleBrand"
  | "vehicleModel"
  | "vehicleYear"
  | "mileage"
  | "plateNumber"
  | "problemType"
  | "symptoms"
  | "description"
  | "invoiceNumber"
  | "quoteNumber"
>;

export type GarageInvoiceLine = Pick<
  GarageInterventionLine,
  "code" | "label" | "category" | "qty" | "unitPrice" | "total"
>;

type RenderedGarageRequestPdf = {
  buffer: Buffer;
  fileName: string;
  documentNumber: string;
  documentType: GarageRequestDocumentType;
  publicPath: string;
};

type TableColumn = {
  key: "description" | "qty" | "unitPrice" | "total";
  label: string;
  width: number;
  align: "left" | "center" | "right";
};

type Totals = {
  subtotalHt: number;
  vatAmount: number;
  totalPayable: number;
};

type KeyValueRow = {
  key: string;
  value: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 46;
const MARGIN_BOTTOM = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const SECTION_GAP = 18;
const BOX_PADDING = 16;
const ROW_PADDING_Y = 10;
const KEY_LABEL_WIDTH = 120;
const TABLE_QTY_WIDTH = 70;
const TABLE_UNIT_PRICE_WIDTH = 90;
const TABLE_TOTAL_WIDTH = 90;
const TABLE_DESCRIPTION_WIDTH =
  CONTENT_WIDTH - TABLE_QTY_WIDTH - TABLE_UNIT_PRICE_WIDTH - TABLE_TOTAL_WIDTH;
const TABLE_WIDTH =
  TABLE_DESCRIPTION_WIDTH + TABLE_QTY_WIDTH + TABLE_UNIT_PRICE_WIDTH + TABLE_TOTAL_WIDTH;
const TABLE_HEADER_HEIGHT = 28;
const TABLE_NUMERIC_MIN_HEIGHT = 36;
const FOOTER_HEIGHT = 136;
const FOOTER_MIN_GAP = 20;
const TITLE_FONT_SIZE = 28;
const BODY_FONT_SIZE = 10;
const SMALL_FONT_SIZE = 9;
const MICRO_FONT_SIZE = 8.5;

const PAGE_BACKGROUND = "#f7f4ee";
const PANEL_BACKGROUND = "#fffdf8";
const BORDER_COLOR = "#d9d3c7";
const TEXT_COLOR = "#111111";
const MUTED_TEXT_COLOR = "#68645c";
const ACCENT_COLOR = "#111111";
const TOTAL_COLOR = "#9a7b10";

const LOGO_CANDIDATES = [
  path.join(process.cwd(), "public", "logo-sl-automotive.png"),
  path.join(process.cwd(), "public", "logo-sl-automotive2.png"),
  path.join(process.cwd(), "public", "logo-sl-automotive.jpg"),
];

const TABLE_COLUMNS: TableColumn[] = [
  { key: "description", label: "DESCRIPTION", width: TABLE_DESCRIPTION_WIDTH, align: "left" },
  { key: "qty", label: "QTÉ", width: TABLE_QTY_WIDTH, align: "center" },
  { key: "unitPrice", label: "P.U.", width: TABLE_UNIT_PRICE_WIDTH, align: "right" },
  { key: "total", label: "TOTAL", width: TABLE_TOTAL_WIDTH, align: "right" },
];

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

function formatMoney(amount: number) {
  return formatInvoiceCurrency(amount);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function safeText(value?: string | null) {
  if (!value) return "-";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || "-";
}

function safeMultilineText(value?: string | null) {
  if (!value) return "-";
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return normalized || "-";
}

function sanitizeSingleLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getResolvedLogoPath() {
  return LOGO_CANDIDATES.find((candidate) => fsSync.existsSync(candidate)) ?? null;
}

function calculateTotals(lines: GarageInvoiceLine[]): Totals {
  return calculateInvoiceTaxTotals(lines.reduce((sum, line) => sum + line.total, 0));
}

/**
 * Deterministic, stable invoice number for a given garage request. Legacy
 * values are normalized to the short GAR-XXXXXX format, so regenerating a PDF
 * never keeps the old long format.
 */
export function buildGarageInvoiceNumber(
  request: Pick<GarageInvoiceRequestData, "id" | "invoiceNumber">,
  _referenceDate: Date = new Date()
) {
  return buildStableGarageInvoiceNumber(request);
}

export function buildGarageQuoteNumber(
  request: Pick<GarageInvoiceRequestData, "id" | "invoiceNumber" | "quoteNumber">
) {
  const existing = request.quoteNumber?.trim();
  return existing || `DEV-${buildStableGarageInvoiceNumber(request)}`;
}

function applyPageBackground(doc: InstanceType<typeof PDFDocument>) {
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(PAGE_BACKGROUND);
  doc.restore();
}

function addNewPageWithBackground(doc: InstanceType<typeof PDFDocument>) {
  doc.addPage();
  applyPageBackground(doc);
}

function drawRoundedBox(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { fillColor?: string; strokeColor?: string; radius?: number }
) {
  doc.save();
  doc
    .roundedRect(x, y, width, height, options?.radius ?? 16)
    .fillAndStroke(options?.fillColor ?? PANEL_BACKGROUND, options?.strokeColor ?? BORDER_COLOR);
  doc.restore();
}

function measureWrappedTextHeight(
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  width: number,
  options?: { font?: string; fontSize?: number; lineGap?: number }
) {
  doc.font(options?.font ?? "Helvetica").fontSize(options?.fontSize ?? BODY_FONT_SIZE);
  return doc.heightOfString(text, {
    width,
    lineGap: options?.lineGap ?? 2,
    align: "left",
  });
}

function drawWrappedText(
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: {
    font?: string;
    fontSize?: number;
    fillColor?: string;
    lineGap?: number;
    align?: "left" | "center" | "right";
    height?: number;
  }
) {
  doc
    .font(options?.font ?? "Helvetica")
    .fontSize(options?.fontSize ?? BODY_FONT_SIZE)
    .fillColor(options?.fillColor ?? TEXT_COLOR)
    .text(text, x, y, {
      width,
      lineGap: options?.lineGap ?? 2,
      align: options?.align ?? "left",
      height: options?.height,
    });
}

function drawSectionTitle(doc: InstanceType<typeof PDFDocument>, title: string, x: number, y: number) {
  doc
    .font("Helvetica-Bold")
    .fontSize(MICRO_FONT_SIZE)
    .fillColor(MUTED_TEXT_COLOR)
    .text(title, x, y, {
      width: 220,
      characterSpacing: 1.2,
    });
}

function drawPill(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  width: number,
  label: string
) {
  drawRoundedBox(doc, x, y, width, 24, {
    fillColor: "#f0ebe0",
    strokeColor: BORDER_COLOR,
    radius: 12,
  });
  drawWrappedText(doc, label, x + 10, y + 7, width - 20, {
    font: "Helvetica-Bold",
    fontSize: SMALL_FONT_SIZE,
    fillColor: TEXT_COLOR,
    align: "center",
    lineGap: 1,
  });
}

function ensurePageSpace(currentY: number, requiredHeight: number) {
  return currentY + requiredHeight <= PAGE_HEIGHT - MARGIN_BOTTOM;
}

function measureKeyValueBlockHeight(
  doc: InstanceType<typeof PDFDocument>,
  rows: KeyValueRow[],
  width: number
) {
  const valueWidth = width - KEY_LABEL_WIDTH - 14 - BOX_PADDING * 2;
  let contentHeight = 0;

  rows.forEach((row) => {
    const keyHeight = measureWrappedTextHeight(doc, row.key, KEY_LABEL_WIDTH, {
      font: "Helvetica-Bold",
      fontSize: SMALL_FONT_SIZE,
      lineGap: 1,
    });
    const valueHeight = measureWrappedTextHeight(doc, row.value, valueWidth, {
      font: "Helvetica",
      fontSize: SMALL_FONT_SIZE + 0.5,
      lineGap: 1,
    });
    contentHeight += Math.max(18, keyHeight, valueHeight) + 6;
  });

  return BOX_PADDING + 18 + contentHeight + (BOX_PADDING - 6);
}

function drawKeyValueBlock(
  doc: InstanceType<typeof PDFDocument>,
  rows: KeyValueRow[],
  x: number,
  y: number,
  width: number,
  title: string
) {
  const blockHeight = measureKeyValueBlockHeight(doc, rows, width);
  const valueWidth = width - KEY_LABEL_WIDTH - 14 - BOX_PADDING * 2;
  let rowY = y + BOX_PADDING + 18;

  drawRoundedBox(doc, x, y, width, blockHeight);
  drawSectionTitle(doc, title, x + BOX_PADDING, y + BOX_PADDING - 2);

  rows.forEach((row) => {
    const keyHeight = measureWrappedTextHeight(doc, row.key, KEY_LABEL_WIDTH, {
      font: "Helvetica-Bold",
      fontSize: SMALL_FONT_SIZE,
      lineGap: 1,
    });
    const valueHeight = measureWrappedTextHeight(doc, row.value, valueWidth, {
      font: "Helvetica",
      fontSize: SMALL_FONT_SIZE + 0.5,
      lineGap: 1,
    });
    const rowHeight = Math.max(18, keyHeight, valueHeight);

    drawWrappedText(doc, row.key, x + BOX_PADDING, rowY, KEY_LABEL_WIDTH, {
      font: "Helvetica-Bold",
      fontSize: SMALL_FONT_SIZE,
      fillColor: MUTED_TEXT_COLOR,
      lineGap: 1,
    });
    drawWrappedText(doc, row.value, x + BOX_PADDING + KEY_LABEL_WIDTH + 14, rowY, valueWidth, {
      font: "Helvetica",
      fontSize: SMALL_FONT_SIZE + 0.5,
      fillColor: TEXT_COLOR,
      lineGap: 1,
    });

    rowY += rowHeight + 6;
  });

  return blockHeight;
}

function drawTableHeader(doc: InstanceType<typeof PDFDocument>, x: number, y: number, widths: number[]) {
  doc.save();
  doc.rect(x, y, TABLE_WIDTH, TABLE_HEADER_HEIGHT).fill(ACCENT_COLOR);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(SMALL_FONT_SIZE);

  let offsetX = x;
  TABLE_COLUMNS.forEach((column, index) => {
    drawWrappedText(doc, column.label, offsetX + 10, y + 9, widths[index] - 20, {
      font: "Helvetica-Bold",
      fontSize: SMALL_FONT_SIZE,
      fillColor: "#ffffff",
      align: column.align,
      lineGap: 1,
    });
    offsetX += widths[index];
  });

  doc.restore();
}

function lineDescriptionParts(line: GarageInvoiceLine) {
  const primaryText = line.code?.trim()
    ? `${sanitizeSingleLine(line.code)} - ${sanitizeSingleLine(line.label)}`
    : safeText(line.label);
  const secondaryText = line.category?.trim() ? sanitizeSingleLine(line.category) : "";
  return { primaryText, secondaryText };
}

function measureInterventionRowHeight(
  doc: InstanceType<typeof PDFDocument>,
  line: GarageInvoiceLine,
  widths: number[]
) {
  const descriptionWidth = widths[0] - 24;
  const { primaryText, secondaryText } = lineDescriptionParts(line);
  const primaryHeight = measureWrappedTextHeight(doc, primaryText, descriptionWidth, {
    font: "Helvetica-Bold",
    fontSize: BODY_FONT_SIZE,
    lineGap: 1,
  });
  const secondaryHeight = secondaryText
    ? measureWrappedTextHeight(doc, secondaryText, descriptionWidth, {
        font: "Helvetica",
        fontSize: MICRO_FONT_SIZE,
        lineGap: 1,
      })
    : 0;

  return Math.max(
    TABLE_NUMERIC_MIN_HEIGHT,
    ROW_PADDING_Y * 2 + primaryHeight + (secondaryText ? 4 + secondaryHeight : 0)
  );
}

function drawInterventionRow(
  doc: InstanceType<typeof PDFDocument>,
  line: GarageInvoiceLine,
  x: number,
  y: number,
  widths: number[],
  height: number,
  shade: boolean
) {
  const descriptionWidth = widths[0] - 24;
  const { primaryText, secondaryText } = lineDescriptionParts(line);

  drawRoundedBox(doc, x, y, TABLE_WIDTH, height, {
    fillColor: shade ? "#fbf8f2" : "#fffdf8",
    strokeColor: BORDER_COLOR,
    radius: 0,
  });

  drawWrappedText(doc, primaryText, x + 12, y + ROW_PADDING_Y, descriptionWidth, {
    font: "Helvetica-Bold",
    fontSize: BODY_FONT_SIZE,
    fillColor: TEXT_COLOR,
    lineGap: 1,
  });

  if (secondaryText) {
    const primaryHeight = measureWrappedTextHeight(doc, primaryText, descriptionWidth, {
      font: "Helvetica-Bold",
      fontSize: BODY_FONT_SIZE,
      lineGap: 1,
    });
    drawWrappedText(doc, secondaryText, x + 12, y + ROW_PADDING_Y + primaryHeight + 4, descriptionWidth, {
      font: "Helvetica",
      fontSize: MICRO_FONT_SIZE,
      fillColor: MUTED_TEXT_COLOR,
      lineGap: 1,
    });
  }

  let offsetX = x + widths[0];
  const numericValues = [
    Number.isInteger(line.qty) ? String(line.qty) : String(line.qty).replace(".", ","),
    formatMoney(line.unitPrice),
    formatMoney(line.total),
  ];

  TABLE_COLUMNS.slice(1).forEach((column, index) => {
    drawWrappedText(doc, numericValues[index], offsetX + 10, y + height / 2 - 6, column.width - 20, {
      font: "Helvetica",
      fontSize: SMALL_FONT_SIZE + 0.5,
      fillColor: TEXT_COLOR,
      align: column.align,
      lineGap: 1,
    });
    offsetX += column.width;
  });
}

function drawFooter(doc: InstanceType<typeof PDFDocument>, y: number) {
  const rightX = MARGIN_X + CONTENT_WIDTH - 170;

  doc
    .strokeColor(BORDER_COLOR)
    .lineWidth(1)
    .moveTo(MARGIN_X, y)
    .lineTo(MARGIN_X + CONTENT_WIDTH, y)
    .stroke();

  drawSectionTitle(doc, "PAIEMENT", MARGIN_X, y + 14);
  drawWrappedText(doc, SL_AUTOMOTIVE_PAYMENT_TEXT, MARGIN_X, y + 30, 240, {
    font: "Helvetica",
    fontSize: SMALL_FONT_SIZE + 0.5,
    fillColor: TEXT_COLOR,
    lineGap: 2,
  });

  drawSectionTitle(doc, "CONDITIONS", rightX, y + 14);
  drawWrappedText(doc, "Paiement sous 10 jours", rightX, y + 30, 170, {
    font: "Helvetica",
    fontSize: SMALL_FONT_SIZE + 0.5,
    fillColor: TEXT_COLOR,
  });

  drawSectionTitle(doc, "Mention TVA", MARGIN_X, y + 74);
  drawWrappedText(doc, SL_INVOICE_TAX_PROFILE.legalMention, MARGIN_X, y + 90, CONTENT_WIDTH, {
    font: "Helvetica",
    fontSize: SMALL_FONT_SIZE + 0.5,
    fillColor: TEXT_COLOR,
    lineGap: 2,
  });

  drawWrappedText(doc, "MERCI DE VOTRE CONFIANCE", MARGIN_X, y + 116, CONTENT_WIDTH, {
    font: "Helvetica-Bold",
    fontSize: BODY_FONT_SIZE,
    fillColor: MUTED_TEXT_COLOR,
    align: "center",
  });
}

function buildClientText(request: GarageInvoiceRequestData) {
  const name =
    [request.firstName, request.lastName].filter((part) => part?.trim()).join(" ").trim() ||
    "Client non renseigné";
  const lines = [name.toUpperCase()];

  const useNovoTraluxFallback = isNovoTraluxGarageClient(request);
  const billingAddress = request.clientBillingAddress?.trim()
    ? safeMultilineText(request.clientBillingAddress)
    : useNovoTraluxFallback
    ? NOVOTRALUX_BILLING_PROFILE.addressLines.join("\n")
    : null;
  const vatNumber = request.clientVatNumber?.trim()
    ? sanitizeSingleLine(request.clientVatNumber)
    : useNovoTraluxFallback
    ? NOVOTRALUX_BILLING_PROFILE.vatNumber
    : null;

  if (billingAddress) lines.push(billingAddress);
  if (vatNumber) lines.push(`TVA client : ${vatNumber}`);

  if (request.phone?.trim()) lines.push(sanitizeSingleLine(request.phone));
  if (request.email?.trim()) lines.push(sanitizeSingleLine(request.email));

  return lines.join("\n");
}

function isNovoTraluxGarageClient(request: GarageInvoiceRequestData) {
  const normalizedIdentity = [
    request.firstName,
    request.lastName,
    request.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return normalizedIdentity.includes("novotralux") || isNovoTraluxCustomer(normalizedIdentity);
}

function buildVehicleLabel(request: GarageInvoiceRequestData) {
  return (
    [request.vehicleBrand, request.vehicleModel, request.vehicleYear]
      .filter((part) => part !== null && part !== undefined && String(part).trim())
      .join(" ")
      .trim() || "Véhicule à préciser"
  );
}

export class GarageRequestPdfStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GarageRequestPdfStorageError";
  }
}

async function renderGarageRequestPdfBuffer(
  request: GarageInvoiceRequestData,
  lines: GarageInvoiceLine[],
  documentNumber: string,
  documentType: GarageRequestDocumentType
): Promise<RenderedGarageRequestPdf> {
  const version = Date.now();
  const fileName = `${documentNumber}-v${version}-${slugify(
    request.plateNumber || request.id
  )}.pdf`;
  const publicPath = `/generated/${documentType === "QUOTE" ? "garage-quotes" : "garage-invoices"}/${fileName}`;
  const invoiceDate = new Date();
  const logoPath = getResolvedLogoPath();
  const totals = calculateTotals(lines);
  const customerName =
    [request.firstName, request.lastName].filter((part) => part?.trim()).join(" ").trim() ||
    "Client non renseigné";
  warnMissingSlIntraCommunityVatForEuCompany(customerName);

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    applyPageBackground(doc);

    const logoBoxWidth = 118;
    const logoBoxHeight = 78;
    const issuerWidth = 228;
    const cardGap = 14;
    const clientWidth = CONTENT_WIDTH - issuerWidth - cardGap;
    const tableColumnWidths = TABLE_COLUMNS.map((column) => column.width);
    let cursorY = MARGIN_TOP;

    const titleText = documentType === "QUOTE" ? "DEVIS" : "FACTURE";
    const titleHeight = measureWrappedTextHeight(doc, titleText, 280, {
      font: "Helvetica-Bold",
      fontSize: TITLE_FONT_SIZE,
      lineGap: 1,
    });

    drawWrappedText(doc, titleText, MARGIN_X, cursorY, 280, {
      font: "Helvetica-Bold",
      fontSize: TITLE_FONT_SIZE,
      fillColor: TEXT_COLOR,
      lineGap: 1,
    });

    const pillsY = cursorY + titleHeight + 18;
    const referenceLabel = documentType === "QUOTE" ? "Devis" : "Facture";
    drawPill(doc, MARGIN_X, pillsY, 230, `${referenceLabel} : ${documentNumber}`);
    drawPill(doc, MARGIN_X + 242, pillsY, 118, formatShortDate(invoiceDate));

    const logoBoxX = MARGIN_X + CONTENT_WIDTH - logoBoxWidth;
    drawRoundedBox(doc, logoBoxX, cursorY + 4, logoBoxWidth, logoBoxHeight);
    if (logoPath) {
      doc.image(logoPath, logoBoxX + 14, cursorY + 16, {
        fit: [90, 50],
        align: "center",
        valign: "center",
      });
    } else {
      drawWrappedText(doc, "SL Automotive", logoBoxX + 12, cursorY + 28, 94, {
        font: "Helvetica-Bold",
        fontSize: 14,
        fillColor: TEXT_COLOR,
        align: "center",
      });
    }

    cursorY = Math.max(pillsY + 24, cursorY + 4 + logoBoxHeight) + 18;

    doc
      .strokeColor(BORDER_COLOR)
      .lineWidth(1)
      .moveTo(MARGIN_X, cursorY)
      .lineTo(MARGIN_X + CONTENT_WIDTH, cursorY)
      .stroke();

    cursorY += SECTION_GAP;

    const issuerText = buildSlAutomotiveIssuerText();
    const clientText = buildClientText(request);
    const issuerHeight =
      BOX_PADDING * 2 +
      18 +
      measureWrappedTextHeight(doc, issuerText, issuerWidth - BOX_PADDING * 2, {
        font: "Helvetica",
        fontSize: BODY_FONT_SIZE,
        lineGap: 3,
      });
    const clientHeight =
      BOX_PADDING * 2 +
      18 +
      measureWrappedTextHeight(doc, clientText, clientWidth - BOX_PADDING * 2, {
        font: "Helvetica-Bold",
        fontSize: BODY_FONT_SIZE + 0.5,
        lineGap: 3,
      });
    const contactCardsHeight = Math.max(issuerHeight, clientHeight);

    drawRoundedBox(doc, MARGIN_X, cursorY, issuerWidth, contactCardsHeight);
    drawSectionTitle(doc, "ÉMETTEUR", MARGIN_X + BOX_PADDING, cursorY + BOX_PADDING - 2);
    drawWrappedText(doc, issuerText, MARGIN_X + BOX_PADDING, cursorY + BOX_PADDING + 18, issuerWidth - BOX_PADDING * 2, {
      font: "Helvetica",
      fontSize: BODY_FONT_SIZE,
      fillColor: TEXT_COLOR,
      lineGap: 3,
    });

    const clientX = MARGIN_X + issuerWidth + cardGap;
    drawRoundedBox(doc, clientX, cursorY, clientWidth, contactCardsHeight);
    drawSectionTitle(doc, "FACTURÉ À", clientX + BOX_PADDING, cursorY + BOX_PADDING - 2);
    drawWrappedText(doc, clientText, clientX + BOX_PADDING, cursorY + BOX_PADDING + 18, clientWidth - BOX_PADDING * 2, {
      font: "Helvetica-Bold",
      fontSize: BODY_FONT_SIZE + 0.5,
      fillColor: TEXT_COLOR,
      lineGap: 3,
    });

    cursorY += contactCardsHeight + SECTION_GAP;

    const dossierRows: KeyValueRow[] = [
      { key: "Véhicule", value: safeText(buildVehicleLabel(request)) },
      { key: "Plaque", value: safeText(request.plateNumber || "Non renseignée") },
      {
        key: "Kilométrage",
        value:
          request.mileage !== null && request.mileage !== undefined
            ? `${new Intl.NumberFormat("fr-LU").format(request.mileage)} km`
            : "Non renseigné",
      },
      { key: "Demande", value: safeText(request.problemType || "Diagnostic à qualifier") },
      {
        key: "Symptômes",
        value: safeText(request.symptoms.length > 0 ? request.symptoms.join(", ") : "Aucun"),
      },
      { key: "Détails", value: safeMultilineText(request.description || "Non renseigné") },
      { key: "Référence dossier", value: safeText(request.id) },
    ];

    const dossierHeight = measureKeyValueBlockHeight(doc, dossierRows, CONTENT_WIDTH);
    if (!ensurePageSpace(cursorY, dossierHeight)) {
      addNewPageWithBackground(doc);
      cursorY = MARGIN_TOP;
    }
    cursorY += drawKeyValueBlock(doc, dossierRows, MARGIN_X, cursorY, CONTENT_WIDTH, "DOSSIER") + SECTION_GAP;

    if (!ensurePageSpace(cursorY, TABLE_HEADER_HEIGHT + TABLE_NUMERIC_MIN_HEIGHT)) {
      addNewPageWithBackground(doc);
      cursorY = MARGIN_TOP;
    }
    drawTableHeader(doc, MARGIN_X, cursorY, tableColumnWidths);
    cursorY += TABLE_HEADER_HEIGHT;

    lines.forEach((line, index) => {
      const rowHeight = measureInterventionRowHeight(doc, line, tableColumnWidths);
      if (!ensurePageSpace(cursorY, rowHeight)) {
        addNewPageWithBackground(doc);
        cursorY = MARGIN_TOP;
        drawTableHeader(doc, MARGIN_X, cursorY, tableColumnWidths);
        cursorY += TABLE_HEADER_HEIGHT;
      }

      drawInterventionRow(doc, line, MARGIN_X, cursorY, tableColumnWidths, rowHeight, index % 2 === 0);
      cursorY += rowHeight;
    });

    cursorY += SECTION_GAP;

    const totalsRows = [
      { label: "Total HT", value: formatMoney(totals.subtotalHt), total: false },
      {
        label: "TVA",
        value:
          SL_INVOICE_TAX_PROFILE.mode === "FR_VAT_FRANCHISE"
            ? "Non applicable"
            : formatMoney(totals.vatAmount),
        total: false,
      },
      {
        label: SL_INVOICE_TAX_PROFILE.totalLabel,
        value: formatMoney(totals.totalPayable),
        total: true,
      },
    ];
    const totalsHeight = totalsRows.reduce((sum, row) => sum + (row.total ? 28 : 22), 28);
    if (!ensurePageSpace(cursorY, totalsHeight)) {
      addNewPageWithBackground(doc);
      cursorY = MARGIN_TOP;
    }

    const totalsWidth = 236;
    const totalsX = MARGIN_X + CONTENT_WIDTH - totalsWidth;
    drawRoundedBox(doc, totalsX, cursorY, totalsWidth, totalsHeight);
    let totalsY = cursorY + 16;
    totalsRows.forEach((row) => {
      drawWrappedText(doc, row.label, totalsX + 16, totalsY, 116, {
        font: row.total ? "Helvetica-Bold" : "Helvetica",
        fontSize: row.total ? 10.5 : SMALL_FONT_SIZE + 0.5,
        fillColor: row.total ? TEXT_COLOR : MUTED_TEXT_COLOR,
      });
      drawWrappedText(doc, row.value, totalsX + 136, totalsY, 84, {
        font: "Helvetica-Bold",
        fontSize: row.total ? 12 : BODY_FONT_SIZE,
        fillColor: row.total ? TOTAL_COLOR : TEXT_COLOR,
        align: "right",
      });
      totalsY += row.total ? 28 : 22;
    });
    cursorY += totalsHeight + SECTION_GAP;

    const footerY = Math.max(cursorY + FOOTER_MIN_GAP, PAGE_HEIGHT - MARGIN_BOTTOM - FOOTER_HEIGHT);
    if (footerY + FOOTER_HEIGHT > PAGE_HEIGHT - MARGIN_BOTTOM) {
      addNewPageWithBackground(doc);
      drawFooter(doc, PAGE_HEIGHT - MARGIN_BOTTOM - FOOTER_HEIGHT);
    } else {
      drawFooter(doc, footerY);
    }

    doc.end();
  });

  return {
    buffer,
    fileName,
    documentNumber,
    documentType,
    publicPath,
  };
}

export function renderGarageRequestInvoicePdfBuffer(
  request: GarageInvoiceRequestData,
  lines: GarageInvoiceLine[],
  invoiceNumber: string
) {
  return renderGarageRequestPdfBuffer(request, lines, invoiceNumber, "INVOICE");
}

export function renderGarageRequestQuotePdfBuffer(
  request: GarageInvoiceRequestData,
  lines: GarageInvoiceLine[],
  quoteNumber: string
) {
  return renderGarageRequestPdfBuffer(request, lines, quoteNumber, "QUOTE");
}

async function uploadGarageRequestPdfToBlob(buffer: Buffer, pathname: string) {
  return put(pathname, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/pdf",
    cacheControlMaxAge: 0,
  });
}

async function storeGarageRequestPdf(
  requestOriginFallback: string | null,
  renderedDocument: RenderedGarageRequestPdf
) {
  const isProduction = process.env.NODE_ENV === "production";
  const isQuote = renderedDocument.documentType === "QUOTE";
  const documentLabel = isQuote ? "quote" : "invoice";

  if (hasVercelBlobCredentials()) {
    try {
      const blob = await uploadGarageRequestPdfToBlob(
        renderedDocument.buffer,
        `garage-requests/${isQuote ? "quotes" : "invoices"}/${renderedDocument.fileName}`
      );

      return {
        storage: "blob" as const,
        fileName: renderedDocument.fileName,
        documentNumber: renderedDocument.documentNumber,
        publicPath: renderedDocument.publicPath,
        absoluteUrl: blob.url,
      };
    } catch (error) {
      console.warn(
        `Vercel Blob upload failed for a garage request ${documentLabel} PDF.`,
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { message: "Unknown Blob upload error." }
      );

      if (isProduction) {
        throw new GarageRequestPdfStorageError(
          `Unable to store the ${documentLabel} PDF in Vercel Blob. Verify that the linked Blob store is public and writable.`
        );
      }
    }
  }

  if (isProduction) {
    throw new GarageRequestPdfStorageError(
      "Vercel Blob credentials are missing for production PDF storage. Configure BLOB_READ_WRITE_TOKEN or link a Blob store with OIDC."
    );
  }

  const outputDirectory = isQuote
    ? GENERATED_GARAGE_QUOTES_DIR
    : GENERATED_GARAGE_INVOICES_DIR;
  await fs.mkdir(outputDirectory, { recursive: true });
  const filePath = path.join(outputDirectory, renderedDocument.fileName);
  await fs.writeFile(filePath, renderedDocument.buffer);

  return {
    storage: "local" as const,
    fileName: renderedDocument.fileName,
    filePath,
    documentNumber: renderedDocument.documentNumber,
    publicPath: renderedDocument.publicPath,
    absoluteUrl: `${resolveSlAutomotivePublicBaseUrl(requestOriginFallback)}${renderedDocument.publicPath}`,
  };
}

export async function generateGarageRequestInvoicePdf(
  requestOriginFallback: string | null,
  request: GarageInvoiceRequestData,
  lines: GarageInvoiceLine[],
  invoiceNumber: string
) {
  const renderedInvoice = await renderGarageRequestInvoicePdfBuffer(
    request,
    lines,
    invoiceNumber
  );

  const storedInvoice = await storeGarageRequestPdf(
    requestOriginFallback,
    renderedInvoice
  );

  return {
    ...storedInvoice,
    invoiceNumber: storedInvoice.documentNumber,
  };
}

export async function generateGarageRequestQuotePdf(
  requestOriginFallback: string | null,
  request: GarageInvoiceRequestData,
  lines: GarageInvoiceLine[],
  quoteNumber: string
) {
  const renderedQuote = await renderGarageRequestQuotePdfBuffer(
    request,
    lines,
    quoteNumber
  );
  const storedQuote = await storeGarageRequestPdf(requestOriginFallback, renderedQuote);
  return {
    ...storedQuote,
    quoteNumber: storedQuote.documentNumber,
  };
}
