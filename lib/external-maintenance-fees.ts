import { prisma } from "./prisma";
import { generateExternalMaintenanceFeesPdf } from "./external-maintenance-invoice";

type RegenerateFeesPdfOptions = {
  requestOriginFallback?: string | null;
  statusComment?: string | null;
  fallbackAmount?: number | null;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function regenerateExternalMaintenanceFeesPdf(
  requestId: string,
  options: RegenerateFeesPdfOptions = {}
) {
  const request = await prisma.externalMaintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      interventionLines: {
        orderBy: { createdAt: "asc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) {
    throw new Error("External maintenance request not found.");
  }

  const linesTotal = request.interventionLines.length
    ? roundMoney(
        request.interventionLines.reduce((sum, line) => sum + line.total, 0)
      )
    : null;
  const feesAmount =
    linesTotal ??
    options.fallbackAmount ??
    request.quoteAmount ??
    request.invoiceAmount;

  if (feesAmount === null || feesAmount <= 0) {
    throw new Error(
      "A positive fees amount or at least one intervention line with a positive total is required to generate the PDF."
    );
  }

  const generatedPdf = await generateExternalMaintenanceFeesPdf(
    options.requestOriginFallback ?? null,
    request,
    feesAmount,
    options.statusComment ?? request.statusHistory[0]?.comment ?? null,
    request.interventionLines.map((line) => ({
      code: line.code,
      label: line.label,
      description: line.description,
      qty: line.qty,
      unitPrice: line.unitPrice,
      total: line.total,
    }))
  );

  const updatedRequest = await prisma.externalMaintenanceRequest.update({
    where: { id: request.id },
    data: {
      quoteAmount: feesAmount,
      quotePdfUrl: generatedPdf.absoluteUrl,
    },
    include: {
      interventionLines: {
        orderBy: { createdAt: "asc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return {
    request: updatedRequest,
    previousQuoteAmount: request.quoteAmount,
    feesAmount,
    amountChanged:
      request.quoteAmount === null ||
      Math.abs(request.quoteAmount - feesAmount) >= 0.01,
    pdf: generatedPdf,
  };
}
