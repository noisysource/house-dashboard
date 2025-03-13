import { create } from "lodash";

const POWER_SERVICE_URL = process.env.POWER_SERVICE_URL || 'http://localhost:3001';

export const powerServiceEndPoints = {
    devices: {
        getDevices: `${POWER_SERVICE_URL}/api/devices/`,
        getDeviceById: (id: any) => `${POWER_SERVICE_URL}/api/devices/${id}`,
        createDevice: `${POWER_SERVICE_URL}/api/devices/`,
        updateDeviceById: (id: any) => `${POWER_SERVICE_URL}/api/devices/${id}`,
        deleteDeviceById: (id: any) => `${POWER_SERVICE_URL}/api/devices/${id}`,
    },
    rooms: {
        getRooms: `${POWER_SERVICE_URL}/api/rooms`,
        getRoomById: (id: any) => `${POWER_SERVICE_URL}/api/rooms/${id}`,
        createRoom: `${POWER_SERVICE_URL}/api/rooms`,
        updateRoomById: (id: any) => `${POWER_SERVICE_URL}/api/rooms/${id}`,
        deleteRoomById: (id: any) => `${POWER_SERVICE_URL}/api/rooms/${id}`,
        assignDeviceToRoom: (deviceId: any) => `${POWER_SERVICE_URL}/api/devices/${deviceId}/assign`
    },
    roomPowerData: `${POWER_SERVICE_URL}/api/rooms/power`,
    power: {
        powerStats: (period: any) => `${POWER_SERVICE_URL}/api/power/stats?period=${period}`,
        roomsPowerData: (period: any) => `${POWER_SERVICE_URL}/api/rooms/power?period=${period}`
    }

};
