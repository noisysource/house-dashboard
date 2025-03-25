import { DeviceTC } from '../types/device';
import { RoomTC } from '../types/room';
import { ChannelTC } from '../types/channel';
import { ApplianceTC } from '../types/appliance';
import { PowerReadingTC } from '../types/powerReadings';

export function setupRelations() {
  // Device relations
  DeviceTC.addRelation('channels', {
    resolver: () => ChannelTC.getResolver('findMany'),
    prepareArgs: {
      filter: (source) => ({ deviceId: source._id }),
    },
    projection: { _id: 1 },
  });

  // Channel relations
  ChannelTC.addRelation('device', {
    resolver: () => DeviceTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id, // Fixed: use deviceId not id
    },
    projection: { deviceId: 1 },
  });

  ChannelTC.addRelation('room', {
    resolver: () => RoomTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id, // Fixed: use roomId not id
    },
    projection: { roomId: 1 },
  });

  ChannelTC.addRelation('appliance', {
    resolver: () => ApplianceTC.getResolver('findOne'),
    prepareArgs: {
      filter: (source) => ({ channelId: source._id }),
    },
    projection: { _id: 1 },
  });

  // Room relations
  RoomTC.addRelation('channels', {
    resolver: () => ChannelTC.getResolver('findMany'),
    prepareArgs: {
      filter: (source) => ({ roomId: source._id }),
    },
    projection: { _id: 1 },
  });

  RoomTC.addRelation('appliances', {
    resolver: () => ApplianceTC.getResolver('findMany'),
    prepareArgs: {
      filter: (source) => ({ roomId: source._id }),
    },
    projection: { _id: 1 },
  });

  // Appliance relations
  ApplianceTC.addRelation('channel', {
    resolver: () => ChannelTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { channelId: 1 },
  });

  ApplianceTC.addRelation('room', {
    resolver: () => RoomTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { roomId: 1 },
  });

  // PowerReading relations
  PowerReadingTC.addRelation('channel', {
    resolver: () => ChannelTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { channelId: 1 },
  });

  PowerReadingTC.addRelation('device', {
    resolver: () => DeviceTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { deviceId: 1 },
  });

  PowerReadingTC.addRelation('room', {
    resolver: () => RoomTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { roomId: 1 },
  });

  PowerReadingTC.addRelation('appliance', {
    resolver: () => ApplianceTC.getResolver('findById'),
    prepareArgs: {
      _id: (source) => source.id,
    },
    projection: { applianceId: 1 },
  });
}