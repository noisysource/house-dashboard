import { composeWithMongoose } from "graphql-compose-mongoose";
import { Appliance } from "@house-dashboard/db-service/src/models";

export const ApplianceTC = composeWithMongoose(Appliance, { name: 'ApplianceType' });

export const applianceQueries = {
  applianceById: ApplianceTC.getResolver('findById'),
  applianceMany: ApplianceTC.getResolver('findMany'),
};

export const applianceMutations = {
  applianceCreate: ApplianceTC.getResolver('createOne'),
  applianceUpdateById: ApplianceTC.getResolver('updateById'),
  applianceRemoveById: ApplianceTC.getResolver('removeById'),
};