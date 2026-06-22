import type { NextApiRequest, NextApiResponse } from "next";
import { ExternalMaintenanceStatus } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../../../lib/garage";
import { requireGarageApiAuth } from "../../../../../lib/external-maintenance";
import { regenerateExternalMaintenanceFeesPdf } from "../../../../../lib/external-maintenance-fees";
import { sendNovoTraluxMaintenanceStatusWebhook } from "../../../../../lib/novotralux-maintenance-webhook";

const PDF_REGENERATION_STATUSES = new Set<ExternalMaintenanceStatus>([
  ExternalMaintenanceStatus.QUOTE_SENT,
  ExternalMaintenanceStatus.QUOTE_APPROVED,
  ExternalMaintenanceStatus.QUOTE_REJECTED,
  ExternalMaintenanceStatus.SCHEDULED,
  ExternalMaintenanceStatus.IN_PROGRESS,
  ExternalMaintenanceStatus.COMPLETED,
  ExternalMaintenanceStatus.INVOICED,
  ExternalMaintenanceStatus.PAID,
  ExternalMaintenanceStatus.CLOSED,
]);

const REAPPROVAL_REQUIRED_STATUSES = new Set<ExternalMaintenanceStatus>([
  ExternalMaintenanceStatus.QUOTE_APPROVED,
  ExternalMaintenanceStatus.SCHEDULED,
  ExternalMaintenanceStatus.IN_PROGRESS,
  ExternalMaintenanceStatus.COMPLETED,
  ExternalMaintenanceStatus.INVOICED,
  ExternalMaintenanceStatus.PAID,
  ExternalMaintenanceStatus.CLOSED,
]);

function getRequestOriginFallback(req: NextApiRequest) {
  const forwardedProto = Array.isArray(req.headers["x-forwarded-proto"])
    ? req.headers["x-forwarded-proto"][0]
    : req.headers["x-forwarded-proto"];
  return req.headers.host
    ? `${forwardedProto || "http"}://${req.headers.host}`
    : null;
}

type LineInput = {
  interventionCodeId?: string | null;
  code?: string | null;
  label: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
};

function parseLines(body: any): LineInput[] | null {
  if (!Array.isArray(body?.lines)) return null;

  const lines: LineInput[] = [];

  for (const item of body.lines) {
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const qty = Number(item.qty);
    const unitPrice = Number(item.unitPrice);

    if (!label || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return null;
    }

    lines.push({
      interventionCodeId: typeof item.interventionCodeId === "string" ? item.interventionCodeId : null,
      code: typeof item.code === "string" ? item.code.trim() || null : null,
      label,
      description: typeof item.description === "string" ? item.description.trim() || null : null,
      qty,
      unitPrice,
    });
  }

  return lines;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const auth = requireGarageApiAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({ success: false, message: auth.message });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, message: "Invalid id." });
  }

  const existing = await prisma.externalMaintenanceRequest.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      quoteAmount: true,
      quotePdfUrl: true,
    },
  });

  if (!existing) {
    return res.status(404).json({ success: false, message: "External maintenance request not found." });
  }

  if (req.method === "GET") {
    try {
      const lines = await prisma.externalMaintenanceInterventionLine.findMany({
        where: { externalMaintenanceRequestId: id },
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json({ success: true, data: lines });
    } catch (error: any) {
      console.error("GET /api/garage/external-maintenance/[id]/lines error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch lines.", error: serializeError(error) });
    }
  }

  if (req.method === "PUT") {
    const parsed = parseLines(req.body);
    if (parsed === null) {
      return res.status(400).json({
        success: false,
        message: "lines must be an array with valid label, qty (> 0) and unitPrice (>= 0) for each entry.",
      });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.externalMaintenanceInterventionLine.deleteMany({
          where: { externalMaintenanceRequestId: id },
        });

        if (parsed.length > 0) {
          await tx.externalMaintenanceInterventionLine.createMany({
            data: parsed.map((line) => ({
              externalMaintenanceRequestId: id,
              interventionCodeId: line.interventionCodeId ?? null,
              code: line.code ?? null,
              label: line.label,
              description: line.description ?? null,
              qty: line.qty,
              unitPrice: line.unitPrice,
              total: Math.round(line.qty * line.unitPrice * 100) / 100,
            })),
          });
        }

        const linesTotal = parsed.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
        const roundedTotal = Math.round(linesTotal * 100) / 100;

        if (parsed.length > 0) {
          await tx.externalMaintenanceRequest.update({
            where: { id },
            data: { quoteAmount: roundedTotal },
          });
        }

      });

      const shouldRegeneratePdf =
        Boolean(existing.quotePdfUrl) ||
        PDF_REGENERATION_STATUSES.has(existing.status);
      let pdfRegenerated = false;
      let feesReapprovalRequired = false;
      let amountChanged = false;

      if (shouldRegeneratePdf) {
        const regeneration = await regenerateExternalMaintenanceFeesPdf(id, {
          requestOriginFallback: getRequestOriginFallback(req),
          statusComment: "Frais mis à jour après modification des lignes d'intervention.",
        });
        pdfRegenerated = true;
        amountChanged =
          existing.quoteAmount === null ||
          Math.abs(existing.quoteAmount - regeneration.feesAmount) >= 0.01;

        if (
          amountChanged &&
          REAPPROVAL_REQUIRED_STATUSES.has(existing.status)
        ) {
          await prisma.$transaction(async (tx) => {
            await tx.externalMaintenanceRequest.update({
              where: { id },
              data: { status: ExternalMaintenanceStatus.QUOTE_SENT },
            });
            await tx.externalMaintenanceStatusHistory.create({
              data: {
                externalMaintenanceRequestId: id,
                oldStatus: existing.status,
                newStatus: ExternalMaintenanceStatus.QUOTE_SENT,
                comment:
                  "Montant des frais modifié. Une nouvelle approbation NovoTralux est requise.",
              },
            });
          });
          feesReapprovalRequired = true;
        }
      }

      const request = await prisma.externalMaintenanceRequest.findUniqueOrThrow({
        where: { id },
        include: {
          interventionLines: { orderBy: { createdAt: "asc" } },
          statusHistory: { orderBy: { createdAt: "desc" } },
          webhookDeliveries: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (shouldRegeneratePdf) {
        await sendNovoTraluxMaintenanceStatusWebhook(
          request,
          feesReapprovalRequired
            ? "Frais révisés : une nouvelle approbation est requise."
            : "Frais et lignes d'intervention mis à jour par SL Automotive."
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          request,
          pdfRegenerated,
          amountChanged,
          feesReapprovalRequired,
        },
      });
    } catch (error: any) {
      console.error("PUT /api/garage/external-maintenance/[id]/lines error:", error);
      return res.status(500).json({ success: false, message: "Failed to save lines.", error: serializeError(error) });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed." });
}
