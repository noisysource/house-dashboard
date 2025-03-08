import axios from 'axios';

const POWER_SERVICE_URL = process.env.POWER_SERVICE_URL || 'http://localhost:3001';

export async function getCurrentPowerData() {
  try {
    const response = await axios.get(`${POWER_SERVICE_URL}/api/power/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching power data from power-service:', error);
    return {
      devices: {},
      totalPower: 0,
      totalCurrent: 0,
      timestamp: Date.now()
    };
  }
}

export async function getDevicePowerData(deviceId: string) {
  try {
    const response = await axios.get(`${POWER_SERVICE_URL}/api/power/device/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching device ${deviceId} data:`, error);
    return [];
  }
}