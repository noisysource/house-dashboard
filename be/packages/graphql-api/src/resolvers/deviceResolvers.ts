import axios from 'axios';
import { powerServiceEndPoints } from '../../config/powerServiceEndPoints';

export const deviceResolvers = {
  Query: {
    devices: async () => {
      try {
        // Add debugging
        console.log('Fetching devices from API');

        const response = await axios.get(powerServiceEndPoints.devices.getDevices);

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
        const response = await axios.get(`${powerServiceEndPoints.devices.getDeviceById(id)}`);
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
        const response = await axios.post(powerServiceEndPoints.devices.createDevice, input);
        return response.data;
      } catch (error) {
        console.error('Error creating device:', error);
        throw new Error('Failed to create device');
      }
    },
    updateDevice: async (_: any, { id, input }: { id: string, input: any }) => {
      try {
        const response = await axios.put(powerServiceEndPoints.devices.updateDeviceById(id), input);
        return response.data;
      } catch (error) {
        console.error(`Error updating device with id ${id}:`, error);
        throw new Error('Failed to update device');
      }
    },
    deleteDevice: async (_: any, { id }: { id: string }) => {
      try {
        await axios.delete(powerServiceEndPoints.devices.deleteDeviceById(id));
        return true;
      } catch (error) {
        console.error(`Error deleting device with id ${id}:`, error);
        throw new Error('Failed to delete device');
      }
    }
  }
};