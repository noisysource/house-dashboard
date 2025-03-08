import mongoose from 'mongoose';

const PowerReadingSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  power: {
    type: Number,
    required: true
  },
  deviceId: {
    type: String
  },
  deviceName: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for efficient queries
PowerReadingSchema.index({ timestamp: 1 });
PowerReadingSchema.index({ deviceId: 1, timestamp: 1 });

export const PowerReading = mongoose.model('PowerReading', PowerReadingSchema);