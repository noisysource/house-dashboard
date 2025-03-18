import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  name: string;
  ip: string;
  type: string;
  location: string;
  active: boolean;
  roomId?: string;
  channel: number;
  topic: string;
}

const DeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Other']
  },
  location: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  },
  channel: {
    type: Number,
    required: true
  },
  topic: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false,
  id: true,
  toJSON: { transform: (doc, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; } },
});

export const Device = mongoose.model('Device', DeviceSchema);