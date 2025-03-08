import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Primary types
  type PowerReading {
    id: ID!
    timestamp: String!
    power: Float!
    deviceId: String
    deviceName: String
  }

  type Device {
    id: ID!
    name: String!
    ip: String!
    type: String!
    location: String
    active: Boolean!
  }

  type PowerStats {
    current: CurrentStats!
    history: HistoryData!
  }

  type CurrentStats {
    power: Float!
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

  # Input types
  input TimeRangeInput {
    start: String!
    end: String
  }

  # Queries
  type Query {
    currentPower: Float!
    powerStats(period: String!): PowerStats!
    powerReadings(timeRange: TimeRangeInput!, limit: Int): [PowerReading!]!
  }
`;