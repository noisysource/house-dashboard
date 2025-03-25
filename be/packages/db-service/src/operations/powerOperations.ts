// In be/packages/db-service/src/operations/powerOperations.ts

import { PowerReading, IPowerReading } from '../models/PowerReading';
import { connectToDatabase } from '../connection';
import { Device } from '../models';

/**
 * Create a new power reading
 */
export const createPowerReading = async (data: Omit<IPowerReading, 'id'>): Promise<IPowerReading> => {
  try {
    const reading = new PowerReading(data);
    return await reading.save();
  } catch (error) {
    console.error('Error creating power reading:', error);
    throw error;
  }
};

/**
 * Get latest power readings (with pagination)
 */
export const getLatestPowerReadings = async (limit: number = 1000, skip: number = 0): Promise<IPowerReading[]> => {
  try {
    return await PowerReading.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    console.error('Error fetching latest power readings:', error);
    throw error;
  }
};

/**
 * Get power readings in a specific time range
 */
export const getPowerReadingsInTimeRange = async (
  startTime: Date,
  endTime: Date,
  deviceId?: string
): Promise<IPowerReading[]> => {
  try {
    const query: any = {
      timestamp: { $gte: startTime, $lte: endTime }
    };

    if (deviceId) {
      query.deviceId = deviceId;
    }

    return await PowerReading.find(query).sort({ timestamp: 1 });
  } catch (error) {
    console.error('Error fetching power readings in time range:', error);
    throw error;
  }
};


/**
 * Create multiple power readings at once
 */
export const createManyPowerReadings = async (
  readings: Omit<IPowerReading, 'id'>[]
): Promise<void> => {
  try {
    await connectToDatabase();
    await PowerReading.insertMany(readings);
  } catch (error) {
    console.error('Error creating power readings:', error);
    throw error;
  }
};

/**
 * Save processed power readings and return the saved readings along with device mappings
 */
export const saveProcessedPowerReadings = async (data: { channelId: string, power: number, current: number, voltage: number }, timestamp: Date): Promise<IPowerReading> => {

  try {
    await connectToDatabase();

    const { channelId, power, current, voltage } = data;

    const savedReading = await createPowerReading({
      channelId,
      timestamp,
      power,
      current,
      voltage,
    });

    return savedReading;

  } catch (error) {
    console.error('Error saving processed power readings:', error);
    throw error;
  }
};

