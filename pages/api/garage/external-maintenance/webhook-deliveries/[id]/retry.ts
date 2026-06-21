import { ExternalMaintenanceWebhookDeliveryStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { requireGarageApiAuth } from "../../../../../../lib/external-maintenance";
import {
  retryNovoTraluxMaintenanceWebhookDelivery,
  WebhookDeliveryRetryError,
} from "../../../../../../lib/novotralux-maintenance-webhook";

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

  const auth = requireGarageApiAuth(req, res);
  if (!auth.ok) {
    return res.status(auth.status).json({
      success: false,
      message: auth.message,
    });
  }

  const deliveryId = typeof req.query.id === "string" ? req.query.id : null;

  if (!deliveryId) {
    return res.status(400).json({
      success: false,
      message: "Webhook delivery id is required.",
    });
  }

  try {
    const delivery = await retryNovoTraluxMaintenanceWebhookDelivery(
      deliveryId
    );
    const delivered =
      delivery.status === ExternalMaintenanceWebhookDeliveryStatus.DELIVERED;

    return res.status(delivered ? 200 : 502).json({
      success: delivered,
      message: delivered
        ? "Webhook delivered successfully."
        : "Webhook delivery failed.",
      data: delivery,
    });
  } catch (error) {
    if (error instanceof WebhookDeliveryRetryError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Webhook retry failed.", { deliveryId, error });
    return res.status(500).json({
      success: false,
      message: "Webhook retry failed.",
    });
  }
}
