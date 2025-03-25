import { Room } from '../models/Room';
import { Document, Types } from 'mongoose';

/**
 * Create a new room
 * @param name - Name of the room
 * @param description - Description of the room
 * @returns The created room document
 */
export async function createRoom(name: string, description: string): Promise<Document> {
    const room = new Room({ name, description });
    return await room.save();
}

/**
 * Get all rooms
 * @returns An array of room documents
 */
export async function getAllRooms(): Promise<Document[]> {
    return await Room.find();
}

/**
 * Get a room by ID
 * @param id - The ID of the room
 * @returns The room document or null if not found
 */
export async function getRoomById(id: string): Promise<Document | null> {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid room ID');
    }
    return await Room.findById(id);
}

/**
 * Update a room by ID
 * @param id - The ID of the room
 * @param updates - An object containing the fields to update
 * @returns The updated room document or null if not found
 */
export async function updateRoomById(id: string, updates: Partial<{ name: string; description: string }>): Promise<Document | null> {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid room ID');
    }
    return await Room.findByIdAndUpdate(id, updates, { new: true });
}

/**
 * Delete a room by ID
 * @param id - The ID of the room
 * @returns The deleted room document or null if not found
 */
export async function deleteRoomById(id: string): Promise<Document | null> {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid room ID');
    }
    return await Room.findByIdAndDelete(id);
}