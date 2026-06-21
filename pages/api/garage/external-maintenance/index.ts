import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../../lib/garage";
import {
  findExistingExternalMaintenanceRequest,
  normalizeExternalMaintenancePayload,
  requireGarageApiAuth,
  validateExternalMaintenanceCreateData,
  verifyNovoTraluxApiKey,
} from "../../../../lib/external-maintenance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === "GET") {
    const auth = requireGarageApiAuth(req, res);
    if (!auth.ok) {
      return res.status(auth.status).json({
        success: false,
        message: auth.message,
      });
    }

    try {
      const requests = await prisma.externalMaintenanceRequest.findMany({
        orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
        include: {
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
          webhookDeliveries: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error: any) {
      console.error("GET /api/garage/external-maintenance error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch external maintenance requests.",
        error: serializeError(error),
      });
    }
  }

  if (req.method === "POST") {
    try {
      const auth = verifyNovoTraluxApiKey(req);
      if (!auth.ok) {
        return res.status(auth.status).json({
          success: false,
          message: auth.message,
        });
      }

      const data = normalizeExternalMaintenancePayload(req.body);
      const validationMessage = validateExternalMaintenanceCreateData(data);

      if (validationMessage) {
        return res.status(400).json({
          success: false,
          message: validationMessage,
        });
      }

      const existing = await findExistingExternalMaintenanceRequest(
        data.sourceCompany!,
        data.externalRequestId!,
        prisma
      );

      if (existing) {
        return res.status(200).json({
          success: true,
          idempotent: true,
          existing: true,
          request: existing,
        } as any);
      }

      const result = await prisma.$transaction(async (tx) => {
        try {
          const created = await tx.externalMaintenanceRequest.create({
            data: {
              sourceCompany: data.sourceCompany!,
              sourceSystem: data.sourceSystem!,
              externalRequestId: data.externalRequestId!,
              externalVehicleId: data.externalVehicleId!,
              vehicleType: data.vehicleType!,
              plateNumber: data.plateNumber!,
              interventionType: data.interventionType!,
              urgency: data.urgency!,
              status: data.status,
              mileage: data.mileage,
              immobilizationRequired: data.immobilizationRequired,
              preferredDate: data.preferredDate,
              issueDescription: data.issueDescription!,
              internalNotes: data.internalNotes,
              quoteAmount: data.quoteAmount,
              invoiceAmount: data.invoiceAmount,
              quotePdfUrl: data.quotePdfUrl,
              invoicePdfUrl: data.invoicePdfUrl,
            },
          });

          await tx.externalMaintenanceStatusHistory.create({
            data: {
              externalMaintenanceRequestId: created.id,
              oldStatus: null,
              newStatus: created.status,
              comment: "Request received in SL Automotive queue.",
            },
          });

          const request = await tx.externalMaintenanceRequest.findUniqueOrThrow({
            where: {
              id: created.id,
            },
            include: {
              statusHistory: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          });

          return {
            idempotent: false,
            existing: false,
            request,
          };
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            const duplicate = await findExistingExternalMaintenanceRequest(
              data.sourceCompany!,
              data.externalRequestId!,
              tx as any
            );

            if (duplicate) {
              return {
                idempotent: true,
                existing: true,
                request: duplicate,
              };
            }
          }

          throw error;
        }
      });

      return res.status(result.existing ? 200 : 201).json({
        success: true,
        idempotent: result.idempotent,
        existing: result.existing,
        request: result.request,
      } as any);
    } catch (error: any) {
      console.error("POST /api/garage/external-maintenance error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create external maintenance request.",
        error: serializeError(error),
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed.",
  });
}
