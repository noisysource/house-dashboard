import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  appliance: string;
  roomId: string
  deviceId: string // Reference to Physical Device
  channelNumber: number; // 0, 1, 2... (Device channel)
  status: boolean;
  lastUpdated: Date;
  mqttTopics: {
    state: string; // Topic to receive state updates (e.g., "shelly/kitchen/relay/0")
    command: string; // Topic to send commands (e.g., "shelly/kitchen/relay/0/set")
    power: string; // Topic for power updates (e.g., "shelly/kitchen/relay/0/power")
    current: string; // Topic for current updates (e.g., "shelly/kitchen/relay/0/current")
  };
}

const ChannelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  appliance: { type: String, ref: "Appliance", required: true },
  roomId: { type: String, ref: "Room", required: true },
  deviceId: { type: String, ref: "Device", required: true },
  channelNumber: { type: Number, required: true },
  status: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  mqttTopics: {
    state: { type: String, required: true },
    command: { type: String, required: true },
    power: { type: String, required: true },
    current: { type: String, required: true },
  },
});

export const Channel = mongoose.model<IChannel>("Channel", ChannelSchema);