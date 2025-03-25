import { schemaComposer } from 'graphql-compose';
import { ApplianceTC } from '../types/appliance';
import { Appliance } from '@house-dashboard/db-service/src/models';

export function setupApplianceResolvers() {
  // Resolver to find all appliances
  ApplianceTC.addResolver({
    name: 'findMany',
    type: [ApplianceTC],
    resolve: async () => {
      return await Appliance.find({});
    },
  });

  // Resolver to find an appliance by ID
  ApplianceTC.addResolver({
    name: 'findById',
    type: ApplianceTC,
    args: { id: 'MongoID!' },
    resolve: async ({ args }: { args: { id: string } }) => {
      return await Appliance.findById(args.id);
    },
  });

  // Add resolvers to the schema
  schemaComposer.Query.addFields({
    applianceFindMany: ApplianceTC.getResolver('findMany'),
    applianceFindById: ApplianceTC.getResolver('findById'),
  });

  schemaComposer.Mutation.addFields({
    applianceCreateOne: ApplianceTC.getResolver('createOne'),
    applianceCreateMany: ApplianceTC.getResolver('createMany'),
    applianceUpdateById: ApplianceTC.getResolver('updateById'),
    applianceUpdateOne: ApplianceTC.getResolver('updateOne'),
    applianceUpdateMany: ApplianceTC.getResolver('updateMany'),
    applianceRemoveById: ApplianceTC.getResolver('removeById'),
    applianceRemoveOne: ApplianceTC.getResolver('removeOne'),
    applianceRemoveMany: ApplianceTC.getResolver('removeMany'),
  });
}