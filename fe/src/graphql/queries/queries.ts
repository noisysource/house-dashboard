import { gql } from "@apollo/client";

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      name
      devices
    }
  }
`;

export const GET_ROOM = gql`
  query GetRoom($id: ID!) {
    room(id: $id) {
      id
      name
      devices
    }
  }
`;

// Query for room power data
export const ROOM_POWER_QUERY = `
  query RoomPowerData($period: String!) {
    roomPowerData(period: $period) {
      id
      name
      power {
        day
        week
        month
      }
      current {
        day
        week
        month
      }
      devices
    }
  }
`;

// Your existing POWER_STATS_QUERY
export const POWER_STATS_QUERY = `
  query PowerStats($period: String!) {
    powerStats(period: $period) {
      current {
        power
        today
        week
        month
      }
      history {
        hourly {
          timestamp
          value
        }
        daily {
          timestamp
          value
        }
        monthly {
          timestamp
          value
        }
      }
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation CreateRoom($input: RoomInput!) {
    createRoom(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: ID!, $input: RoomInput!) {
    updateRoom(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`;

export const ASSIGN_DEVICE = gql`
  mutation AssignDeviceToRoom($deviceId: ID!, $roomId: ID!) {
    assignDeviceToRoom(deviceId: $deviceId, roomId: $roomId) {
      id
      name
      roomId
    }
  }
`;

// Device queries and mutations
export const GET_DEVICES = gql`
  query GetDevices {
    devices {
      id
      name
      ip
      type
      location
      active
      roomId
    }
  }
`;

export const CREATE_DEVICE = gql`
  mutation CreateDevice($input: DeviceInput!) {
    createDevice(input: $input) {
      id
      name
      ip
      type
      location
      active
    }
  }
`;

export const UPDATE_DEVICE = gql`
  mutation UpdateDevice($id: ID!, $input: DeviceInput!) {
    updateDevice(id: $id, input: $input) {
      id
      name
      ip
      type
      location
      active
      roomId
    }
  }
`;

export const DELETE_DEVICE = gql`
  mutation DeleteDevice($id: ID!) {
    deleteDevice(id: $id)
  }
`;