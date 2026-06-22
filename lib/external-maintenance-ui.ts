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
  "PAID",
  "CLOSED",
  "CANCELLED",
];

export function externalMaintenanceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    RECEIVED: "Reçue",
    UNDER_REVIEW: "En analyse",
    MORE_INFO_REQUESTED: "Infos demandées",
    QUOTE_PREPARING: "Frais en préparation",
    QUOTE_SENT: "Frais proposés",
    QUOTE_APPROVED: "Frais acceptés",
    QUOTE_REJECTED: "Frais refusés",
    SCHEDULED: "Planifiée",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminée",
    INVOICED: "Payée",
    PAID: "Payée",
    CLOSED: "Clôturée",
    CANCELLED: "Annulée",
  };

  return labels[status] || status;
}

export function garageRequestStatusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "Nouveau",
    IN_REVIEW: "En analyse",
    WAITING_CLIENT: "Attente client",
    QUOTE_READY: "Frais prêts",
    QUOTE_SENT: "Frais proposés",
    ACCEPTED: "Accepté",
    REJECTED: "Refusé",
    DONE: "Terminé",
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

export function garageRequestPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    LOW: "Basse",
    NORMAL: "Normale",
    HIGH: "Haute",
    URGENT: "Urgente",
  };

  return labels[priority] || priority;
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

export function externalMaintenanceStatusClass(status: string) {
  if (status === "RECEIVED") return "bg-yellow-300 text-black";
  if (status === "UNDER_REVIEW" || status === "QUOTE_PREPARING") {
    return "bg-blue-400 text-black";
  }
  if (
    status === "QUOTE_APPROVED" ||
    status === "SCHEDULED" ||
    status === "IN_PROGRESS" ||
    status === "COMPLETED" ||
    status === "INVOICED" ||
    status === "PAID" ||
    status === "CLOSED"
  ) {
    return "bg-emerald-400 text-black";
  }
  if (status === "QUOTE_REJECTED" || status === "CANCELLED") {
    return "bg-red-500 text-white";
  }
  return "bg-white/10 text-zinc-300";
}

export function externalMaintenanceUrgencyClass(urgency: string) {
  if (urgency === "CRITICAL" || urgency === "URGENT") {
    return "border-red-400/50 bg-red-500/15 text-red-100";
  }
  if (urgency === "HIGH") {
    return "border-orange-300/50 bg-orange-500/15 text-orange-100";
  }
  if (urgency === "LOW") return "border-white/10 bg-white/5 text-zinc-400";
  return "border-yellow-300/30 bg-yellow-300/10 text-yellow-100";
}

export function garageRequestStatusClass(status: string) {
  if (status === "NEW") {
    return "bg-yellow-300 text-black";
  }
  if (status === "IN_REVIEW" || status === "QUOTE_READY") {
    return "bg-blue-400 text-black";
  }
  if (status === "WAITING_CLIENT" || status === "QUOTE_SENT") {
    return "bg-white/10 text-zinc-300";
  }
  if (status === "ACCEPTED" || status === "DONE") {
    return "bg-emerald-400 text-black";
  }
  if (status === "REJECTED") {
    return "bg-red-500 text-white";
  }
  return "bg-white/10 text-zinc-300";
}

export function garageRequestPriorityClass(priority: string) {
  return externalMaintenanceUrgencyClass(priority);
}
