import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IAppliance extends Document {
  id: string;
  name: string;
  type: "light" | "appliance" | "curtain" | "heater" | "charger";
  roomId: string
  channelId: string;
  deviceId: string;
  deviceChannelNumber: number;
}

const ApplianceSchema = new Schema<IAppliance>({
  name: { type: String, required: true },
  type: { type: String, enum: ["light", "appliance", "curtain", "heater", "charger"], required: true },
  roomId: { type: String, ref: "Room", required: true },
  channelId: { type: String, ref: "Channel", required: true },
  deviceId: { type: String, ref: "Device", required: true },
  deviceChannelNumber: { type: Number, required: true },
}, {
  timestamps: true,
  versionKey: false,
  id: true,
});

export const Appliance = mongoose.model<IAppliance>("Appliance", ApplianceSchema);