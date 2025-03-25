import { gql } from '@apollo/client';

export const GET_ROOMS = gql`
  query RoomMany {
    roomMany {
      id
      name
      floor
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROOM = gql`
  query RoomById($id: ID!) {
    roomById(id: $id) {
      id
      name
      floor
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation RoomCreateOne($record: CreateOneRoomInput!) {
    roomCreateOne(record: $record) {
      record {
        id
        name
        floor
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation RoomUpdateById($id: MongoID!, $record: UpdateByIdRoomInput!) {
    roomUpdateById(_id: $id, record: $record) {
      record {
        id
        name
        floor
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation RoomRemoveById($id: MongoID!) {
    roomRemoveById(_id: $id) {
      recordId
    }
  }
`;

// For assigning devices to rooms
export const UPDATE_DEVICE_ROOM = gql`
  mutation DeviceUpdateById($id: MongoID!, $record: UpdateByIdDeviceInput!) {
    deviceUpdateById(_id: $id, record: $record) {
      record {
        id
        name
        type
        ipAddress
        rooms
      }
    }
  }
`;

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
        deviceId
        deviceName
        totalEnergy
        averagePower
        peakPower
        readings {
          timestamp
          power
          energy
        }
      }
    }
  }
`;
