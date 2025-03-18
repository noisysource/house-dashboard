import { IDevice } from './Device';

export interface IRoom {
    roomId: string;
    roomName: string;
    totalAmperage: number;
    totalKw: number;
    devices: IDevice[];
  }