import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid rule id.",
    });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const deleted = await prisma.vehicleListing.deleteMany({
      where: {
        sourcingRuleId: id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        deletedCount: deleted.count,
      },
    });
  } catch (error: any) {
    console.error("DELETE /api/sourcing/rules/[id]/listings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete rule listings.",
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      },
    });
  }
}