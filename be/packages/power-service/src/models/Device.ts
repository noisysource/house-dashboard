import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
  id: string;
  name: string;
  ip: string;
  type: string;
  location: string;
  active: boolean;
  roomId?: string; // Add this field
  createdAt: Date;
  updatedAt: Date;
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
    enum: ['TV', 'smart_meter', 'other']
  },
  location: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  roomId: { // Add this field
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const Device = mongoose.model('Device', DeviceSchema);