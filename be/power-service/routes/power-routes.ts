import express from 'express';
import { powerReadings } from '../services/mqtt-service';

const router = express.Router();

// Get all power readings
router.get('/readings', (req, res) => {
  const totalPower = Object.values(powerReadings).reduce((sum, device) => sum + device.power, 0);
  const totalCurrent = Object.values(powerReadings).reduce((sum, device) => sum + device.current, 0);
  
  res.json({
    devices: powerReadings,
    totalPower,
    totalCurrent,
    timestamp: Date.now()
  });
});

// Get specific device reading
router.get('/readings/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const reading = powerReadings[deviceId];
  
  if (!reading) {
    return res.status(404).json({ error: 'Device not found' });
  }
  
  res.json(reading);
});

export default router;