export const EXTERNAL_MAINTENANCE_STATUSES = [
  "RECEIVED",
  "UNDER_REVIEW",
  "MORE_INFO_REQUESTED",
  "QUOTE_PREPARING",
  "QUOTE_SENT",
  "QUOTE_APPROVED",
  "QUOTE_REJECTED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "INVOICED",
  "CANCELLED",
];

export function externalMaintenanceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    RECEIVED: "Reçue",
    UNDER_REVIEW: "En analyse",
    MORE_INFO_REQUESTED: "Infos demandées",
    QUOTE_PREPARING: "Devis en préparation",
    QUOTE_SENT: "Devis envoyé",
    QUOTE_APPROVED: "Devis accepté",
    QUOTE_REJECTED: "Devis refusé",
    SCHEDULED: "Planifiée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    INVOICED: "Facturée",
    CANCELLED: "Annulée",
  };

  return labels[status] || status;
}

export function externalMaintenanceUrgencyLabel(urgency: string) {
  const labels: Record<string, string> = {
    LOW: "Faible",
    NORMAL: "Normale",
    HIGH: "Haute",
    CRITICAL: "Critique",
  };

  return labels[urgency] || urgency;
}

export function externalMaintenanceInterventionTypeLabel(type: string) {
  const labels: Record<string, string> = {
    DIAGNOSTIC: "Diagnostic",
    TIRES: "Pneus",
    BRAKES: "Freinage",
    OIL_SERVICE: "Entretien vidange",
    ELECTRICAL: "Électrique",
    BODYWORK: "Carrosserie",
    TRAILER_REPAIR: "Réparation remorque",
    SAFETY_CHECK: "Contrôle sécurité",
    OTHER: "Autre",
  };

  return labels[type] || type;
}

export function externalMaintenanceVehicleTypeLabel(type: string) {
  return type === "TRAILER" ? "Remorque" : type === "TRUCK" ? "Camion" : type;
}
