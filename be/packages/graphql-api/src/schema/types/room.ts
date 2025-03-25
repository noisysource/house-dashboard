import { composeWithMongoose } from "graphql-compose-mongoose";
import { Room } from "@house-dashboard/db-service/src/models";

export const RoomTC = composeWithMongoose(Room, { name: 'RoomType' });

export const roomQueries = {
  roomById: RoomTC.getResolver('findById'),
  roomMany: RoomTC.getResolver('findMany'),
};

export const roomMutations = {
  roomCreate: RoomTC.getResolver('createOne'),
  roomUpdateById: RoomTC.getResolver('updateById'),
  roomRemoveById: RoomTC.getResolver('removeById'),
};