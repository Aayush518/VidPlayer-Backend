import { prisma } from '../lib/prisma';

export const auditLog = async (
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: any
) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      metadata,
    },
  });
};