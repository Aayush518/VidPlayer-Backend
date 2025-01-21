import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://video_92kh_user:bPFRevN6FViFu73769DhrsCr8JfU0TfU@dpg-cu80lflumphs73edq1i0-a.oregon-postgres.render.com/video_92kh"
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;