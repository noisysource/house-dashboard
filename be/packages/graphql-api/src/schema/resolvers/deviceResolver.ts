import { schemaComposer } from 'graphql-compose';
import { DeviceTC } from '../types/device';
import { Device } from '@house-dashboard/db-service/src/models';


export function setupDeviceResolvers() {

  DeviceTC.addResolver({
    name: 'createOne',
    type: DeviceTC,
    args: {
      name: 'String!',
      ipAddress: 'String!',
      type: 'String!'
    },
    resolve: async ({ args }: { args: { name: string, ipAddress: string, type: string } }) => {
      try {
        const device = await Device.create({
          name: args.name,
          ipAddress: args.ipAddress,
          type: args.type
        });
        return device;
      }
      catch (error) {
        console.error('Error creating device:', error);
        throw error;
      }
    }
  });

  DeviceTC.addResolver({
    name: 'findMany',
    type: [DeviceTC],
    resolve: async () => {
      const devices = await Device.find({});
      console.log('All devices:', devices); // Debug log
      return devices;
    }
  });
  // Get devices by room
  DeviceTC.addResolver({
    name: 'findByRoom',
    type: [DeviceTC],
    args: { roomId: 'MongoID!' },
    resolve: async ({ args }: { args: { roomId: string } }) => {
      // Find devices that include the roomId in their rooms array
      return Device.find({ rooms: args.roomId });
    }
  });

  // Restart a device (via MQTT)
  DeviceTC.addResolver({
    name: 'restart',
    type: DeviceTC,
    args: { deviceId: 'MongoID!' },
    resolve: async ({ args }: { args: { deviceId: string } }) => {
      const device = await Device.findById(args.deviceId);

      if (!device) {
        throw new Error(`Device with ID ${args.deviceId} not found`);
      }

      // In a real implementation, send MQTT command to restart the device
      console.log(`Sending restart command to device ${device.name} (${device.mqttBaseTopic})`);

      // You would publish to MQTT here
      // mqttClient.publish(`${device.mqttBaseTopic}/restart`, 'true');

      return device;
    }
  });


  // Queries
  schemaComposer.Query.addFields({
    deviceById: DeviceTC.getResolver('findById'),
    deviceByIds: DeviceTC.getResolver('findByIds'),
    deviceOne: DeviceTC.getResolver('findOne'),
    deviceMany: DeviceTC.getResolver('findMany'),
    deviceCount: DeviceTC.getResolver('count'),
    deviceConnection: DeviceTC.getResolver('connection'),
    devicePagination: DeviceTC.getResolver('pagination'),

    // Custom queries
    devicesByRoom: DeviceTC.getResolver('findByRoom'),
  });

  // Mutations
  schemaComposer.Mutation.addFields({
    // CRUD operations
    deviceCreateOne: DeviceTC.getResolver('createOne'),
    deviceCreateMany: DeviceTC.getResolver('createMany'),
    deviceUpdateById: DeviceTC.getResolver('updateById'),
    deviceUpdateOne: DeviceTC.getResolver('updateOne'),
    deviceUpdateMany: DeviceTC.getResolver('updateMany'),
    deviceRemoveById: DeviceTC.getResolver('removeById'),
    deviceRemoveOne: DeviceTC.getResolver('removeOne'),
    deviceRemoveMany: DeviceTC.getResolver('removeMany'),

    // Custom mutations
    restartDevice: DeviceTC.getResolver('restart'),
  });
}