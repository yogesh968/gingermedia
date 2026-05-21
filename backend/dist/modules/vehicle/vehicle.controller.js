"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResults = exports.getStatus = void 0;
const client_1 = require("../../prisma/client");
async function getMediaWithLocalUrl(media) {
    if (!media)
        return media;
    const localUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${media.filename}`;
    return { ...media, imageUrl: localUrl };
}
const getStatus = async (req, res) => {
    const { id } = req.params;
    const media = await client_1.prisma.media.findUnique({
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
exports.getStatus = getStatus;
const getResults = async (req, res) => {
    const { id } = req.params;
    const media = await client_1.prisma.media.findUnique({
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
exports.getResults = getResults;
//# sourceMappingURL=vehicle.controller.js.map