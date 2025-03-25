import { IDevice } from "@house-dashboard/db-service/src/models/";

export interface DeviceManyResponse {
    deviceMany: IDevice[];
  }
  
  export interface DeviceByIdResponse {
    deviceById: IDevice;
  }
  
  export interface DeviceCreateOneResponse {
    deviceCreateOne: {
      record: IDevice;
    };
  }
  
  export interface DeviceUpdateByIdResponse {
    deviceUpdateById: {
      record: IDevice;
    };
  }
  
  export interface DeviceRemoveByIdResponse {
    deviceRemoveById: {
      recordId: string;
    };
  }