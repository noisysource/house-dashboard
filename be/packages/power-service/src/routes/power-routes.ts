import express from 'express';
import { powerReadings } from '../services/mqtt-service';
import { PowerReading } from '../models/PowerReading';
import { Room } from '../models/Room'
import { Device } from '../models/Device';

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
// Get all rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get a specific room
router.get('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).lean();
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error(`Error fetching room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Get power data for all rooms
router.get('/rooms-power', async (req, res) => {
  const { period = '24h' } = req.query;
  
  try {
    // Get all rooms
    const rooms = await Room.find().lean();
    
    // Define time ranges based on period
    const timeframe = getPeriodTimeframe(period as string);
    
    // Get all devices to map them to rooms
    const devices = await Device.find().lean();
    const devicesByRoom = devices.reduce((acc, device) => {
      if (device.roomId) {
        if (!acc[device.roomId.toString()]) {
          acc[device.roomId.toString()] = [];
        }
        acc[device.roomId.toString()].push(device);
      }
      return acc;
    }, {} as Record<string, any[]>);
    
    // Get power readings for the period
    const powerReadings = await PowerReading.find({
      timestamp: { $gte: timeframe.start }
    }).lean();
    
    // Group readings by device
    const readingsByDevice = powerReadings.reduce((acc, reading) => {
      if (reading.deviceId) {
        if (!acc[reading.deviceId]) {
          acc[reading.deviceId] = [];
        }
        acc[reading.deviceId].push(reading);
      }
      return acc;
    }, {} as Record<string, any[]>);
    
    // Calculate power for each room
    const roomsWithPower = rooms.map(room => {
      // Get devices in this room
      const roomDevices = devicesByRoom[room._id.toString()] || [];
      const deviceNames = roomDevices.map(d => d.name);
      
      // Calculate power for each device in the room
      let totalPower = 0;
      let totalReadingCount = 0;
      let totalCurrent = 0;
      
      roomDevices.forEach(device => {
        const deviceReadings = readingsByDevice[device._id.toString()] || [];
        if (deviceReadings.length > 0) {
          // Sum power for this device
          const devicePower = deviceReadings.reduce((sum, r) => sum + r.power, 0);
          totalPower += devicePower;
          
          // Sum current if available
          const deviceCurrent = deviceReadings.reduce((sum, r) => sum + (r.current || 0), 0);
          totalCurrent += deviceCurrent;
          
          totalReadingCount += deviceReadings.length;
        }
      });
      
      // Calculate averages
      const avgPower = totalReadingCount > 0 ? totalPower / totalReadingCount : 0;
      const avgCurrent = totalReadingCount > 0 ? totalCurrent / totalReadingCount : 0;
      
      // Calculate energy consumption (kWh)
      const { dayKwh, weekKwh, monthKwh, dayAvgCurrent, weekAvgCurrent, monthAvgCurrent } = 
        calculateEnergyConsumption(avgPower, avgCurrent, period as string);
      
      return {
        id: room._id,
        name: room.name,
        power: {
          day: dayKwh,
          week: weekKwh,
          month: monthKwh
        },
        current: {
          day: dayAvgCurrent,
          week: weekAvgCurrent,
          month: monthAvgCurrent
        },
        devices: deviceNames
      };
    });
    
    res.json(roomsWithPower);
  } catch (error) {
    console.error('Error fetching room power data:', error);
    res.status(500).json({ error: 'Failed to fetch room power data' });
  }
});

// Create a new room
router.post('/rooms', async (req, res) => {
  const { name, devices = [] } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }
  
  try {
    const room = new Room({
      name,
      devices
    });
    
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update a room
router.put('/rooms/:id', async (req, res) => {
  const { name, devices } = req.body;
  const updates: { name?: string, devices?: string[] } = {};
  
  if (name) updates.name = name;
  if (devices) updates.devices = devices;
  
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    console.error(`Error updating room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Delete a room
router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Update devices that were in this room
    await Device.updateMany(
      { roomId: req.params.id },
      { $set: { roomId: null } }
    );
    
    // Delete the room
    await Room.findByIdAndDelete(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Assign device to room
router.put('/devices/:id/assign', async (req, res) => {
  const { roomId } = req.body;
  
  try {
    // Verify device exists
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Verify room exists if roomId is provided
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
    }
    
    // Update device
    device.roomId = roomId || undefined;
    const updatedDevice = await device.save();
    
    res.json(updatedDevice);
  } catch (error) {
    console.error(`Error assigning device ${req.params.id} to room:`, error);
    res.status(500).json({ error: 'Failed to assign device to room' });
  }
});

router.get('/power/stats', async (req, res) => {
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

// Get all devices
router.get('/devices', async (req, res) => {
  try {
    // Fetch all devices from your database
    const devices = await Device.find().lean();
    res.json(devices || []);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Create device
router.post('/devices', async (req, res) => {
  const { name, ip, type, location, active } = req.body;
  
  if (!name || !ip || !type) {
    return res.status(400).json({ error: 'Name, IP, and type are required' });
  }
  
  try {
    console.log('Creating device:', { name, ip, type, location, active });
    
    const device = new Device({
      name,
      ip, 
      type,
      location: location || '',
      active: active !== undefined ? active : true
    });
    
    const savedDevice = await device.save();
    console.log('Device created:', savedDevice);
    res.status(201).json(savedDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Get device by ID
router.get('/devices/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error(`Error fetching device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Update device
router.put('/devices/:id', async (req, res) => {
  const { name, ip, type, location, active } = req.body;
  
  // Only update fields that are provided
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (ip !== undefined) updates.ip = ip;
  if (type !== undefined) updates.type = type;
  if (location !== undefined) updates.location = location;
  if (active !== undefined) updates.active = active;
  
  try {
    console.log(`Updating device ${req.params.id} with:`, updates);
    
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    console.log('Device updated:', device);
    res.json(device);
  } catch (error) {
    console.error(`Error updating device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/devices/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    await Device.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete device' });
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

// Calculate energy consumption from average power
function calculateEnergyConsumption(avgPower: number, avgCurrent: number, period: string) {
  // Convert watts to kWh based on period
  let hours: number;
  
  switch (period) {
    case '24h':
      hours = 24;
      break;
    case 'week':
      hours = 24 * 7;
      break;
    case 'month':
      hours = 24 * 30;
      break;
    default:
      hours = 24;
  }
  
  // kWh = W * h / 1000
  const kWh = (avgPower * hours) / 1000;
  
  // Scale values for different periods
  let dayKwh, weekKwh, monthKwh;
  let dayAvgCurrent, weekAvgCurrent, monthAvgCurrent;
  
  if (period === '24h') {
    dayKwh = kWh;
    weekKwh = dayKwh * 7;
    monthKwh = dayKwh * 30;
    dayAvgCurrent = avgCurrent;
    weekAvgCurrent = avgCurrent;
    monthAvgCurrent = avgCurrent;
  } else if (period === 'week') {
    weekKwh = kWh;
    dayKwh = weekKwh / 7;
    monthKwh = weekKwh * (30/7);
    weekAvgCurrent = avgCurrent;
    dayAvgCurrent = avgCurrent;
    monthAvgCurrent = avgCurrent;
  } else { // month
    monthKwh = kWh;
    dayKwh = monthKwh / 30;
    weekKwh = monthKwh / 4.3;
    monthAvgCurrent = avgCurrent;
    dayAvgCurrent = avgCurrent;
    weekAvgCurrent = avgCurrent;
  }
  
  // Round to 2 decimal places
  return {
    dayKwh: parseFloat(dayKwh.toFixed(2)),
    weekKwh: parseFloat(weekKwh.toFixed(2)),
    monthKwh: parseFloat(monthKwh.toFixed(2)),
    dayAvgCurrent: parseFloat(dayAvgCurrent.toFixed(2)),
    weekAvgCurrent: parseFloat(weekAvgCurrent.toFixed(2)),
    monthAvgCurrent: parseFloat(monthAvgCurrent.toFixed(2))
  };
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
async function aggregateTimeSeriesData(startDate: Date, interval: 'hour' | 'day' | 'month'): Promise<{timestamp: string, value: number}[]> {
  let groupBy: any;
  let sortFormat: string;
  
  switch(interval) {
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