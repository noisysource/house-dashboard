import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Primary types
  type PowerReading {
    id: ID!
    timestamp: String!
    power: Float!
    deviceId: String
    deviceName: String
    roomId: String
  }

  type PowerStats {
    current: CurrentStats!
    history: HistoryData!
  }

  type CurrentStats {
    power: Float!
    current: Float!
    today: Float!
    week: Float!
    month: Float!
  }

  type HistoryData {
    hourly: [TimeSeriesPoint!]!
    daily: [TimeSeriesPoint!]!
    monthly: [TimeSeriesPoint!]!
  }

  type TimeSeriesPoint {
    timestamp: String!
    value: Float!
  }

  # Room types
  type Room {
    id: ID
    name: String!
    power: RoomPower!
    current: RoomCurrent!
    devices: [String]
  }

  type RoomPower {
    day: Float!
    week: Float!
    month: Float!
  }

  type RoomCurrent {
    day: Float!
    week: Float!
    month: Float!
  }

  # Device type
  type Device {
    id: ID
    name: String!
    ip: String!
    type: String!
    location: String
    active: Boolean!
    roomId: ID
  }

  # Input types
  input TimeRangeInput {
    start: String!
    end: String
  }

  input RoomInput {
    name: String!
    devices: [String]
  }

  input DeviceInput {
    name: String!
    ip: String!
    type: String!
    location: String
    active: Boolean
  }

  # Queries
  type Query {
    currentPower: Float!
    powerStats(period: String!): PowerStats!
    powerReadings(timeRange: TimeRangeInput!, limit: Int): [PowerReading!]!
    
    # Room queries
    rooms: [Room!]!
    room(id: ID!): Room
    roomPowerData(period: String!): [Room!]!
    
    # Device queries
    devices: [Device!]!
    device(id: ID!): Device
  }

  # Mutations
  type Mutation {
    # Room mutations
    createRoom(input: RoomInput!): Room!
    updateRoom(id: ID!, input: RoomInput!): Room!
    deleteRoom(id: ID!): Boolean!
    
    # Device mutations
    createDevice(input: DeviceInput!): Device!
    updateDevice(id: ID!, input: DeviceInput!): Device!
    deleteDevice(id: ID!): Boolean!
    assignDeviceToRoom(deviceId: ID!, roomId: ID!): Device!
  }
`;