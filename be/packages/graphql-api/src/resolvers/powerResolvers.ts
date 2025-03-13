import axios from 'axios';
import { powerServiceEndPoints } from '../../config/powerServiceEndPoints';

export const powerResolvers = {
  Query: {
    
    // Get power data for all rooms in a specific period
    roomPowerData: async (_: any, { period }: { period: string }) => {
      try {
        // Fetch rooms with their power data for the specified period
        const response = await axios.get(powerServiceEndPoints.power.roomsPowerData(period));

        // Transform data to match our GraphQL schema
        return response.data.map((room: any) => {
          // Map API response to GraphQL schema
          return {
            id: room.id,
            name: room.name,
            power: {
              day: room.power.day || 0,
              week: room.power.week || 0,
              month: room.power.month || 0
            },
            current: {
              day: room.current?.day || 0,
              week: room.current?.week || 0,
              month: room.current?.month || 0
            },
            devices: room.devices || []
          };
        });
      } catch (error) {
        console.error('Error fetching room power data:', error);

        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },

    powerStats: async (_: any, { period }: any) => {
      try {
        const response = await axios.get(powerServiceEndPoints.power.powerStats(period));

        // Important: Ensure the response has all required fields with fallbacks
        const data = response.data || {};

        // Create a complete object with all required fields
        return {
          current: {
            power: data.current?.power ?? 0,
            today: data.current?.today ?? 0,
            week: data.current?.week ?? 0,
            month: data.current?.month ?? 0
          },
          history: {
            hourly: data.history?.hourly || [],
            daily: data.history?.daily || [],
            monthly: data.history?.monthly || []
          }
        };
      } catch (error) {
        console.error('Error fetching power stats:', error);

        // Always return a valid object, never null for non-nullable fields
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
  },
};