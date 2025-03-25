import { composeWithMongoose } from "graphql-compose-mongoose";
import { PowerReading } from "@house-dashboard/db-service/src/models";

export const PowerReadingTC = composeWithMongoose(PowerReading, { name: 'PowerReadingType' });

export const powerReadingQueries = {
  powerReadingMany: PowerReadingTC.getResolver('findMany'),
};

export const powerReadingMutations = {
  // No mutations for power readings as they are typically created by the system
};