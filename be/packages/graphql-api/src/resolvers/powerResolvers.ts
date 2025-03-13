import axios from 'axios';

// Power service URL
const POWER_SERVICE_URL = process.env.POWER_SERVICE_URL || 'http://localhost:3001';

const powerResolvers = {
  Query: {
    
    // Get power data for all rooms in a specific period
    roomPowerData: async (_: any, { period }: { period: string }) => {
      try {
        // Fetch rooms with their power data for the specified period
        const response = await axios.get(`${POWER_SERVICE_URL}/api/rooms/power?period=${period}`);

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
        const response = await axios.get(`${POWER_SERVICE_URL}/api/power/stats?period=${period}`);

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

const roomResolvers = {
  Query: {
    // Get all available rooms
    rooms: async () => {
      try {
        const response = await axios.get(`${POWER_SERVICE_URL}/api/rooms`);
        return response.data;
      } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
      }
    },

    // Get a specific room by ID
    room: async (_: any, { id }: { id: string }) => {
      try {
        const response = await axios.get(`${POWER_SERVICE_URL}/api/rooms/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching room with id ${id}:`, error);
        return null;
      }
    },
  },
  Mutation: {
    // Create a new room
    createRoom: async (_: any, { input }: { input: { name: string; devices?: string[] } }) => {
      try {
        const response = await axios.post(`${POWER_SERVICE_URL}/api/power/rooms`, {
          name: input.name,
          devices: input.devices || []
        });

        return response.data;
      } catch (error) {
        console.error('Error creating room:', error);
        throw new Error('Failed to create room');
      }
    },

    // Update an existing room
    updateRoom: async (_: any, { id, input }: { id: string; input: { name: string; devices?: string[] } }) => {
      try {
        const response = await axios.put(`${POWER_SERVICE_URL}/api/rooms/${id}`, {
          name: input.name,
          devices: input.devices
        });

        return response.data;
      } catch (error) {
        console.error(`Error updating room with id ${id}:`, error);
        throw new Error('Failed to update room');
      }
    },

    // Delete a room
    deleteRoom: async (_: any, { id }: { id: string }) => {
      try {
        await axios.delete(`${POWER_SERVICE_URL}/api/rooms/${id}`);
        return true;
      } catch (error) {
        console.error(`Error deleting room with id ${id}:`, error);
        throw new Error('Failed to delete room');
      }
    },

    // Assign a device to a room
    assignDeviceToRoom: async (_: any, { deviceId, roomId }: { deviceId: string; roomId: string }) => {
      try {
        const response = await axios.put(`${POWER_SERVICE_URL}/api/devices/${deviceId}/assign`, {
          roomId
        });

        return response.data;
      } catch (error) {
        console.error(`Error assigning device ${deviceId} to room ${roomId}:`, error);
        throw new Error('Failed to assign device to room');
      }
    }
  }
}

const deviceResolvers = {
  Query: {
    devices: async () => {
      try {
        // Add debugging
        console.log('Fetching devices from API');

        const response = await axios.get(`${POWER_SERVICE_URL}/api/devices`);

        // Debug what we got back
        console.log('API response status:', response.status);
        console.log('API response data type:', typeof response.data);
        console.log('API response data is array:', Array.isArray(response.data));

        // Always ensure we return an array
        if (!response.data) {
          console.log('No data returned from API, returning empty array');
          return [];
        }

        // If response.data is an object with an error property, it's an error
        if (typeof response.data === 'object' && !Array.isArray(response.data) && response.data.error) {
          console.error('API returned error:', response.data.error);
          return [];
        }

        // If somehow we got a non-array, return empty array
        if (!Array.isArray(response.data)) {
          console.error('API did not return an array:', response.data);
          return [];
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching devices:', error);
        // Always return an array on error, not null
        return [];
      }
    },
    device: async (_: any, { id }: { id: string }) => {
      try {
        const response = await axios.get(`${POWER_SERVICE_URL}/api/devices/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching device with id ${id}:`, error);
        return null;
      }
    }
  },
  Mutation: {
    createDevice: async (_: any, { input }: { input: any }) => {
      try {
        const response = await axios.post(`${POWER_SERVICE_URL}/api/devices`, input);
        return response.data;
      } catch (error) {
        console.error('Error creating device:', error);
        throw new Error('Failed to create device');
      }
    },
    updateDevice: async (_: any, { id, input }: { id: string, input: any }) => {
      try {
        const response = await axios.put(`${POWER_SERVICE_URL}/api/devices/${id}`, input);
        return response.data;
      } catch (error) {
        console.error(`Error updating device with id ${id}:`, error);
        throw new Error('Failed to update device');
      }
    },
    deleteDevice: async (_: any, { id }: { id: string }) => {
      try {
        await axios.delete(`${POWER_SERVICE_URL}/api/devices/${id}`);
        return true;
      } catch (error) {
        console.error(`Error deleting device with id ${id}:`, error);
        throw new Error('Failed to delete device');
      }
    }
  }
};

export const resolvers = {
  Query: {
    ...powerResolvers.Query,
    ...deviceResolvers.Query,
    ...roomResolvers.Query
  },
  Mutation: {
    ...roomResolvers.Mutation,
    ...deviceResolvers.Mutation
  }
}