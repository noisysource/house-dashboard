import { IDevice, IRoom, IChannel, IAppliance, IPowerReading } from "@house-dashboard/db-service/src/models/";


export type CreateDeviceInput = Partial<Pick<IDevice, 'name' | 'ipAddress' | 'type'>>;
export type UpdateDeviceInput = Partial<Omit<IDevice, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateRoomInput = Omit<IRoom, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRoomInput = Partial<Omit<IRoom, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateChannelInput = Omit<IChannel, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateChannelInput = Partial<Omit<IChannel, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateApplianceInput = Omit<IAppliance, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateApplianceInput = Partial<Omit<IAppliance, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreatePowerReadingInput = Omit<IPowerReading, 'id' | 'createdAt' | 'updatedAt'>;
