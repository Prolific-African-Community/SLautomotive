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

export type ExternalMaintenanceInvoiceLine = {
  code?: string | null;
  label: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
};

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

const COL = { code: 50, desc: 190, qty: 50, price: 70, total: 70 };

function drawTableHeader(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  w: number
) {
  doc.fillColor("#111111").rect(x, y, w, 20).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5);
  doc.text("Code", x + 4, y + 6, { width: COL.code, lineBreak: false });
  doc.text("Description", x + 4 + COL.code, y + 6, { width: COL.desc, lineBreak: false });
  doc.text("Qté", x + 4 + COL.code + COL.desc, y + 6, { width: COL.qty, align: "right", lineBreak: false });
  doc.text("P.U.", x + 4 + COL.code + COL.desc + COL.qty, y + 6, { width: COL.price, align: "right", lineBreak: false });
  doc.text("Total", x + 4 + COL.code + COL.desc + COL.qty + COL.price, y + 6, { width: COL.total, align: "right", lineBreak: false });
}

function drawTableRow(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  w: number,
  line: ExternalMaintenanceInvoiceLine,
  shade: boolean
) {
  if (shade) {
    doc.fillColor("#f5f5f5").rect(x, y, w, 22).fill();
  }

  doc.fillColor("#111111").font("Helvetica").fontSize(8.5);
  doc.text(line.code || "-", x + 4, y + 6, { width: COL.code, lineBreak: false });

  const labelDesc = line.description ? `${line.label}\n${line.description}` : line.label;
  const rowH = line.description ? 28 : 22;

  doc.text(labelDesc, x + 4 + COL.code, y + 6, { width: COL.desc - 4, lineBreak: true, height: rowH });
  doc.text(String(line.qty), x + 4 + COL.code + COL.desc, y + 6, { width: COL.qty, align: "right", lineBreak: false });
  doc.text(formatMoney(line.unitPrice), x + 4 + COL.code + COL.desc + COL.qty, y + 6, { width: COL.price, align: "right", lineBreak: false });
  doc.text(formatMoney(line.total), x + 4 + COL.code + COL.desc + COL.qty + COL.price, y + 6, { width: COL.total, align: "right", lineBreak: false });

  doc.strokeColor("#dddddd").lineWidth(0.5).moveTo(x, y + rowH).lineTo(x + w, y + rowH).stroke();

  return rowH;
}

export async function renderExternalMaintenanceInvoicePdfBuffer(
  request: ExternalMaintenanceInvoiceRequestData,
  invoiceAmount: number,
  statusComment?: string | null,
  lines?: ExternalMaintenanceInvoiceLine[]
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

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const marginLeft = doc.page.margins.left;

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#111111")
      .text("SL Automotive", marginLeft, 50, { lineBreak: false });

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .fillColor("#111111")
      .text("Frais d'intervention", marginLeft, 78);

    doc.moveDown(0.8);

    // Meta block
    writeLine(doc, "Référence : ", invoiceReference, { boldValue: true });
    writeLine(doc, "Date : ", formatDate(invoiceDate));
    writeLine(doc, "Client : ", "NovoTralux");
    writeLine(doc, "Plaque véhicule : ", request.plateNumber || "-");
    writeLine(doc, "Type véhicule : ", request.vehicleType);
    writeLine(doc, "Type d'intervention : ", request.interventionType);
    writeLine(doc, "Réf. SL : ", request.id);
    writeLine(doc, "Réf. NovoTralux : ", request.externalRequestId);

    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(11).text("Signalement");
    doc
      .moveDown(0.3)
      .font("Helvetica")
      .fontSize(10)
      .text(request.issueDescription || "-", { lineGap: 3 });

    doc.moveDown(1);

    if (lines && lines.length > 0) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111111").text("Codes d'intervention");
      doc.moveDown(0.4);

      const tableX = marginLeft;
      const tableW = pageW;
      let curY = doc.y;

      drawTableHeader(doc, tableX, curY, tableW);
      curY += 20;

      lines.forEach((line, idx) => {
        const rowH = drawTableRow(doc, tableX, curY, tableW, line, idx % 2 === 0);
        curY += rowH;
      });

      doc.moveDown(0.3);
      doc.y = curY + 8;
    }

    // Total
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111111").text("Total frais");
    doc
      .moveDown(0.3)
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#0f766e")
      .text(formatMoney(invoiceAmount));

    doc.fillColor("#111111");

    if (statusComment) {
      doc.moveDown(0.8);
      doc.font("Helvetica-Bold").fontSize(11).text("Notes");
      doc
        .moveDown(0.3)
        .font("Helvetica")
        .fontSize(10)
        .text(statusComment, { lineGap: 3 });
    }

    // Payment instructions
    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111111").text("Instructions de paiement");
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text("STANLEY ARTHUR LISHOU")
      .text("IBAN : FR802043302626N261441545654")
      .text("BIC : NTSBFRM1XXX")
      .text("Paiement sous 10 jours");

    doc.moveDown(2);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#555555")
      .text(
        "Document généré automatiquement par SL Automotive."
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
  statusComment?: string | null,
  lines?: ExternalMaintenanceInvoiceLine[]
) {
  const renderedInvoice = await renderExternalMaintenanceInvoicePdfBuffer(
    request,
    invoiceAmount,
    statusComment,
    lines
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
