import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../../../lib/garage";
import { requireDashboardAuth } from "../../../../../lib/simple-auth";
import {
  GarageRequestPdfStorageError,
  buildGarageInvoiceNumber,
  generateGarageRequestInvoicePdf,
} from "../../../../../lib/garage-request-invoice";

const NO_LINES_MESSAGE =
  "Ajoutez au moins une ligne d’intervention avant de générer la facture.";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

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
      message: "Invalid garage request id.",
    });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  if (req.method === "GET") {
    try {
      const request = await prisma.garageRequest.findUnique({
        where: { id },
        select: {
          id: true,
          invoiceNumber: true,
          invoiceTotal: true,
          invoiceCurrency: true,
          invoicePdfUrl: true,
          invoicePdfGeneratedAt: true,
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Garage request not found.",
        });
      }

      if (!request.invoicePdfUrl) {
        return res.status(404).json({
          success: false,
          message: "No invoice has been generated for this garage request yet.",
        });
      }

      if (req.query.redirect === "true") {
        res.redirect(302, request.invoicePdfUrl);
        return;
      }

      return res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      console.error("GET /api/garage/requests/[id]/invoice error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch garage request invoice.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const request = await prisma.garageRequest.findUnique({
        where: { id },
        include: {
          interventions: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Garage request not found.",
        });
      }

      if (request.interventions.length === 0) {
        return res.status(409).json({
          success: false,
          message: NO_LINES_MESSAGE,
        });
      }

      const total = roundMoney(
        request.interventions.reduce((sum, line) => sum + (line.total || 0), 0)
      );

      if (!(total > 0)) {
        return res.status(409).json({
          success: false,
          message: NO_LINES_MESSAGE,
        });
      }

      // Keep an already-assigned invoice number stable across regenerations.
      const invoiceNumber =
        request.invoiceNumber ?? buildGarageInvoiceNumber(request, request.createdAt);

      const generatedInvoice = await generateGarageRequestInvoicePdf(
        getRequestOriginFallback(req),
        request,
        request.interventions.map((line) => ({
          code: line.code,
          label: line.label,
          category: line.category,
          qty: line.qty,
          unitPrice: line.unitPrice,
          total: line.total,
        })),
        invoiceNumber
      );

      const generatedAt = new Date();
      const updated = await prisma.garageRequest.update({
        where: { id },
        data: {
          invoiceNumber,
          invoiceTotal: total,
          invoiceCurrency: request.invoiceCurrency ?? "EUR",
          invoicePdfUrl: generatedInvoice.absoluteUrl,
          invoicePdfGeneratedAt: generatedAt,
        },
        include: {
          interventions: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          request: updated,
          invoiceNumber,
          invoicePdfUrl: generatedInvoice.absoluteUrl,
          invoicePdfGeneratedAt: generatedAt.toISOString(),
          invoiceTotal: total,
        },
      });
    } catch (error: any) {
      console.error("POST /api/garage/requests/[id]/invoice error:", error);

      if (error instanceof GarageRequestPdfStorageError) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unable to generate the garage request invoice PDF.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
