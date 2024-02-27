import { PrismaClient } from "@prisma/client";

import { nodeEnv } from "@/utils/configs";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Creates and returns a singleton instance of PrismaClient.
 * and stores the instance in the global object in development mode.
 * @returns {PrismaClient} The singleton instance of PrismaClient.
 */
const prisma = globalForPrisma.prisma || new PrismaClient();
if (nodeEnv !== "production") globalForPrisma.prisma = prisma;

export default prisma;
