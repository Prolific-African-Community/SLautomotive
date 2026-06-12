import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { ApiResponse, serializeError } from "../../../lib/garage";

const INTERVENTION_CODES = [
  ["DIAG-GENERAL", "Diagnostic général véhicule", "Diagnostic", "Contrôle initial permettant d'identifier les causes probables avant devis détaillé.", 59, 45],
  ["DIAG-ELEC", "Diagnostic électronique", "Diagnostic", "Analyse des systèmes électroniques et calculateurs avec orientation de réparation.", 69, 45],
  ["LECTURE-OBD", "Lecture défaut OBD", "Diagnostic", "Lecture des codes défauts moteur et remise d'un premier relevé technique.", 35, 20],
  ["DIAG-MOTEUR", "Diagnostic moteur", "Diagnostic", "Recherche ciblée sur les symptômes moteur, pertes de puissance ou voyants.", 89, 60],
  ["DIAG-BRUIT", "Recherche bruit / vibration", "Diagnostic", "Contrôle dynamique et statique pour localiser un bruit ou une vibration.", 75, 45],
  ["DIAG-FUITE", "Recherche fuite", "Diagnostic", "Inspection de fuite huile, liquide de refroidissement, carburant ou climatisation.", 75, 45],
  ["ESSAI-ROUTE", "Essai routier diagnostic", "Diagnostic", "Essai routier encadré pour confirmer les symptômes signalés par le client.", 45, 30],
  ["VIDANGE-HUILE", "Vidange huile moteur", "Entretien", "Remplacement de l'huile moteur avec contrôle rapide des niveaux essentiels.", 89, 45],
  ["FILTRE-HUILE", "Remplacement filtre à huile", "Entretien", "Remplacement du filtre à huile lors d'un entretien ou d'une vidange.", 25, 15],
  ["FILTRE-AIR", "Remplacement filtre à air", "Entretien", "Remplacement du filtre à air pour améliorer l'admission et la respiration moteur.", 35, 15],
  ["FILTRE-HABITACLE", "Remplacement filtre habitacle", "Entretien", "Remplacement du filtre habitacle pour préserver la qualité d'air intérieure.", 35, 20],
  ["FILTRE-CARBURANT", "Remplacement filtre carburant", "Entretien", "Remplacement du filtre carburant selon préconisation ou symptômes d'alimentation.", 59, 30],
  ["REVISION-SIMPLE", "Révision simple", "Entretien", "Entretien courant avec contrôles essentiels et remplacement des consommables prévus.", 149, 90],
  ["REVISION-COMPLETE", "Révision complète", "Entretien", "Révision approfondie avec contrôles étendus et points de sécurité principaux.", 249, 150],
  ["FREIN-CONTROLE", "Contrôle système freinage", "Freinage", "Inspection des plaquettes, disques, flexibles et niveau de liquide de frein.", 39, 25],
  ["PLAQUETTES-AV", "Plaquettes avant", "Freinage", "Remplacement des plaquettes de frein avant avec contrôle visuel des disques.", 119, 60],
  ["PLAQUETTES-AR", "Plaquettes arrière", "Freinage", "Remplacement des plaquettes de frein arrière avec contrôle visuel des disques.", 109, 60],
  ["DISQUES-PLAQUETTES-AV", "Disques + plaquettes avant", "Freinage", "Remplacement des disques et plaquettes avant, hors particularités constructeur.", 279, 90],
  ["DISQUES-PLAQUETTES-AR", "Disques + plaquettes arrière", "Freinage", "Remplacement des disques et plaquettes arrière, hors particularités constructeur.", 259, 90],
  ["PURGE-FREIN", "Purge liquide de frein", "Freinage", "Remplacement et purge du liquide de frein pour restaurer un freinage régulier.", 79, 45],
  ["PNEU-MONTAGE-UNITE", "Montage pneu unité", "Pneumatiques", "Montage d'un pneu sur jante, hors équilibrage si facturé séparément.", 20, 15],
  ["PNEU-EQUILIBRAGE-UNITE", "Équilibrage pneu unité", "Pneumatiques", "Équilibrage d'une roue pour réduire vibrations et usure irrégulière.", 15, 10],
  ["PNEU-PACK-4", "Montage + équilibrage 4 pneus", "Pneumatiques", "Forfait montage et équilibrage pour quatre pneus, hors valves spécifiques.", 120, 60],
  ["GEOMETRIE", "Géométrie / parallélisme", "Pneumatiques", "Réglage de géométrie pour tenue de route et usure pneumatique régulière.", 89, 60],
  ["SUSPENSION-CONTROLE", "Contrôle suspension", "Train roulant", "Contrôle amortisseurs, trains roulants et jeux mécaniques principaux.", 49, 30],
  ["AMORTISSEUR-AV-CONTROLE", "Contrôle amortisseurs avant", "Train roulant", "Vérification ciblée des amortisseurs avant et de leurs fixations.", 39, 25],
  ["ROTULE-CONTROLE", "Contrôle rotules / direction", "Train roulant", "Contrôle des rotules, biellettes et jeux de direction.", 39, 25],
  ["BOUGIES-ESSENCE", "Remplacement bougies essence", "Moteur", "Remplacement des bougies d'allumage sur moteur essence selon accessibilité.", 89, 45],
  ["COURROIE-ACCESSOIRE", "Courroie accessoire", "Moteur", "Remplacement ou intervention sur courroie accessoire selon diagnostic.", 129, 60],
  ["DISTRIBUTION-CHECK", "Contrôle distribution", "Moteur", "Contrôle visuel et historique du système de distribution avant devis détaillé.", 69, 45],
  ["VIDANGE-BOITE-CHECK", "Contrôle vidange boîte", "Moteur", "Contrôle de l'état et de l'historique d'entretien de boîte de vitesses.", 49, 30],
  ["BATTERIE-TEST", "Test batterie / alternateur", "Électricité", "Contrôle de l'état batterie, charge alternateur et démarrage.", 29, 20],
  ["BATTERIE-REMPLACEMENT", "Remplacement batterie", "Électricité", "Remplacement de batterie client ou atelier, hors codage spécifique éventuel.", 49, 25],
  ["DIAG-CAPTEUR", "Diagnostic capteur électronique", "Électricité", "Contrôle ciblé d'un capteur ou signal électronique incohérent.", 59, 40],
  ["RESET-SERVICE", "Reset service / maintenance", "Électricité", "Remise à zéro d'un indicateur service ou maintenance après contrôle.", 25, 10],
  ["CLIM-DIAG", "Diagnostic climatisation", "Climatisation", "Contrôle du fonctionnement climatisation avant recharge ou recherche de fuite.", 59, 40],
  ["CLIM-RECHARGE", "Recharge climatisation", "Climatisation", "Recharge du circuit de climatisation selon gaz compatible et contrôle basique.", 99, 60],
  ["CLIM-FUITE", "Recherche fuite climatisation", "Climatisation", "Recherche de fuite sur circuit climatisation avec méthode adaptée au véhicule.", 89, 60],
  ["PERF-DIAG", "Diagnostic performance", "Performance", "Analyse des performances ressenties, pertes de puissance ou comportement moteur.", 89, 60],
  ["PERF-REPROG-CHECK", "Contrôle faisabilité reprogrammation", "Performance", "Contrôle préalable de compatibilité et état mécanique avant optimisation.", 69, 45],
  ["PERF-LOGS", "Analyse logs performance", "Performance", "Analyse de données et logs pour diagnostic performance avancé.", 79, 60],
  ["MO-30", "Main d'oeuvre 30 minutes", "Main d’œuvre", "Temps atelier forfaitaire de trente minutes pour opération complémentaire.", 37.5, 30],
  ["MO-60", "Main d'oeuvre 1 heure", "Main d’œuvre", "Temps atelier forfaitaire d'une heure pour intervention ou diagnostic avancé.", 75, 60],
  ["MO-120", "Main d'oeuvre 2 heures", "Main d’œuvre", "Temps atelier forfaitaire de deux heures pour intervention plus longue.", 150, 120],
  ["NETTOYAGE-DIAG", "Nettoyage zone diagnostic", "Divers", "Nettoyage localisé nécessaire pour confirmer une fuite ou inspecter une zone.", 25, 20],
  ["PIECE-SUR-DEVIS", "Pièce sur devis", "Divers", "Ligne d'attente pour une pièce à chiffrer après identification exacte.", 0, 0],
  ["FRAIS-DOSSIER", "Frais de dossier / prise en charge", "Divers", "Frais fixes de prise en charge administrative et ouverture du dossier atelier.", 15, 10],
].map(([code, label, category, description, unitPrice, estimatedMinutes]) => ({
  code: String(code),
  label: String(label),
  category: String(category),
  description: String(description),
  unitPrice: Number(unitPrice),
  defaultQty: 1,
  estimatedMinutes: Number(estimatedMinutes),
  isActive: true,
}));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const overwrite = req.query.overwrite === "true";
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const codes = [];

    for (const item of INTERVENTION_CODES) {
      const existing = await prisma.interventionCode.findUnique({
        where: {
          code: item.code,
        },
      });

      if (!existing) {
        const created = await prisma.interventionCode.create({
          data: item,
        });
        createdCount += 1;
        codes.push(created);
        continue;
      }

      if (overwrite) {
        const updated = await prisma.interventionCode.update({
          where: {
            code: item.code,
          },
          data: item,
        });
        updatedCount += 1;
        codes.push(updated);
        continue;
      }

      skippedCount += 1;
      codes.push(existing);
    }

    return res.status(200).json({
      success: true,
      data: {
        createdCount,
        updatedCount,
        skippedCount,
        totalCodes: INTERVENTION_CODES.length,
        codes,
      },
    });
  } catch (error: any) {
    console.error("POST /api/garage/seed-intervention-codes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to seed intervention codes.",
      error: serializeError(error),
    });
  }
}
