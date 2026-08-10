import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../../../lib/garage";
import { requireDashboardAuth } from "../../../../../lib/simple-auth";
import {
  GarageRequestPdfStorageError,
  buildGarageQuoteNumber,
  generateGarageRequestQuotePdf,
} from "../../../../../lib/garage-request-invoice";
import { calculateInvoiceTaxTotals } from "../../../../../lib/sl-invoice-config";

const NO_LINES_MESSAGE =
  "Ajoutez au moins une ligne d’intervention avant de générer le devis.";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getRequestOriginFallback(req: NextApiRequest) {
  const header = req.headers["x-forwarded-proto"];
  const protocol = (Array.isArray(header) ? header[0] : header) || "http";
  return req.headers.host ? `${protocol}://${req.headers.host}` : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, message: "Invalid garage request id." });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({ success: false, message: auth.message });
  }

  if (req.method === "GET") {
    try {
      const request = await prisma.garageRequest.findUnique({
        where: { id },
        select: {
          id: true,
          quoteNumber: true,
          quoteTotal: true,
          quoteCurrency: true,
          quotePdfUrl: true,
          quotePdfGeneratedAt: true,
        },
      });
      if (!request) {
        return res.status(404).json({ success: false, message: "Garage request not found." });
      }
      if (!request.quotePdfUrl) {
        return res.status(404).json({ success: false, message: "No quote has been generated for this garage request yet." });
      }
      if (req.query.redirect === "true") {
        res.redirect(302, request.quotePdfUrl);
        return;
      }
      return res.status(200).json({ success: true, data: request });
    } catch (error: any) {
      console.error("GET /api/garage/requests/[id]/quote error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch garage request quote.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const request = await prisma.garageRequest.findUnique({
        where: { id },
        include: { interventions: { orderBy: { createdAt: "asc" } } },
      });
      if (!request) {
        return res.status(404).json({ success: false, message: "Garage request not found." });
      }
      if (request.interventions.length === 0) {
        return res.status(409).json({ success: false, message: NO_LINES_MESSAGE });
      }

      const subtotalHt = roundMoney(
        request.interventions.reduce((sum, line) => sum + (line.total || 0), 0)
      );
      const total = calculateInvoiceTaxTotals(subtotalHt).totalPayable;
      if (!(total > 0)) {
        return res.status(409).json({ success: false, message: NO_LINES_MESSAGE });
      }

      const quoteNumber = buildGarageQuoteNumber(request);
      const generatedQuote = await generateGarageRequestQuotePdf(
        getRequestOriginFallback(req),
        request,
        request.interventions,
        quoteNumber
      );
      const generatedAt = new Date();
      const updated = await prisma.garageRequest.update({
        where: { id },
        data: {
          quoteNumber,
          quoteTotal: total,
          quoteCurrency: request.quoteCurrency ?? "EUR",
          quotePdfUrl: generatedQuote.absoluteUrl,
          quotePdfGeneratedAt: generatedAt,
        },
        include: { interventions: { orderBy: { createdAt: "asc" } } },
      });

      return res.status(200).json({
        success: true,
        data: {
          request: updated,
          quoteNumber,
          quotePdfUrl: generatedQuote.absoluteUrl,
          quotePdfGeneratedAt: generatedAt.toISOString(),
          quoteTotal: total,
          quoteCurrency: updated.quoteCurrency,
        },
      });
    } catch (error: any) {
      console.error("POST /api/garage/requests/[id]/quote error:", error);
      if (error instanceof GarageRequestPdfStorageError) {
        return res.status(500).json({ success: false, message: error.message });
      }
      return res.status(500).json({
        success: false,
        message: "Unable to generate the garage request quote PDF.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed." });
}
