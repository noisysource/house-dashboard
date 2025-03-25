import { composeWithMongoose } from "graphql-compose-mongoose";
import { Channel } from "@house-dashboard/db-service/src/models";

export const ChannelTC = composeWithMongoose(Channel, { name: 'ChannelType' });

export const channelQueries = {
  channelById: ChannelTC.getResolver('findById'),
  channelMany: ChannelTC.getResolver('findMany'),
};

export const channelMutations = {
  channelCreate: ChannelTC.getResolver('createOne'),
  channelUpdateById: ChannelTC.getResolver('updateById'),
  channelRemoveById: ChannelTC.getResolver('removeById'),
};