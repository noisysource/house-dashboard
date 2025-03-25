import express from 'express';
import { getDeviceById } from '../operations/deviceOperations';

const router = express.Router();

/**
 * GET /:id
 * Fetches a device by its ID.
 * 
 * @param req - Express request object containing the device ID in `req.params.id`.
 * @param res - Express response object used to send the device data or an error message.
 * @returns A JSON response with the device data or an error message.
 */
router.get('/:id', async (req, res): Promise<any> => {
    try {
        const device = await getDeviceById(req.params.id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device' });
    }
});

export default router;