import express from 'express';
import { Room } from '../models/Room'
import { Device } from '../models/Device';

const router = express.Router();

// Assign device to room
router.put('/:id/assign', async (req, res) => {
  const { roomId } = req.body;
  
  try {
    // Verify device exists
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Verify room exists if roomId is provided
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
    }
    
    // Update device
    device.roomId = roomId || undefined;
    const updatedDevice = await device.save();
    
    res.json(updatedDevice);
  } catch (error) {
    console.error(`Error assigning device ${req.params.id} to room:`, error);
    res.status(500).json({ error: 'Failed to assign device to room' });
  }
});

// Get all devices
router.get('/', async (req, res) => {
  try {
    // Fetch all devices from your database
    const devices = await Device.find().lean();
    res.json(devices || []);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Create device
router.post('/', async (req, res) => {
  const { name, ip, type, location, active } = req.body;
  
  if (!name || !ip || !type) {
    return res.status(400).json({ error: 'Name, IP, and type are required' });
  }
  
  try {
    console.log('Creating device:', { name, ip, type, location, active });
    
    const device = new Device({
      name,
      ip, 
      type,
      location: location || '',
      active: active !== undefined ? active : true
    });
    
    const savedDevice = await device.save();
    console.log('Device created:', savedDevice);
    res.status(201).json(savedDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error(`Error fetching device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  const { name, ip, type, location, active } = req.body;
  
  // Only update fields that are provided
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (ip !== undefined) updates.ip = ip;
  if (type !== undefined) updates.type = type;
  if (location !== undefined) updates.location = location;
  if (active !== undefined) updates.active = active;
  
  try {
    console.log(`Updating device ${req.params.id} with:`, updates);
    
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    console.log('Device updated:', device);
    res.json(device);
  } catch (error) {
    console.error(`Error updating device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    await Device.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting device ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;