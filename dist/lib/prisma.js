"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        datasources: {
            db: {
                url: "postgresql://video_92kh_user:bPFRevN6FViFu73769DhrsCr8JfU0TfU@dpg-cu80lflumphs73edq1i0-a.oregon-postgres.render.com/video_92kh"
            },
        },
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
