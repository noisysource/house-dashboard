import { gql } from '@apollo/client';

// Get power readings by channelId with optional time range
export const GET_POWER_READINGS_BY_CHANNEL = gql`
  query PowerReadingsByChannel($channelId: ID!, $from: DateTime, $to: DateTime, $limit: Int) {
    powerReadingsByChannel(channelId: $channelId, from: $from, to: $to, limit: $limit) {
      id
      channelId
      deviceId
      roomId
      applianceId
      timestamp
      power
      current
      voltage
      energy
    }
  }
`;

// Get latest power reading for a channel
export const GET_LATEST_POWER_READING_BY_CHANNEL = gql`
  query LatestPowerReadingByChannel($channelId: ID!) {
    latestPowerReadingByChannel(channelId: $channelId) {
      id
      channelId
      deviceId
      timestamp
      power
      current
      voltage
      energy
    }
  }
`;

// Get power readings by deviceId (useful for multi-channel devices)
export const GET_POWER_READINGS_BY_DEVICE = gql`
  query PowerReadingsByDevice($deviceId: ID!, $from: DateTime, $to: DateTime, $limit: Int) {
    powerReadingsByDevice(deviceId: $deviceId, from: $from, to: $to, limit: $limit) {
      id
      channelId
      deviceId
      roomId
      applianceId
      timestamp
      power
      current
      voltage
      energy
    }
  }
`;

// Get aggregated power statistics by channel
export const GET_POWER_STATS_BY_CHANNEL = gql`
  query PowerStatsByChannel($channelId: ID!, $period: String!) {
    powerStatsByChannel(channelId: $channelId, period: $period) {
      channelId
      period
      totalEnergy
      averagePower
      peakPower
      peakTime
      cost
      readings {
        timestamp
        power
        energy
      }
    }
  }
`;

// Get aggregated statistics for all channels in a room
export const GET_ROOM_POWER_STATS = gql`
  query RoomPowerStats($roomId: ID!, $period: String!) {
    roomPowerStats(roomId: $roomId, period: $period) {
      roomId
      roomName
      totalEnergy
      averagePower
      peakPower
      cost
      channels {
        channelId
        channelName
        totalEnergy
        averagePower
        peakPower
      }
    }
  }
`;

// Get total consumption for entire household
export const GET_TOTAL_CONSUMPTION = gql`
  query TotalConsumption($period: String!) {
    totalConsumption(period: $period) {
      period
      totalEnergy
      totalCost
      comparison {
        previousPeriod
        percentageChange
      }
      breakdown {
        roomId
        roomName
        energy
        percentage
      }
    }
  }
`;