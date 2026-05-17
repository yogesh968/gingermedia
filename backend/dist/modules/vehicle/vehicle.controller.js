"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResults = exports.getStatus = void 0;
const client_1 = require("../../prisma/client");
const getStatus = async (req, res) => {
    const { id } = req.params;
    const media = await client_1.prisma.media.findUnique({
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
        return res.status(404).json({ error: 'Media not found' });
    }
    return res.json(media);
};
exports.getResults = getResults;
//# sourceMappingURL=vehicle.controller.js.map