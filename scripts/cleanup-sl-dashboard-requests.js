const fs = require("fs/promises");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GENERATED_DIRECTORIES = [
  path.join(process.cwd(), "public", "generated", "fees"),
  path.join(process.cwd(), "public", "generated", "invoices"),
];

function getCliKey() {
  const arg = process.argv.find((entry) => entry.startsWith("--key="));
  return arg ? arg.slice("--key=".length) : "";
}

function requireSafeExecution() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusé: ce script ne peut pas être exécuté en production.");
  }

  const cleanupKey = process.env.DEV_CLEANUP_KEY;
  const cliKey = getCliKey();

  if (!cleanupKey) {
    throw new Error("Refusé: DEV_CLEANUP_KEY doit être défini dans l'environnement.");
  }

  if (!cliKey) {
    throw new Error("Refusé: fournissez --key=<DEV_CLEANUP_KEY> en argument CLI.");
  }

  if (cleanupKey !== cliKey) {
    throw new Error("Refusé: la clé CLI ne correspond pas à DEV_CLEANUP_KEY.");
  }
}

async function countSummary() {
  const [
    garageRequests,
    garageInterventionLines,
    externalMaintenanceRequests,
    externalMaintenanceInterventionLines,
    externalMaintenanceStatusHistory,
    externalMaintenanceWebhookDeliveries,
  ] = await Promise.all([
    prisma.garageRequest.count(),
    prisma.garageInterventionLine.count(),
    prisma.externalMaintenanceRequest.count(),
    prisma.externalMaintenanceInterventionLine.count(),
    prisma.externalMaintenanceStatusHistory.count(),
    prisma.externalMaintenanceWebhookDelivery.count(),
  ]);

  return {
    garageRequests,
    garageInterventionLines,
    externalMaintenanceRequests,
    externalMaintenanceInterventionLines,
    externalMaintenanceStatusHistory,
    externalMaintenanceWebhookDeliveries,
  };
}

async function deleteGeneratedPdfs() {
  const results = [];

  for (const directory of GENERATED_DIRECTORIES) {
    let deleted = 0;

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!entry.name.toLowerCase().endsWith(".pdf")) continue;

        await fs.unlink(path.join(directory, entry.name));
        deleted += 1;
      }
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
    }

    results.push({
      directory: path.relative(process.cwd(), directory),
      deleted,
    });
  }

  return results;
}

function printSummary(title, summary) {
  console.log(`\n${title}`);
  console.log(`- GarageRequest: ${summary.garageRequests}`);
  console.log(`- GarageInterventionLine: ${summary.garageInterventionLines}`);
  console.log(`- ExternalMaintenanceRequest: ${summary.externalMaintenanceRequests}`);
  console.log(`- ExternalMaintenanceInterventionLine: ${summary.externalMaintenanceInterventionLines}`);
  console.log(`- ExternalMaintenanceStatusHistory: ${summary.externalMaintenanceStatusHistory}`);
  console.log(`- ExternalMaintenanceWebhookDelivery: ${summary.externalMaintenanceWebhookDeliveries}`);
}

async function main() {
  requireSafeExecution();

  const before = await countSummary();
  printSummary("Résumé avant nettoyage", before);

  const deletionResult = await prisma.$transaction([
    prisma.externalMaintenanceWebhookDelivery.deleteMany({}),
    prisma.externalMaintenanceStatusHistory.deleteMany({}),
    prisma.externalMaintenanceInterventionLine.deleteMany({}),
    prisma.externalMaintenanceRequest.deleteMany({}),
    prisma.garageInterventionLine.deleteMany({}),
    prisma.garageRequest.deleteMany({}),
  ]);

  const deletedPdfs = await deleteGeneratedPdfs();
  const after = await countSummary();

  console.log("\nSuppressions effectuées");
  console.log(`- ExternalMaintenanceWebhookDelivery supprimés: ${deletionResult[0].count}`);
  console.log(`- ExternalMaintenanceStatusHistory supprimés: ${deletionResult[1].count}`);
  console.log(`- ExternalMaintenanceInterventionLine supprimés: ${deletionResult[2].count}`);
  console.log(`- ExternalMaintenanceRequest supprimés: ${deletionResult[3].count}`);
  console.log(`- GarageInterventionLine supprimés: ${deletionResult[4].count}`);
  console.log(`- GarageRequest supprimés: ${deletionResult[5].count}`);

  console.log("\nPDFs supprimés");
  deletedPdfs.forEach((result) => {
    console.log(`- ${result.directory}: ${result.deleted}`);
  });

  printSummary("Résumé après nettoyage", after);
}

main()
  .catch(async (error) => {
    console.error("\nNettoyage interrompu.");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
