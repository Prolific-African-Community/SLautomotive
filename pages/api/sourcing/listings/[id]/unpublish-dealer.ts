import type { NextApiRequest, NextApiResponse } from "next";
import { DealerVehicleStatus, VehicleInternalStatus } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../../../lib/dealer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid listing id.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const dealerVehicle = await prisma.dealerVehicle.findUnique({
      where: {
        sourcingListingId: id,
      },
    });

    if (!dealerVehicle) {
      return res.status(404).json({
        success: false,
        message: "Dealer vehicle not found for this listing.",
      });
    }

    const hiddenVehicle = await prisma.dealerVehicle.update({
      where: {
        id: dealerVehicle.id,
      },
      data: {
        status: DealerVehicleStatus.HIDDEN,
      },
    });

    const listing = await prisma.vehicleListing.findUnique({
      where: { id },
      select: { internalStatus: true },
    });

    if (listing?.internalStatus === VehicleInternalStatus.PUBLISHED) {
      await prisma.vehicleListing.update({
        where: { id },
        data: { internalStatus: VehicleInternalStatus.INTERESTING },
      });
    }

    return res.status(200).json({
      success: true,
      data: hiddenVehicle,
    });
  } catch (error: any) {
    console.error("POST /api/sourcing/listings/[id]/unpublish-dealer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unpublish dealer vehicle.",
      error: serializeError(error),
    });
  }
}
