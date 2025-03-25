import { schemaComposer } from 'graphql-compose';
import { RoomTC } from '../types/room';
import { Room } from '@house-dashboard/db-service/src/models';

export function setupRoomResolvers() {
  // Resolver to find all rooms
  RoomTC.addResolver({
    name: 'findMany',
    type: [RoomTC],
    resolve: async () => {
      const rooms = await Room.find({});
      console.log('All rooms:', rooms); // Debug log
      return rooms;
    }
  });

  // Resolver to find a room by ID
  RoomTC.addResolver({
    name: 'findById',
    type: RoomTC,
    args: { roomId: 'MongoID!' },
    resolve: async ({ args }: { args: { roomId: string } }) => {
      const room = await Room.findById(args.roomId);
      if (!room) {
        throw new Error(`Room with ID ${args.roomId} not found`);
      }
      return room;
    }
  });

  // Resolver to find rooms by a device
  RoomTC.addResolver({
    name: 'findByDevice',
    type: [RoomTC],
    args: { deviceId: 'MongoID!' },
    resolve: async ({ args }: { args: { deviceId: string } }) => {
      return Room.find({ devices: args.deviceId });
    }
  });

  // Queries
  schemaComposer.Query.addFields({
    roomById: RoomTC.getResolver('findById'),
    roomMany: RoomTC.getResolver('findMany'),

    // Custom queries
    roomsByDevice: RoomTC.getResolver('findByDevice'),
  });

  // Mutations
  schemaComposer.Mutation.addFields({
    // CRUD operations
    roomCreateOne: RoomTC.getResolver('createOne'),
    roomCreateMany: RoomTC.getResolver('createMany'),
    roomUpdateById: RoomTC.getResolver('updateById'),
    roomUpdateOne: RoomTC.getResolver('updateOne'),
    roomUpdateMany: RoomTC.getResolver('updateMany'),
    roomRemoveById: RoomTC.getResolver('removeById'),
    roomRemoveOne: RoomTC.getResolver('removeOne'),
    roomRemoveMany: RoomTC.getResolver('removeMany'),
  });
}