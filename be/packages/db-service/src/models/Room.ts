import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  name: string; // e.g., 'Living Room'
  devices: string[]; // List of device IDs used in this room
  channels: string[]; // List of channel IDs used in this room
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  devices: [{ type: Schema.Types.ObjectId, ref: 'Device' }], // Reference to Device model
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }] // Reference to Channel model
});

export const Room = mongoose.model<IRoom>("Room", RoomSchema);