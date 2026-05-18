import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';

async function getMediaWithLocalUrl(media: any) {
  if (!media) return media;
  const localUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${media.filename}`;
  return { ...media, imageUrl: localUrl };
}

export const getStatus = async (req: Request, res: Response) => {
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

  const mediaWithUrl = await getMediaWithLocalUrl(media);
  return res.json(mediaWithUrl);
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
    return res.status(404).json({ error: 'Media not found do it again ' });
  }

  const mediaWithUrl = await getMediaWithLocalUrl(media);
  return res.json(mediaWithUrl);
};
