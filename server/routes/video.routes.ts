import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { isAdmin } from '../middleware/auth';

const router = Router();

const videoSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().optional(),
});

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video management endpoints
 * 
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         url:
 *           type: string
 *           format: uri
 *         thumbnailUrl:
 *           type: string
 *           format: uri
 *         description:
 *           type: string
 *         views:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *   post:
 *     summary: Add new video (admin only)
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Amazing Video"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/video.mp4"
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/thumbnail.jpg"
 *               description:
 *                 type: string
 *                 example: "This is an amazing video"
 *     responses:
 *       200:
 *         description: Video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       403:
 *         description: Admin access required
 */

router.get('/', async (req, res) => {
  const videos = await prisma.video.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  res.json(videos);
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const data = videoSchema.parse(req.body);
    const video = await prisma.video.create({
      data: {
        ...data,
        userId: req.user!.id,
      },
    });
    res.json(video);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete video (admin only)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Video ID
 *     responses:
 *       204:
 *         description: Video deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Video not found
 */
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.video.delete({
    where: { id },
  });
  res.status(204).send();
});

export const videoRouter = router;