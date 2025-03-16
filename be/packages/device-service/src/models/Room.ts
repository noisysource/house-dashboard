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
  {
    timestamps: true,
    versionKey: false,
    id: true,
    toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
  }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);