"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const prisma_1 = require("../lib/prisma");
const auditLog = async (userId, action, entity, entityId, metadata) => {
    await prisma_1.prisma.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            metadata,
        },
    });
};
exports.auditLog = auditLog;
