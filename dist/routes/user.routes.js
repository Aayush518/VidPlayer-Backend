"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *         isBlocked:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 */
router.get('/', auth_1.isAdmin, async (req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            isBlocked: true,
            createdAt: true,
        },
    });
    res.json(users);
});
/**
 * @swagger
 * /api/users/{id}/block:
 *   patch:
 *     summary: Block/unblock user (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isBlocked
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch('/:id/block', auth_1.isAdmin, async (req, res) => {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { isBlocked },
    });
    res.json(user);
});
exports.userRouter = router;
