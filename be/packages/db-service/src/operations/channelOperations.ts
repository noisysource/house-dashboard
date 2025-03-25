
import axios from 'axios'; // Assuming axios for API calls
import { Channel, Device, Room } from '../models';

// Function to create or update device, channel, room, and configuration
export const createChannel = async (channelInfo: {
    channel: number;
    deviceIp: string;
    location: string;
    applianceId: string;
    roomId: string;
}): Promise<void> => {
    const { channel, deviceIp, location, applianceId, roomId } = channelInfo;

    // Step 1: Discover or create the device based on the IP address
    const deviceInfo = await axios.get(`http://${deviceIp}/device-info`);

    let device = await Device.findOne({ ipAddress: deviceIp });

    if (!device) {
        device = new Device({
            name: deviceInfo.data.name,
            type: deviceInfo.data.type,
            ipAddress: deviceIp,
            macAddress: deviceInfo.data.macAddress,
            mqttBaseTopic: deviceInfo.data.mqttBaseTopic,
            onlineStatusTopic: deviceInfo.data.onlineStatusTopic
        });
        await device.save();
    }

    // Step 2: Check if the room already exists, otherwise create it
    let room = await Room.findById(location); // Use location as roomId
    if (!room) {
        // If no room with the given location exists, create it
        room = new Room({
            name: roomId || 'No ID Provided', // Default name if roomName isn't provided
            devices: [device._id],
            channels: []
        });
        await room.save();
    } else {
        // Add device to the room if not already present
        if (!room.devices.includes(device.id)) {
            room.devices.push(device.id);
            await room.save();
        }
    }

    // Step 3: Create the channel and associate it with the appliance and room
    let channelDoc = await Channel.findOne({
        deviceId: device._id,
        channelNumber: channel
    });

    if (!channelDoc) {
        channelDoc = new Channel({
            deviceId: device._id,
            channelNumber: channel,
            appliance: applianceId,
            mqttTopics: {
                state: `shelly/${deviceInfo.data.mqttBaseTopic}/${channel}/state`,
                control: `shelly/${deviceInfo.data.mqttBaseTopic}/${channel}/control`
            },
            roomId: room._id // Associate channel with room
        });
        await channelDoc.save();
    }

    // Step 4: Add channel to the room if it's not already added
    if (!room.channels.includes(channelDoc.id)) {
        room.channels.push(channelDoc.id);
        await room.save();
    }

    // Step 5: Link the device to the channel and room
    device.rooms.push(room.id); // Add room reference to the device
    await device.save();

    console.log(`Channel ${channel} for device ${device.name} with appliance ${applianceId} created successfully in room ${room.name}`);
};