import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { requireDashboardAuth } from "../../../../lib/simple-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid rule id.",
    });
  }

  const auth = requireDashboardAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const existingRule = await prisma.sourcingRule.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        success: false,
        message: "Rule not found.",
      });
    }

    if (existingRule._count.listings > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cette règle contient encore des annonces. Nettoie d’abord les annonces liées à cette règle.",
      });
    }

    await prisma.sourcingRule.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: {
        deletedRuleId: id,
      },
    });
  } catch (error: any) {
    console.error("DELETE /api/sourcing/rules/[id] error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete sourcing rule.",
      error: {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      },
    });
  }
}
