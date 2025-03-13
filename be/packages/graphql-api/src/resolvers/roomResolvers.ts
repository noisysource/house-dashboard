import axios from 'axios';
import { powerServiceEndPoints } from '../../config/powerServiceEndPoints';

// Power service URL

export const roomResolvers = {
  Query: {
    // Get all available rooms
    rooms: async () => {
      try {
        const response = await axios.get(powerServiceEndPoints.rooms.getRooms);
        return response.data;
      } catch (error) {
        console.error('Error fetching rooms:', error);
        return [];
      }
    },

    // Get a specific room by ID
    room: async (_: any, { id }: { id: string }) => {
      try {
        const response = await axios.get(powerServiceEndPoints.rooms.getRoomById(id));
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
        const response = await axios.post(powerServiceEndPoints.rooms.createRoom, {
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
        const response = await axios.put(powerServiceEndPoints.rooms.updateRoomById(id), {
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
        await axios.delete(powerServiceEndPoints.rooms.deleteRoomById(id));
        return true;
      } catch (error) {
        console.error(`Error deleting room with id ${id}:`, error);
        throw new Error('Failed to delete room');
      }
    },

    // Assign a device to a room
    assignDeviceToRoom: async (_: any, { deviceId, roomId }: { deviceId: string; roomId: string }) => {
      try {
        const response = await axios.put(powerServiceEndPoints.rooms.assignDeviceToRoom(deviceId), {
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