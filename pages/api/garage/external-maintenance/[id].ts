import type { NextApiRequest, NextApiResponse } from "next";
import { ExternalMaintenanceStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  serializeError,
} from "../../../../lib/garage";
import {
  buildExternalMaintenancePatchData,
  requireGarageApiAuth,
} from "../../../../lib/external-maintenance";
import { generateExternalMaintenanceInvoicePdf } from "../../../../lib/external-maintenance-invoice";
import { sendNovoTraluxMaintenanceStatusWebhook } from "../../../../lib/novotralux-maintenance-webhook";

function getRequestOriginFallback(req: NextApiRequest) {
  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const protocol = forwardedProto || "http";
  const host = req.headers.host;

  if (!host || typeof host !== "string") {
    return null;
  }

  return `${protocol}://${host}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid external maintenance request id.",
    });
  }

  if (req.method === "GET") {
    const auth = requireGarageApiAuth(req, res);
    if (!auth.ok) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    try {
      const request = await prisma.externalMaintenanceRequest.findUnique({
        where: {
          id,
        },
        include: {
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
          interventionLines: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "External maintenance request not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("GET /api/garage/external-maintenance/[id] error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch external maintenance request.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "PATCH") {
    const auth = requireGarageApiAuth(req, res);
    if (!auth.ok) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    try {
      const existing = await prisma.externalMaintenanceRequest.findUnique({
        where: {
          id,
        },
        include: {
          interventionLines: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "External maintenance request not found.",
        });
      }

      const isSendQuote = req.body?.action === "send_quote";
      const isSendInvoice = req.body?.action === "send_invoice";

      // Compute quote amount: lines total takes precedence over manual amount
      const linesTotal =
        existing.interventionLines.length > 0
          ? Math.round(
              existing.interventionLines.reduce(
                (sum, l) => sum + l.total,
                0
              ) * 100
            ) / 100
          : null;

      const manualQuoteAmount = isSendQuote
        ? parseNumber(req.body?.quoteAmount)
        : null;
      const quoteAmount = isSendQuote
        ? (linesTotal !== null ? linesTotal : manualQuoteAmount)
        : null;

      const invoiceAmount = isSendInvoice
        ? parseNumber(req.body?.invoiceAmount)
        : null;
      const canSendQuote = new Set<ExternalMaintenanceStatus>([
        ExternalMaintenanceStatus.UNDER_REVIEW,
        ExternalMaintenanceStatus.QUOTE_PREPARING,
        ExternalMaintenanceStatus.SCHEDULED,
      ]).has(existing.status);

      if (
        isSendQuote &&
        (quoteAmount === null ||
          quoteAmount === undefined ||
          quoteAmount < 0 ||
          !canSendQuote)
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A valid fees amount (or intervention lines) and an eligible maintenance status are required.",
        });
      }

      const canSendInvoice = new Set<ExternalMaintenanceStatus>([
        ExternalMaintenanceStatus.COMPLETED,
        ExternalMaintenanceStatus.IN_PROGRESS,
        ExternalMaintenanceStatus.QUOTE_APPROVED,
        ExternalMaintenanceStatus.SCHEDULED,
        ExternalMaintenanceStatus.INVOICED,
      ]).has(existing.status);

      if (
        isSendInvoice &&
        (invoiceAmount === null ||
          invoiceAmount === undefined ||
          invoiceAmount < 0 ||
          !canSendInvoice)
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A valid invoice amount and an eligible maintenance status are required.",
        });
      }

      const manualInvoicePdfUrl = isSendInvoice
        ? parseString(req.body?.invoicePdfUrl)
        : null;
      const invoiceStatusComment = isSendInvoice
        ? parseString(req.body?.statusComment) ?? "Invoice sent to NovoTralux."
        : null;
      const shouldReuseExistingInvoicePdf =
        isSendInvoice &&
        existing.status === ExternalMaintenanceStatus.INVOICED &&
        existing.invoicePdfUrl &&
        existing.invoiceAmount === invoiceAmount &&
        !manualInvoicePdfUrl;

      let resolvedInvoicePdfUrl: string | null = manualInvoicePdfUrl ?? null;

      if (
        isSendInvoice &&
        !resolvedInvoicePdfUrl &&
        shouldReuseExistingInvoicePdf
      ) {
        resolvedInvoicePdfUrl = existing.invoicePdfUrl;
      }

      if (isSendInvoice && !resolvedInvoicePdfUrl) {
        const pdfLines =
          existing.interventionLines.length > 0
            ? existing.interventionLines.map((l) => ({
                code: l.code,
                label: l.label,
                description: l.description,
                qty: l.qty,
                unitPrice: l.unitPrice,
                total: l.total,
              }))
            : undefined;
        const generatedInvoice = await generateExternalMaintenanceInvoicePdf(
          getRequestOriginFallback(req),
          existing,
          invoiceAmount as number,
          invoiceStatusComment,
          pdfLines
        );
        resolvedInvoicePdfUrl = generatedInvoice.absoluteUrl;
      }

      // For send_quote, generate PDF from lines if available
      let resolvedQuotePdfUrl: string | null = parseString(req.body?.quotePdfUrl) ?? null;
      if (isSendQuote && !resolvedQuotePdfUrl) {
        const pdfLines =
          existing.interventionLines.length > 0
            ? existing.interventionLines.map((l) => ({
                code: l.code,
                label: l.label,
                description: l.description,
                qty: l.qty,
                unitPrice: l.unitPrice,
                total: l.total,
              }))
            : undefined;
        try {
          const generatedQuote = await generateExternalMaintenanceInvoicePdf(
            getRequestOriginFallback(req),
            existing,
            quoteAmount as number,
            parseString(req.body?.statusComment) ?? null,
            pdfLines
          );
          resolvedQuotePdfUrl = generatedQuote.absoluteUrl;
        } catch (pdfError) {
          console.warn("send_quote PDF generation failed, continuing without PDF:", pdfError);
        }
      }

      const patch = isSendInvoice
        ? {
            data: {
              invoiceAmount: invoiceAmount as number,
              invoicePdfUrl: resolvedInvoicePdfUrl,
            },
            status: ExternalMaintenanceStatus.INVOICED,
            statusComment: invoiceStatusComment,
          }
        : isSendQuote
        ? {
            data: {
              quoteAmount: quoteAmount as number,
              quotePdfUrl: resolvedQuotePdfUrl,
            },
            status: ExternalMaintenanceStatus.QUOTE_SENT,
            statusComment:
              parseString(req.body?.statusComment) ??
              "Fees proposed to NovoTralux.",
          }
        : buildExternalMaintenancePatchData(req.body);

      const request = await prisma.$transaction(async (tx) => {
        const updated = await tx.externalMaintenanceRequest.update({
          where: {
            id,
          },
          data: {
            ...patch.data,
            ...(patch.status ? { status: patch.status } : {}),
          },
        });

        if (patch.status && patch.status !== existing.status) {
          await tx.externalMaintenanceStatusHistory.create({
            data: {
              externalMaintenanceRequestId: id,
              oldStatus: existing.status,
              newStatus: patch.status,
              comment: patch.statusComment,
            },
          });
        }

        return tx.externalMaintenanceRequest.findUniqueOrThrow({
          where: {
            id,
          },
          include: {
            statusHistory: {
              orderBy: {
                createdAt: "desc",
              },
            },
            interventionLines: {
              orderBy: { createdAt: "asc" },
            },
          },
        });
      });

      if (patch.status && (patch.status !== existing.status || isSendInvoice)) {
        await sendNovoTraluxMaintenanceStatusWebhook(
          request,
          patch.statusComment
        );
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error(
        "PATCH /api/garage/external-maintenance/[id] error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update external maintenance request.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
