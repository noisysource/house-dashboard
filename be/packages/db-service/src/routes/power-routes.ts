import express from 'express';
import { powerReadings } from '@house-dashboard/power-service/src/services/mqtt-service';
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
router.get('/history', async (req, res): Promise<any> => {
  try {
    const { period = '24h', deviceId } = req.query;

    // Define time ranges based on period
    const now = new Date();
    let startDate;

    switch (period) {
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
router.get('/stats', async (req, res): Promise<any> => {
  try {
    const { period = '24h' } = req.query;

    // Define time ranges based on period
    const now = new Date();
    let startDate;
    let groupBy;

    switch (period) {
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

router.get('/power/stats', async (req, res): Promise<any> => {
  const { period = '24h' } = req.query;

  try {
    // Your existing code to fetch stats
    const stats = await fetchPowerStats(period as string);

    // If stats are null or undefined, return default structure
    if (!stats) {
      return res.json({
        current: {
          power: 0,
          today: 0,
          week: 0,
          month: 0
        },
        history: {
          hourly: [],
          daily: [],
          monthly: []
        }
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching power stats:', error);

    // Return default data instead of error
    res.json({
      current: {
        power: 0,
        today: 0,
        week: 0,
        month: 0
      },
      history: {
        hourly: [],
        daily: [],
        monthly: []
      }
    });
  }
});

// Helper functions

// Get time range based on period string
function getPeriodTimeframe(period: string) {
  const now = new Date();
  let start: Date;

  switch (period) {
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return { start, end: now };
}

/**
 * Fetches power statistics for a given period
 * @param period - Time period: '24h', 'week', or 'month'
 * @returns Promise with power statistics
 */
async function fetchPowerStats(period: string): Promise<any> {
  // Get time range based on period
  const timeframe = getPeriodTimeframe(period);

  try {
    // Get all power readings for the period
    const readings = await PowerReading.find({
      timestamp: { $gte: timeframe.start }
    }).lean();

    if (readings.length === 0) {
      // No data available, return default structure
      return {
        current: {
          power: 0,
          today: 0,
          week: 0,
          month: 0
        },
        history: {
          hourly: [],
          daily: [],
          monthly: []
        }
      };
    }

    // Calculate current statistics
    const avgPower = readings.reduce((sum, r) => sum + r.power, 0) / readings.length;
    const currentTimestamp = new Date();
    const todayStart = new Date(currentTimestamp);
    todayStart.setHours(0, 0, 0, 0);

    // Get today's data
    const todayReadings = readings.filter(r => new Date(r.timestamp) >= todayStart);
    const todayAvgPower = todayReadings.length > 0
      ? todayReadings.reduce((sum, r) => sum + r.power, 0) / todayReadings.length
      : 0;

    // Calculate kWh values
    const todayHours = (currentTimestamp.getTime() - todayStart.getTime()) / (1000 * 60 * 60);
    const todayKwh = (todayAvgPower * todayHours) / 1000;

    // Calculate week and month based on today's average
    const weekKwh = todayKwh * 7;
    const monthKwh = todayKwh * 30;

    // Group readings by hour, day, and month for charts
    const hourlyData = await aggregateTimeSeriesData(timeframe.start, 'hour');
    const dailyData = await aggregateTimeSeriesData(timeframe.start, 'day');
    const monthlyData = await aggregateTimeSeriesData(
      new Date(timeframe.start.getTime() - 365 * 24 * 60 * 60 * 1000), // Go back a year
      'month'
    );

    return {
      current: {
        power: parseFloat(avgPower.toFixed(2)),
        today: parseFloat(todayKwh.toFixed(2)),
        week: parseFloat(weekKwh.toFixed(2)),
        month: parseFloat(monthKwh.toFixed(2))
      },
      history: {
        hourly: hourlyData,
        daily: dailyData,
        monthly: monthlyData
      }
    };
  } catch (error) {
    console.error('Error in fetchPowerStats:', error);
    // Return default structure instead of throwing
    return {
      current: {
        power: 0,
        today: 0,
        week: 0,
        month: 0
      },
      history: {
        hourly: [],
        daily: [],
        monthly: []
      }
    };
  }
}

/**
 * Aggregates power readings into time series data
 * @param startDate - Start date for data aggregation
 * @param interval - Time interval: 'hour', 'day', or 'month'
 */
async function aggregateTimeSeriesData(startDate: Date, interval: 'hour' | 'day' | 'month'): Promise<{ timestamp: string, value: number }[]> {
  let groupBy: any;
  let sortFormat: string;

  switch (interval) {
    case 'hour':
      groupBy = { $dateToString: { format: "%Y-%m-%dT%H:00:00.000Z", date: "$timestamp" } };
      sortFormat = "%Y-%m-%dT%H:00:00.000Z";
      break;
    case 'day':
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
      sortFormat = "%Y-%m-%d";
      break;
    case 'month':
      groupBy = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
      sortFormat = "%Y-%m";
      break;
    default:
      groupBy = { $dateToString: { format: "%Y-%m-%dT%H:00:00.000Z", date: "$timestamp" } };
      sortFormat = "%Y-%m-%dT%H:00:00.000Z";
  }

  try {
    const aggregatedData = await PowerReading.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          avgPower: { $avg: "$power" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          timestamp: "$_id",
          value: { $round: ["$avgPower", 2] }
        }
      }
    ]);

    return aggregatedData;
  } catch (error) {
    console.error(`Error aggregating ${interval} data:`, error);
    return [];
  }
}

export default router;