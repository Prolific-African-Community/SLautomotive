import {
  ExternalMaintenanceRequest,
  ExternalMaintenanceWebhookDeliveryStatus,
  ExternalMaintenanceWebhookTarget,
  Prisma,
} from "@prisma/client";

import { prisma } from "./prisma";

const NOVOTRALUX_PROVIDER = "SL_AUTOMOTIVE";
const MAX_RESPONSE_BODY_LENGTH = 4000;

export class WebhookDeliveryRetryError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "WebhookDeliveryRetryError";
    this.statusCode = statusCode;
  }
}

function getNovoTraluxWebhookConfig() {
  const baseUrl = process.env.NOVOTRALUX_WEBHOOK_BASE_URL?.trim();
  const apiKey = process.env.NOVOTRALUX_WEBHOOK_API_KEY?.trim();

  return baseUrl && apiKey
    ? {
        url: `${baseUrl.replace(
          /\/+$/,
          ""
        )}/api/integrations/sl-automotive/maintenance-status`,
        apiKey,
      }
    : null;
}

function truncateResponseBody(value: string) {
  return value.length > MAX_RESPONSE_BODY_LENGTH
    ? `${value.slice(0, MAX_RESPONSE_BODY_LENGTH)}…`
    : value;
}

function buildMaintenanceWebhookPayload(
  request: ExternalMaintenanceRequest,
  statusComment: string | null,
  interventionLines: Array<{
    id: string;
    interventionCodeId: string | null;
    code: string | null;
    label: string;
    description: string | null;
    qty: number;
    unitPrice: number;
    total: number;
  }>
) {
  return {
    sourceProvider: NOVOTRALUX_PROVIDER,
    providerRequestId: request.id,
    externalRequestId: request.externalRequestId,
    status: request.status,
    statusComment,
    interventionType: request.interventionType,
    urgency: request.urgency,
    immobilizationRequired: request.immobilizationRequired,
    preferredDate: request.preferredDate?.toISOString() ?? null,
    quoteAmount: request.quoteAmount,
    invoiceAmount: request.invoiceAmount,
    quotePdfUrl: request.quotePdfUrl,
    invoicePdfUrl: request.invoicePdfUrl,
    interventionLines: interventionLines.map((line) => ({
      id: line.id,
      code: line.code,
      label: line.label,
      description: line.description,
      qty: line.qty,
      unitPrice: line.unitPrice,
      total: line.total,
      isCustom: line.interventionCodeId === null,
    })),
  };
}

async function attemptNovoTraluxWebhookDelivery(
  deliveryId: string,
  payloadJson: Prisma.JsonValue
) {
  const lastAttemptAt = new Date();

  await prisma.externalMaintenanceWebhookDelivery.update({
    where: { id: deliveryId },
    data: {
      status: ExternalMaintenanceWebhookDeliveryStatus.PENDING,
      attempts: { increment: 1 },
      lastAttemptAt,
      httpStatus: null,
      responseBody: null,
      errorMessage: null,
      deliveredAt: null,
    },
  });

  const config = getNovoTraluxWebhookConfig();

  if (!config) {
    return prisma.externalMaintenanceWebhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: ExternalMaintenanceWebhookDeliveryStatus.FAILED,
        errorMessage: "NovoTralux webhook environment is incomplete.",
      },
    });
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify(payloadJson),
    });
    const responseBody = truncateResponseBody(await response.text());

    return prisma.externalMaintenanceWebhookDelivery.update({
      where: { id: deliveryId },
      data: response.ok
        ? {
            status: ExternalMaintenanceWebhookDeliveryStatus.DELIVERED,
            httpStatus: response.status,
            responseBody,
            errorMessage: null,
            deliveredAt: new Date(),
          }
        : {
            status: ExternalMaintenanceWebhookDeliveryStatus.FAILED,
            httpStatus: response.status,
            responseBody,
            errorMessage: `NovoTralux webhook returned HTTP ${response.status}.`,
            deliveredAt: null,
          },
    });
  } catch (error) {
    return prisma.externalMaintenanceWebhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: ExternalMaintenanceWebhookDeliveryStatus.FAILED,
        errorMessage:
          error instanceof Error ? error.message : "Webhook request failed.",
        deliveredAt: null,
      },
    });
  }
}

export async function sendNovoTraluxMaintenanceStatusWebhook(
  request: ExternalMaintenanceRequest,
  statusComment: string | null
) {
  try {
    const interventionLines =
      await prisma.externalMaintenanceInterventionLine.findMany({
        where: { externalMaintenanceRequestId: request.id },
        orderBy: { createdAt: "asc" },
      });
    const payload = buildMaintenanceWebhookPayload(
      request,
      statusComment,
      interventionLines
    );

    const delivery = await prisma.externalMaintenanceWebhookDelivery.create({
      data: {
        externalMaintenanceRequestId: request.id,
        targetSystem: ExternalMaintenanceWebhookTarget.NOVOTRALUX,
        eventType: `MAINTENANCE_STATUS_${request.status}`,
        payloadJson: payload,
      },
    });

    const result = await attemptNovoTraluxWebhookDelivery(
      delivery.id,
      delivery.payloadJson
    );

    if (result.status !== ExternalMaintenanceWebhookDeliveryStatus.DELIVERED) {
      console.warn("NovoTralux maintenance webhook failed.", {
        externalMaintenanceRequestId: request.id,
        deliveryId: result.id,
        httpStatus: result.httpStatus,
        errorMessage: result.errorMessage,
      });
    }

    return result;
  } catch (error) {
    console.warn("NovoTralux maintenance webhook logging failed.", {
      externalMaintenanceRequestId: request.id,
      error,
    });
    return null;
  }
}

export async function retryNovoTraluxMaintenanceWebhookDelivery(
  deliveryId: string
) {
  const delivery = await prisma.externalMaintenanceWebhookDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) {
    throw new WebhookDeliveryRetryError("Webhook delivery not found.", 404);
  }

  if (delivery.status === ExternalMaintenanceWebhookDeliveryStatus.DELIVERED) {
    throw new WebhookDeliveryRetryError(
      "Delivered webhooks cannot be retried.",
      400
    );
  }

  return attemptNovoTraluxWebhookDelivery(delivery.id, delivery.payloadJson);
}
