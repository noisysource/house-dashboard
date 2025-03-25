// In your frontend GraphQL queries
import { gql } from '@apollo/client';

export const GET_DEVICES = gql`
  query DeviceMany {
    deviceMany {
      _id
      name
      type
      ipAddress
      macAddress
      # Other fields
    }
  }
`;

export const GET_DEVICE = gql`
  query DeviceById($id: ID!) {
    deviceById(id: $id) {
      id
      name
      type
      ipAddress
      macAddress
      # Other fields
    }
  }
`;

export const CREATE_DEVICE = gql`
  mutation CreateDevice($name: String!, $ipAddress: String!, $type: String!) {
    deviceCreateOne(name: $name, ipAddress: $ipAddress, type: $type) {
        name
        ipAddress
        type
    }
  }
`;

export const UPDATE_DEVICE = gql`
  mutation UpdateDevice($id: ID!, $input: DeviceInput!) {
    updateDevice(id: $id, input: $input) {
      id
      name
      type
      ipAddress
      macAddress
      # Other fields
    }
  }
`;

export const DELETE_DEVICE = gql`
  mutation DeleteDevice($id: ID!) {
    deleteDevice(id: $id) {
      id
    }
  }
`;