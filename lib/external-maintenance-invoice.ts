import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import PDFDocument from "pdfkit";
import type { ExternalMaintenanceRequest } from "@prisma/client";

const GENERATED_FEES_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "fees"
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

type RenderedExternalMaintenanceInvoicePdf = {
  buffer: Buffer;
  fileName: string;
  invoiceReference: string;
  publicPath: string;
};

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
  return `SLA-FEES-${datePart}-${shortId}`;
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

export async function renderExternalMaintenanceInvoicePdfBuffer(
  request: ExternalMaintenanceInvoiceRequestData,
  invoiceAmount: number,
  statusComment?: string | null
): Promise<RenderedExternalMaintenanceInvoicePdf> {
  const invoiceReference = buildInvoiceReference(request);
  const fileName = `${invoiceReference}-${slugify(
    request.plateNumber || request.externalRequestId || request.id
  )}.pdf`;
  const publicPath = `/generated/fees/${fileName}`;
  const invoiceDate = new Date();

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        resolve(Buffer.concat(chunks));
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
      .text("Frais d'intervention");

    doc.moveDown(1);

    writeLine(doc, "Référence frais : ", invoiceReference, { boldValue: true });
    writeLine(doc, "Date : ", formatDate(invoiceDate));
    writeLine(doc, "Client : ", "NovoTralux");
    writeLine(doc, "Plaque véhicule : ", request.plateNumber || "-");
    writeLine(doc, "Type véhicule : ", request.vehicleType);
    writeLine(doc, "Type d'intervention : ", request.interventionType);
    writeLine(doc, "SL request id : ", request.id);
    writeLine(doc, "NovoTralux request id : ", request.externalRequestId);

    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(11).text("Signalement");
    doc
      .moveDown(0.3)
      .font("Helvetica")
      .fontSize(10)
      .text(request.issueDescription || "-", {
        lineGap: 3,
      });

    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(11).text("Montant des frais acceptés");
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
        "Document des frais généré automatiquement par SL Automotive après acceptation par NovoTralux."
      );

    doc.end();
  });

  return {
    buffer,
    fileName,
    invoiceReference,
    publicPath,
  };
}

export async function storeExternalMaintenanceInvoicePdf(
  requestOriginFallback: string | null,
  renderedInvoice: RenderedExternalMaintenanceInvoicePdf
) {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    try {
      const blob = await put(
        `external-maintenance/fees/${renderedInvoice.fileName}`,
        renderedInvoice.buffer,
        {
          access: "public",
          addRandomSuffix: false,
          contentType: "application/pdf",
        }
      );

      return {
        storage: "blob" as const,
        fileName: renderedInvoice.fileName,
        invoiceReference: renderedInvoice.invoiceReference,
        publicPath: renderedInvoice.publicPath,
        absoluteUrl: blob.url,
      };
    } catch (error) {
      console.warn(
        "Public Vercel Blob storage failed; using the local fees PDF fallback.",
        error
      );
    }
  }

  await fs.mkdir(GENERATED_FEES_DIR, { recursive: true });
  const filePath = path.join(GENERATED_FEES_DIR, renderedInvoice.fileName);
  await fs.writeFile(filePath, renderedInvoice.buffer);

  return {
    storage: "local" as const,
    fileName: renderedInvoice.fileName,
    filePath,
    invoiceReference: renderedInvoice.invoiceReference,
    publicPath: renderedInvoice.publicPath,
    absoluteUrl: `${resolveSlAutomotivePublicBaseUrl(requestOriginFallback)}${
      renderedInvoice.publicPath
    }`,
  };
}

export async function generateExternalMaintenanceInvoicePdf(
  requestOriginFallback: string | null,
  request: ExternalMaintenanceInvoiceRequestData,
  invoiceAmount: number,
  statusComment?: string | null
) {
  const renderedInvoice = await renderExternalMaintenanceInvoicePdfBuffer(
    request,
    invoiceAmount,
    statusComment
  );

  const storedInvoice = await storeExternalMaintenanceInvoicePdf(
    requestOriginFallback,
    renderedInvoice
  );

  return {
    ...storedInvoice,
  };
}

export const generateExternalMaintenanceFeesPdf =
  generateExternalMaintenanceInvoicePdf;
