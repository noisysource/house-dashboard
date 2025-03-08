import axios from 'axios';

// Power service URL
const POWER_SERVICE_URL = process.env.POWER_SERVICE_URL || 'http://localhost:3001';

export const powerResolvers = {
  Query: {
    currentPower: async () => {
      try {
        const response = await axios.get(`${POWER_SERVICE_URL}/api/power/readings`);
        return {
          power: response.data.totalPower,
          current: response.data.totalCurrent // Make sure to include current
        };
      } catch (error) {
        console.error('Error fetching current power:', error);
        return {
          power: 0,
          current: 0
        };
      }
    },
    
    powerStats: async (_: any, { period }: any) => {
      try {
        // Get current readings
        const currentResponse = await axios.get(`${POWER_SERVICE_URL}/api/power/readings`);
        
        // Get historical stats
        const statsResponse = await axios.get(`${POWER_SERVICE_URL}/api/power/stats?period=${period}`);
        
        // Format data for frontend
        const formatData = (data: any[]) => {
          return data.map((point: { timestamp: any; power: number; }) => ({
            timestamp: point.timestamp,
            value: period === '24h' ? point.power : (point.power / 1000) * 24 // kWh for daily data
          }));
        };
        
        // Calculate totals based on stats
        const calculateTotal = (stats: any[]) => {
          if (stats.length === 0) return 0;
          
          // For 24h, we want kWh for the whole day
          if (period === '24h') {
            // Average power * time in hours / 1000
            const avgPower = stats.reduce((sum: any, item: { power: any; }) => sum + item.power, 0) / stats.length;
            return (avgPower * 24) / 1000;
          }
          
          // For week/month, sum up the daily kWh values
          return stats.reduce((sum: number, item: { power: number; }) => {
            const dailyKwh = (item.power * 24) / 1000; // convert W to kWh
            return sum + dailyKwh;
          }, 0);
        };
        
        const today = calculateTotal(statsResponse.data.filter((s: { timestamp: string | number | Date; }) => {
          const date = new Date(s.timestamp);
          const today = new Date();
          return date.toDateString() === today.toDateString();
        }));
        
        const week = calculateTotal(statsResponse.data);
        const month = calculateTotal(statsResponse.data);
        
        return {
          current: {
            power: currentResponse.data.totalPower,
            today: parseFloat(today.toFixed(1)),
            week: parseFloat(week.toFixed(1)),
            month: parseFloat(month.toFixed(1))
          },
          history: {
            hourly: period === '24h' ? formatData(statsResponse.data) : [],
            daily: period === 'week' ? formatData(statsResponse.data) : [],
            monthly: period === 'month' ? formatData(statsResponse.data) : []
          }
        };
      } catch (error) {
        console.error('Error fetching power stats:', error);
        throw new Error('Failed to fetch power statistics');
      }
    }
  }
};