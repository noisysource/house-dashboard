import express from 'express';
import { powerReadings } from '../services/mqtt-service';
import { PowerReading } from '../models/PowerReading';

const router = express.Router();

// Get current power readings
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

// Get historical power data (for a time period)
router.get('/history', async (req, res) => {
  try {
    const { period = '24h', deviceId } = req.query;
    
    // Define time ranges based on period
    const now = new Date();
    let startDate;
    
    switch(period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use 24h, week, or month' });
    }
    
    // Build query
    const query: any = { timestamp: { $gte: startDate } };
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    // Get readings
    const readings = await PowerReading
      .find(query)
      .sort({ timestamp: 1 })
      .lean();
      
    res.json(readings);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get aggregated statistics (hourly, daily)
router.get('/stats', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Define time ranges based on period
    const now = new Date();
    let startDate;
    let groupBy;
    
    switch(period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%dT%H:00:00Z", date: "$timestamp" } };
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use 24h, week, or month' });
    }
    
    // Aggregate data for the period
    const stats = await PowerReading.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          avgPower: { $avg: "$power" },
          maxPower: { $max: "$power" },
          minPower: { $min: "$power" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the response
    const formattedStats = stats.map(stat => ({
      timestamp: stat._id,
      power: stat.avgPower,
      maxPower: stat.maxPower,
      minPower: stat.minPower,
      count: stat.count
    }));
    
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get specific device reading
router.get('/device/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const deviceReadings = Object.values(powerReadings)
    .filter(reading => reading.deviceId === deviceId);
  
  if (deviceReadings.length === 0) {
    return res.status(404).json({ error: `Device ${deviceId} not found` });
  }
  
  res.json(deviceReadings);
});

export default router;