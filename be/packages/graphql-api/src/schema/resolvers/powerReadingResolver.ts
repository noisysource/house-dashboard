import { schemaComposer } from 'graphql-compose';
import { PowerReadingTC } from '../types/powerReadings';
import { PowerReading } from '@house-dashboard/db-service/src/models';

export function setupPowerReadingResolvers() {
  // Resolver to find all power readings
  PowerReadingTC.addResolver({
    name: 'findMany',
    type: [PowerReadingTC],
    resolve: async () => {
      return await PowerReading.find({});
    },
  });

  // Resolver to find a power reading by ID
  PowerReadingTC.addResolver({
    name: 'findById',
    type: PowerReadingTC,
    args: { id: 'MongoID!' },
    resolve: async ({ args }: { args: { id: string } }) => {
      return await PowerReading.findById(args.id);
    },
  });

  // Resolver to find power readings by channelId
  PowerReadingTC.addResolver({
    name: 'findByChannelId',
    type: [PowerReadingTC],
    args: { channelId: 'String!' },
    resolve: async ({ args }: { args: { channelId: string } }) => {
      return await PowerReading.find({ channelId: args.channelId });
    },
  });
  // Resolver to find power readings within a time range
  PowerReadingTC.addResolver({
    name: 'findByTimeRange',
    type: [PowerReadingTC],
    args: {
      startTime: 'Date!',
      endTime: 'Date!',
      channelId: 'String',
    },
    resolve: async ({ args }: { args: { startTime: Date; endTime: Date; channelId?: string } }) => {
      const query: any = {
        timestamp: { $gte: args.startTime, $lte: args.endTime },
      };
      if (args.channelId) {
        query.channelId = args.channelId;
      }
      return await PowerReading.find(query);
    },
  });

  // Add resolvers to the schema
  schemaComposer.Query.addFields({
    powerReadingFindMany: PowerReadingTC.getResolver('findMany'),
    powerReadingFindById: PowerReadingTC.getResolver('findById'),
    powerReadingFindByChannelId: PowerReadingTC.getResolver('findByChannelId'),
    powerReadingFindByTimeRange: PowerReadingTC.getResolver('findByTimeRange'),
  });

  schemaComposer.Mutation.addFields({
    powerReadingCreateOne: PowerReadingTC.getResolver('createOne'),
    powerReadingCreateMany: PowerReadingTC.getResolver('createMany'),
    powerReadingUpdateById: PowerReadingTC.getResolver('updateById'),
    powerReadingUpdateOne: PowerReadingTC.getResolver('updateOne'),
    powerReadingUpdateMany: PowerReadingTC.getResolver('updateMany'),
    powerReadingRemoveById: PowerReadingTC.getResolver('removeById'),
    powerReadingRemoveOne: PowerReadingTC.getResolver('removeOne'),
    powerReadingRemoveMany: PowerReadingTC.getResolver('removeMany'),
  });
}