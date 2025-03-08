import mongoose from 'mongoose';

export interface IPowerReading {
  timestamp: Date;
  power: number;
  current?: number;
  voltage?: number;
  deviceId: string;
  relayIndex?: number;
}

const PowerReadingSchema = new mongoose.Schema<IPowerReading>({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  power: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  voltage: {
    type: Number,
    default: 230
  },
  deviceId: {
    type: String,
    required: true
  },
  relayIndex: {
    type: Number
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
PowerReadingSchema.index({ timestamp: 1 });
PowerReadingSchema.index({ deviceId: 1, timestamp: 1 });

export const PowerReading = mongoose.model<IPowerReading>('PowerReading', PowerReadingSchema);