import {
  ExternalMaintenanceSourceCompany,
  ExternalMaintenanceStatus,
} from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { verifyNovoTraluxApiKey } from "../../../../lib/external-maintenance";
import { parseString, serializeError } from "../../../../lib/garage";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed." });
  }

  const auth = verifyNovoTraluxApiKey(req);
  if (!auth.ok) {
    return res
      .status(auth.status)
      .json({ success: false, message: auth.message });
  }

  const sourceCompany = parseString(req.body?.sourceCompany);
  const externalRequestId = parseString(req.body?.externalRequestId);
  const providerRequestId = parseString(req.body?.providerRequestId);
  const decision = parseString(req.body?.decision);
  const comment = parseString(req.body?.comment) ?? null;

  if (
    sourceCompany !== ExternalMaintenanceSourceCompany.NOVOTRALUX ||
    !externalRequestId ||
    !providerRequestId ||
    (decision !== "approve" && decision !== "reject")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid quote decision payload.",
    });
  }

  try {
    const existing = await prisma.externalMaintenanceRequest.findFirst({
      where: {
        id: providerRequestId,
        externalRequestId,
        sourceCompany: ExternalMaintenanceSourceCompany.NOVOTRALUX,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "External maintenance request not found.",
      });
    }

    const targetStatus =
      decision === "approve"
        ? ExternalMaintenanceStatus.QUOTE_APPROVED
        : ExternalMaintenanceStatus.QUOTE_REJECTED;

    if (existing.status === targetStatus) {
      return res
        .status(200)
        .json({ success: true, idempotent: true, data: existing });
    }

    if (existing.status !== ExternalMaintenanceStatus.QUOTE_SENT) {
      return res.status(409).json({
        success: false,
        message: "Quote decision requires status QUOTE_SENT.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const request = await tx.externalMaintenanceRequest.update({
        where: { id: existing.id },
        data: { status: targetStatus },
      });
      await tx.externalMaintenanceStatusHistory.create({
        data: {
          externalMaintenanceRequestId: existing.id,
          oldStatus: existing.status,
          newStatus: targetStatus,
          comment:
            comment ??
            (decision === "approve"
              ? "Quote approved by NovoTralux."
              : "Quote rejected by NovoTralux."),
        },
      });
      return request;
    });

    return res
      .status(200)
      .json({ success: true, idempotent: false, data: updated });
  } catch (error) {
    console.error("POST quote-decision error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record quote decision.",
      error: serializeError(error),
    });
  }
}
