import { Router } from 'express';
import { Device } from '../models/Device'
import { Room } from '../models';


const router = Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find()
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get a specific room
router.get('/:id', async (req, res): Promise<any> => {
  try {
    const room = await Room.findById(req.params.id).lean();

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error(`Error fetching room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Create a new room
router.post('/', async (req, res): Promise<any> => {
  const { name, devices = [] } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  try {
    const room = new Room({
      name,
      devices
    });

    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update a room
router.put('/:id', async (req, res): Promise<any> => {
  const { name, devices } = req.body;
  const updates: { name?: string, devices?: string[] } = {};

  if (name) updates.name = name;
  if (devices) updates.devices = devices;

  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error(`Error updating room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Delete a room
router.delete('/:id', async (req, res): Promise<any> => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update devices that were in this room
    await Device.updateMany(
      { roomId: req.params.id },
      { $set: { roomId: null } }
    );

    // Delete the room
    await Room.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting room ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;