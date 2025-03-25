import { schemaComposer } from 'graphql-compose';
import { composeWithMongoose } from 'graphql-compose-mongoose';
import {
  Device,
  Room,
  Channel,
  Appliance,
  PowerReading
} from '@house-dashboard/db-service/src/models';

// Import resolvers
import { setupDeviceResolvers } from './resolvers/deviceResolver';
import { setupRelations } from './relations/relations';
import { connectToDatabase } from '@house-dashboard/db-service/src/connection';
import { setupRoomResolvers } from './resolvers/roomResolver';
import { setupChannelResolvers } from './resolvers/channelResolver';
import { setupApplianceResolvers } from './resolvers/applianceResolver';
import { setupPowerReadingResolvers } from './resolvers/powerReadingResolver';

// Generate TypeComposers for each mongoose model
export const DeviceTC = composeWithMongoose(Device);
export const RoomTC = composeWithMongoose(Room);
export const ChannelTC = composeWithMongoose(Channel);
export const ApplianceTC = composeWithMongoose(Appliance);
export const PowerReadingTC = composeWithMongoose(PowerReading);

// Add Date scalar
if (!schemaComposer.has('Date')) {
  schemaComposer.createScalarTC({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => new Date(value as string | number | Date),
    serialize: (value: unknown) => (value as Date).toISOString(),
    parseLiteral: (ast) => {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value);
      }
      throw new Error('Date scalar literal parsing only supports string values');
    },
  });
}

// Set up schema
export async function buildSchema() {

  await connectToDatabase();
  console.log('📦 Connected to MongoDB');

  // Set up all resolvers
  setupDeviceResolvers();
  setupChannelResolvers();
  setupRoomResolvers();
  setupApplianceResolvers();
  setupPowerReadingResolvers();

  // Set up relations between types
  setupRelations();

  // Build schema
  return schemaComposer.buildSchema();
}