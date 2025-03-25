import mongoose, { ObjectId, Schema } from 'mongoose';

export interface IPowerReading {
  id: string;
  channelId: string; // Reference to Channel
  timestamp: Date;
  power: number; // Instant power (W)
  current: number; // Amps (A)
  voltage: number; // voltage (v)
}

const PowerReadingSchema = new mongoose.Schema<IPowerReading>({
  channelId: { type: String, ref: "Channel", required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  power: { type: Number, required: true },
  current: { type: Number, required: true },
  voltage: { type: Number, required: true },
}, {
  timestamps: true
});

// Create indexes for efficient queries
PowerReadingSchema.index({ deviceId: 1, timestamp: 1 });

export const PowerReading = mongoose.model<IPowerReading>('PowerReading', PowerReadingSchema);