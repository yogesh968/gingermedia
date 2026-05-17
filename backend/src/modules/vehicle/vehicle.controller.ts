import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';

export const getStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      failureReason: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json(media);
};

export const getResults = async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      analysis: true,
    },
  });

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  return res.json(media);
};
