import { schemaComposer } from 'graphql-compose';
import { ChannelTC } from '../types/channel';
import { Channel } from '@house-dashboard/db-service/src/models';

export function setupChannelResolvers() {
  // Resolver to find all channels
  ChannelTC.addResolver({
    name: 'findMany',
    type: [ChannelTC],
    resolve: async () => {
      return await Channel.find({});
    },
  });

  // Resolver to find a channel by ID
  ChannelTC.addResolver({
    name: 'findById',
    type: ChannelTC,
    args: { id: 'MongoID!' },
    resolve: async ({ args }: { args: { id: string } }) => {
      return await Channel.findById(args.id);
    },
  });

  // Add resolvers to the schema
  schemaComposer.Query.addFields({
    channelFindMany: ChannelTC.getResolver('findMany'),
    channelFindById: ChannelTC.getResolver('findById'),
  });

  schemaComposer.Mutation.addFields({
    channelCreateOne: ChannelTC.getResolver('createOne'),
    channelCreateMany: ChannelTC.getResolver('createMany'),
    channelUpdateById: ChannelTC.getResolver('updateById'),
    channelUpdateOne: ChannelTC.getResolver('updateOne'),
    channelUpdateMany: ChannelTC.getResolver('updateMany'),
    channelRemoveById: ChannelTC.getResolver('removeById'),
    channelRemoveOne: ChannelTC.getResolver('removeOne'),
    channelRemoveMany: ChannelTC.getResolver('removeMany'),
  });
}