import type { NextApiRequest, NextApiResponse } from "next";
import { ExternalMaintenanceStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import {
  ApiResponse,
  parseNumber,
  parseString,
  serializeError,
} from "../../../../lib/garage";
import { buildExternalMaintenancePatchData } from "../../../../lib/external-maintenance";
import { sendNovoTraluxMaintenanceStatusWebhook } from "../../../../lib/novotralux-maintenance-webhook";

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
    try {
      const existing = await prisma.externalMaintenanceRequest.findUnique({
        where: {
          id,
        },
        select: {
          status: true,
        },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "External maintenance request not found.",
        });
      }

      const isSendQuote = req.body?.action === "send_quote";
      const quoteAmount = isSendQuote
        ? parseNumber(req.body?.quoteAmount)
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
            "A valid quote amount and an eligible maintenance status are required.",
        });
      }

      const patch = isSendQuote
        ? {
            data: {
              quoteAmount: quoteAmount as number,
              quotePdfUrl: parseString(req.body?.quotePdfUrl) ?? null,
            },
            status: ExternalMaintenanceStatus.QUOTE_SENT,
            statusComment:
              parseString(req.body?.statusComment) ??
              "Quote sent to NovoTralux.",
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
          },
        });
      });

      if (patch.status && patch.status !== existing.status) {
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
