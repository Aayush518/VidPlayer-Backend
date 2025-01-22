"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const audit_service_1 = require("../services/audit.service");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative endpoints
 *
 * components:
 *   schemas:
 *     Dashboard:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: integer
 *             totalVideos:
 *               type: integer
 *             blockedUsers:
 *               type: integer
 *             pendingReports:
 *               type: integer
 *         recentActivity:
 *           type: object
 *           properties:
 *             auditLogs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *         analytics:
 *           type: object
 *           properties:
 *             userGrowth:
 *               type: array
 *               items:
 *                 type: object
 *             videoGrowth:
 *               type: array
 *               items:
 *                 type: object
 *             topVideos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [VIDEO, USER]
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, RESOLVED, REJECTED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *         entity:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dashboard'
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', auth_1.isAdmin, async (req, res) => {
    const [totalUsers, totalVideos, blockedUsers, pendingReports, recentAuditLogs, userGrowth, videoGrowth, topVideos] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.video.count(),
        prisma_1.prisma.user.count({ where: { isBlocked: true } }),
        prisma_1.prisma.report.count({ where: { status: 'PENDING' } }),
        prisma_1.prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } } }
        }),
        prisma_1.prisma.user.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        }),
        prisma_1.prisma.video.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        }),
        prisma_1.prisma.video.findMany({
            take: 5,
            orderBy: { views: 'desc' },
            include: { user: { select: { email: true } } }
        })
    ]);
    res.json({
        overview: {
            totalUsers,
            totalVideos,
            blockedUsers,
            pendingReports
        },
        recentActivity: {
            auditLogs: recentAuditLogs
        },
        analytics: {
            userGrowth,
            videoGrowth,
            topVideos
        }
    });
});
/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get content reports
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, RESOLVED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [VIDEO, USER]
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/reports', auth_1.isAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;
    const where = {
        ...(status && { status }),
        ...(type && { type })
    };
    const [total, reports] = await Promise.all([
        prisma_1.prisma.report.count({ where }),
        prisma_1.prisma.report.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                reportedBy: { select: { email: true } },
                video: { select: { title: true, url: true } },
                user: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    ]);
    res.json({
        reports,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            current: page,
            limit
        }
    });
});
/**
 * @swagger
 * /api/admin/reports/{id}/resolve:
 *   post:
 *     summary: Resolve a report
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resolution
 *               - action
 *             properties:
 *               resolution:
 *                 type: string
 *                 example: "Content violates terms of service"
 *               action:
 *                 type: string
 *                 enum: [BLOCK_USER, UNPUBLISH_VIDEO, NO_ACTION]
 *     responses:
 *       200:
 *         description: Report resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */
router.post('/reports/:id/resolve', auth_1.isAdmin, async (req, res) => {
    const { id } = req.params;
    const { resolution, action } = req.body;
    const report = await prisma_1.prisma.report.update({
        where: { id },
        data: {
            status: 'RESOLVED',
            resolution,
            resolvedAt: new Date()
        },
        include: {
            video: true,
            user: true
        }
    });
    if (action === 'BLOCK_USER' && report.userId) {
        await prisma_1.prisma.user.update({
            where: { id: report.userId },
            data: { isBlocked: true }
        });
    }
    else if (action === 'UNPUBLISH_VIDEO' && report.videoId) {
        await prisma_1.prisma.video.update({
            where: { id: report.videoId },
            data: { isPublished: false }
        });
    }
    await (0, audit_service_1.auditLog)(req.user.id, 'RESOLVE_REPORT', 'REPORT', id, { resolution, action });
    res.json(report);
});
exports.adminRouter = router;
