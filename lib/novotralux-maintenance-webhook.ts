import { ExternalMaintenanceRequest } from "@prisma/client";

const NOVOTRALUX_PROVIDER = "SL_AUTOMOTIVE";

export async function sendNovoTraluxMaintenanceStatusWebhook(
  request: ExternalMaintenanceRequest,
  statusComment: string | null
) {
  const baseUrl = process.env.NOVOTRALUX_WEBHOOK_BASE_URL?.trim();
  const apiKey = process.env.NOVOTRALUX_WEBHOOK_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    console.warn(
      "NovoTralux maintenance webhook skipped: webhook environment is incomplete."
    );
    return;
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(
        /\/+$/,
        ""
      )}/api/integrations/sl-automotive/maintenance-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!response.ok) {
      console.warn("NovoTralux maintenance webhook failed.", {
        externalMaintenanceRequestId: request.id,
        status: response.status,
      });
    }
  } catch (error) {
    console.warn("NovoTralux maintenance webhook failed.", {
      externalMaintenanceRequestId: request.id,
      error,
    });
  }
}
