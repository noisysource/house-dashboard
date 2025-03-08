import mongoose from 'mongoose';

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
    enum: ['shelly', 'smart_meter', 'other']
  },
  location: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Device = mongoose.model('Device', DeviceSchema);