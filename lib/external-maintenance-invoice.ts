import fs from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import type { ExternalMaintenanceRequest } from "@prisma/client";

const GENERATED_INVOICE_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "invoices"
);

export type ExternalMaintenanceInvoiceRequestData = Pick<
  ExternalMaintenanceRequest,
  | "id"
  | "externalRequestId"
  | "vehicleType"
  | "plateNumber"
  | "interventionType"
  | "issueDescription"
>;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-LU", {
    dateStyle: "medium",
  }).format(date);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("fr-LU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function resolveSlAutomotivePublicBaseUrl(
  requestOriginFallback?: string | null
) {
  const configuredBaseUrl = process.env.SL_AUTOMOTIVE_PUBLIC_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (requestOriginFallback?.trim()) {
    return normalizeBaseUrl(requestOriginFallback);
  }

  throw new Error(
    "Unable to determine SL Automotive public base URL. Set SL_AUTOMOTIVE_PUBLIC_BASE_URL."
  );
}

function buildInvoiceReference(request: ExternalMaintenanceInvoiceRequestData) {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const shortId = request.id.slice(-6).toUpperCase();
  return `SLA-INV-${datePart}-${shortId}`;
}

function writeLine(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
  options?: { gap?: number; boldValue?: boolean }
) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#111111")
    .text(label, { continued: true });

  doc
    .font(options?.boldValue ? "Helvetica-Bold" : "Helvetica")
    .text(value || "-", {
      continued: false,
    });

  doc.moveDown(options?.gap ?? 0.25);
}

export async function generateExternalMaintenanceInvoicePdf(
  requestOriginFallback: string | null,
  request: ExternalMaintenanceInvoiceRequestData,
  invoiceAmount: number,
  statusComment?: string | null
) {
  await fs.mkdir(GENERATED_INVOICE_DIR, { recursive: true });

  const invoiceReference = buildInvoiceReference(request);
  const fileName = `${invoiceReference}-${slugify(
    request.plateNumber || request.externalRequestId || request.id
  )}.pdf`;
  const filePath = path.join(GENERATED_INVOICE_DIR, fileName);
  const publicPath = `/generated/invoices/${fileName}`;
  const absoluteUrl = `${resolveSlAutomotivePublicBaseUrl(
    requestOriginFallback
  )}${publicPath}`;
  const invoiceDate = new Date();

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        await fs.writeFile(filePath, Buffer.concat(chunks));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    doc.on("error", reject);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#111111")
      .text("SL Automotive");

    doc
      .moveDown(0.4)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Facture intervention");

    doc.moveDown(1);

    writeLine(doc, "Reference facture : ", invoiceReference, { boldValue: true });
    writeLine(doc, "Date : ", formatDate(invoiceDate));
    writeLine(doc, "Client : ", "NovoTralux");
    writeLine(doc, "Plaque vehicule : ", request.plateNumber || "-");
    writeLine(doc, "Type vehicule : ", request.vehicleType);
    writeLine(doc, "Type intervention : ", request.interventionType);
    writeLine(doc, "SL request id : ", request.id);
    writeLine(doc, "NovoTralux request id : ", request.externalRequestId);

    doc.moveDown(0.6);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Signalement");
    doc
      .moveDown(0.3)
      .font("Helvetica")
      .fontSize(10)
      .text(request.issueDescription || "-", {
        lineGap: 3,
      });

    doc.moveDown(1);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Montant final facture");
    doc
      .moveDown(0.3)
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#0f766e")
      .text(formatMoney(invoiceAmount));

    doc.fillColor("#111111");

    if (statusComment) {
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(11).text("Notes");
      doc
        .moveDown(0.3)
        .font("Helvetica")
        .fontSize(10)
        .text(statusComment, { lineGap: 3 });
    }

    doc.moveDown(2);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text(
        "Document genere automatiquement par SL Automotive pour transmission au partenaire NovoTralux."
      );

    doc.end();
  });

  return {
    invoiceReference,
    fileName,
    filePath,
    publicPath,
    absoluteUrl,
  };
}
