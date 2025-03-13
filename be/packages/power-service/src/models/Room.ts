import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  devices: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    devices: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);