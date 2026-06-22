import {
  ExternalMaintenanceInterventionType,
  ExternalMaintenanceSourceCompany,
  ExternalMaintenanceStatus,
  ExternalMaintenanceUrgency,
  ExternalMaintenanceVehicleType,
  PrismaClient,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { parseDate, parseNumber, parseString } from "./garage";
import { prisma as defaultPrisma } from "./prisma";
import { requireDashboardAuth } from "./simple-auth";

export const EXTERNAL_MAINTENANCE_SOURCE_SYSTEM_DEFAULT = "NOVOTRALUX_PORTAL";

export function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return undefined;
}

export function parseInteger(value: unknown): number | null | undefined {
  const parsed = parseNumber(value);
  if (parsed === undefined || parsed === null) return parsed;
  return Math.trunc(parsed);
}

function parseEnumValue<T extends string>(
  value: unknown,
  values: readonly T[]
): T | undefined {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : undefined;
}

export function normalizeExternalMaintenancePayload(body: any) {
  return {
    sourceCompany: parseEnumValue(
      body.sourceCompany,
      Object.values(ExternalMaintenanceSourceCompany)
    ),
    sourceSystem: parseString(body.sourceSystem),
    externalRequestId: parseString(body.externalRequestId),
    externalVehicleId: parseString(body.externalVehicleId),
    vehicleType: parseEnumValue(
      body.vehicleType,
      Object.values(ExternalMaintenanceVehicleType)
    ),
    plateNumber: parseString(body.plateNumber),
    interventionType: parseEnumValue(
      body.interventionType,
      Object.values(ExternalMaintenanceInterventionType)
    ),
    urgency: parseEnumValue(
      body.urgency,
      Object.values(ExternalMaintenanceUrgency)
    ),
    status: ExternalMaintenanceStatus.RECEIVED,
    mileage: parseInteger(body.mileage) ?? null,
    immobilizationRequired: parseBoolean(body.immobilizationRequired) ?? false,
    preferredDate: parseDate(body.preferredDate) ?? null,
    issueDescription: parseString(body.issueDescription),
    internalNotes: parseString(body.internalNotes) ?? null,
    quoteAmount: parseNumber(body.quoteAmount) ?? null,
    invoiceAmount: parseNumber(body.invoiceAmount) ?? null,
    quotePdfUrl: parseString(body.quotePdfUrl) ?? null,
    invoicePdfUrl: parseString(body.invoicePdfUrl) ?? null,
  };
}

export function validateExternalMaintenanceCreateData(
  data: ReturnType<typeof normalizeExternalMaintenancePayload>
) {
  if (!data.sourceCompany) {
    return "sourceCompany est obligatoire et invalide.";
  }

  if (!data.sourceSystem) {
    return "sourceSystem est obligatoire.";
  }

  if (!data.externalRequestId) {
    return "externalRequestId est obligatoire.";
  }

  if (!data.externalVehicleId) {
    return "externalVehicleId est obligatoire.";
  }

  if (!data.vehicleType) {
    return "vehicleType est obligatoire et invalide.";
  }

  if (!data.plateNumber) {
    return "plateNumber est obligatoire.";
  }

  if (!data.interventionType) {
    return "interventionType est obligatoire et invalide.";
  }

  if (!data.urgency) {
    return "urgency est obligatoire et invalide.";
  }

  if (!data.issueDescription) {
    return "issueDescription est obligatoire.";
  }

  return null;
}

export function verifyNovoTraluxApiKey(req: NextApiRequest) {
  const requestApiKey = req.headers["x-api-key"];
  const expectedApiKey = process.env.NOVOTRALUX_API_KEY;

  if (!expectedApiKey) {
    return {
      ok: false as const,
      status: 500,
      message: "NOVOTRALUX_API_KEY is not configured on SL Automotive.",
    };
  }

  if (typeof requestApiKey !== "string" || requestApiKey !== expectedApiKey) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized.",
    };
  }

  return {
    ok: true as const,
  };
}

function extractRequestHost(req: NextApiRequest) {
  const hostHeader = req.headers.host;
  return typeof hostHeader === "string" ? hostHeader.toLowerCase() : null;
}

function extractHeaderHost(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).host.toLowerCase();
  } catch (error) {
    return null;
  }
}

function isSameOriginBrowserRequest(req: NextApiRequest) {
  const requestHost = extractRequestHost(req);
  if (!requestHost) return false;

  const secFetchSite = req.headers["sec-fetch-site"];
  const fetchSite =
    typeof secFetchSite === "string" ? secFetchSite.toLowerCase() : null;
  const originHost = extractHeaderHost(
    typeof req.headers.origin === "string" ? req.headers.origin : undefined
  );
  const refererHost = extractHeaderHost(
    typeof req.headers.referer === "string" ? req.headers.referer : undefined
  );

  const sameOriginHeader =
    (originHost && originHost === requestHost) ||
    (refererHost && refererHost === requestHost);

  const sameSiteFetch =
    fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";

  return Boolean(sameOriginHeader || sameSiteFetch);
}

export function requireGarageApiAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return requireDashboardAuth(req, res);
}

export async function findExistingExternalMaintenanceRequest(
  sourceCompany: ExternalMaintenanceSourceCompany,
  externalRequestId: string,
  db: PrismaClient = defaultPrisma
) {
  return db.externalMaintenanceRequest.findUnique({
    where: {
      sourceCompany_externalRequestId: {
        sourceCompany,
        externalRequestId,
      },
    },
    include: {
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export function buildExternalMaintenancePatchData(body: any) {
  const data: Prisma.ExternalMaintenanceRequestUpdateInput = {};

  const stringFields = [
    "sourceSystem",
    "externalRequestId",
    "externalVehicleId",
    "plateNumber",
    "issueDescription",
    "internalNotes",
    "quotePdfUrl",
    "invoicePdfUrl",
  ] as const;

  stringFields.forEach((field) => {
    const value = parseString(body[field]);
    if (value !== undefined) {
      (data as any)[field] = value;
    }
  });

  const mileage = parseInteger(body.mileage);
  if (mileage !== undefined) data.mileage = mileage;

  const preferredDate = parseDate(body.preferredDate);
  if (preferredDate !== undefined) data.preferredDate = preferredDate;

  const quoteAmount = parseNumber(body.quoteAmount);
  if (quoteAmount !== undefined) data.quoteAmount = quoteAmount;

  const invoiceAmount = parseNumber(body.invoiceAmount);
  if (invoiceAmount !== undefined) data.invoiceAmount = invoiceAmount;

  const immobilizationRequired = parseBoolean(body.immobilizationRequired);
  if (immobilizationRequired !== undefined) {
    data.immobilizationRequired = immobilizationRequired;
  }

  const sourceCompany = parseEnumValue(
    body.sourceCompany,
    Object.values(ExternalMaintenanceSourceCompany)
  );
  if (sourceCompany) data.sourceCompany = sourceCompany;

  const vehicleType = parseEnumValue(
    body.vehicleType,
    Object.values(ExternalMaintenanceVehicleType)
  );
  if (vehicleType) data.vehicleType = vehicleType;

  const interventionType = parseEnumValue(
    body.interventionType,
    Object.values(ExternalMaintenanceInterventionType)
  );
  if (interventionType) data.interventionType = interventionType;

  const urgency = parseEnumValue(
    body.urgency,
    Object.values(ExternalMaintenanceUrgency)
  );
  if (urgency) data.urgency = urgency;

  const status = parseEnumValue(
    body.status,
    Object.values(ExternalMaintenanceStatus)
  );

  return {
    data,
    status,
    statusComment: parseString(body.statusComment) ?? parseString(body.comment) ?? null,
  };
}
