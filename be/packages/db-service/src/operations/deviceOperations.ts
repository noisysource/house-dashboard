import mongoose from 'mongoose';
import { Device, IDevice } from '../models/Device';

/**
 * Get all devices
 */
export const getAllDevices = async (): Promise<IDevice[]> => {
  try {
    return await Device.find().populate('roomId');
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

/**
 * Get a device by ID
 */
export const getDeviceById = async (id: string): Promise<IDevice | null> => {
  try {
    return await Device.findById(id).populate('roomId');
  } catch (error) {
    console.error(`Error fetching device with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a device
 */
export const deleteDevice = async (id: string): Promise<boolean> => {
  try {
    const result = await Device.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error(`Error deleting device with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get devices by room ID
 */
export const getDevicesByRoomId = async (roomId: string): Promise<IDevice[]> => {
  try {
    return await Device.find({ roomId: new mongoose.Types.ObjectId(roomId) });
  } catch (error) {
    console.error(`Error fetching devices for room ${roomId}:`, error);
    throw error;
  }
};

/**
 * Get device by physical device ID and channel
 */
export const getDeviceByPhysicalIdAndChannel = async (
  physicalDeviceId: string, 
  channel: number
): Promise<IDevice | null> => {
  try {
    return await Device.findOne({ 
      physicalDeviceId,
      channel 
    }).populate('roomId');
  } catch (error) {
    console.error(`Error fetching device mapping for ${physicalDeviceId}/${channel}:`, error);
    throw error;
  }
};

/**
 * Assign a device to a room
 */
export const assignDeviceToRoom = async (
  deviceId: string, 
  roomId: string | null
): Promise<IDevice | null> => {
  try {
    const updateData: any = roomId 
      ? { roomId: new mongoose.Types.ObjectId(roomId) }
      : { $unset: { roomId: 1 } };
      
    return await Device.findByIdAndUpdate(
      deviceId,
      updateData,
      { new: true, runValidators: true }
    ).populate('roomId');
  } catch (error) {
    console.error(`Error assigning device ${deviceId} to room ${roomId}:`, error);
    throw error;
  }
};