import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IDevice extends Document {
  id: string;
  name: string; // e.g., "Shelly Plus 2PM - Kitchen"
  type: "shelly" | "other";
  ipAddress: string;
  macAddress: string;
  rooms: string[]; // List of room IDs where this device is used
  channels: ObjectId[]; // References to Channels
  mqttBaseTopic: string; // e.g., "shelly/kitchen"
  onlineStatusTopic: string; // e.g., "shelly/kitchen/online"
  settings: {
    pollingInterval: number; // How often we poll Shelly (ms)
    autoRestart: boolean; // Auto-restart Shelly in case of failure
  };
  createdAt: Date;
  updatedAt: Date;
}

export const DeviceSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["shelly", "other"], required: true },
  ipAddress: { type: String, required: true },
  macAddress: { type: String, required: true, unique: true },
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }], // Reference to Room model
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  mqttBaseTopic: { type: String, required: true },
  onlineStatusTopic: { type: String, required: true },
  firmwareVersion: { type: String, default: "unknown" },
  settings: {
    pollingInterval: { type: Number, default: 5000 }, // Default 5 seconds
    autoRestart: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
  versionKey: false,
  id: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  }
});

// Ensure each channel on a physical device can only be mapped once
DeviceSchema.index({ physicalDeviceId: 1, channel: 1 }, { unique: true });

export const Device = mongoose.model<IDevice>('Device', DeviceSchema);