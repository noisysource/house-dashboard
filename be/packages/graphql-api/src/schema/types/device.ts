import { composeWithMongoose } from "graphql-compose-mongoose";
import { Device } from "@house-dashboard/db-service/src/models";

export const DeviceTC = composeWithMongoose(Device, { name: 'DeviceType' });

export const deviceQueries = {
  deviceById: DeviceTC.getResolver('findById'),
  deviceMany: DeviceTC.getResolver('findMany'),
};

export const deviceMutations = {
  deviceCreate: DeviceTC.getResolver('createOne'),
  deviceUpdateById: DeviceTC.getResolver('updateById'),
  deviceRemoveById: DeviceTC.getResolver('removeById'),
};