import { create } from "lodash";

const POWER_SERVICE_URL = process.env.POWER_SERVICE_URL || 'http://localhost:3001';
const DEVICE_SERVICE_URL = process.env.DEVICE_SERVICE_URL || 'http://localhost:3002';

export const powerServiceEndPoints = {
    devices: {
        getDevices: `${DEVICE_SERVICE_URL}/api/devices/`,
        getDeviceById: (id: any) => `${DEVICE_SERVICE_URL}/api/devices/${id}`,
        createDevice: `${DEVICE_SERVICE_URL}/api/devices/`,
        updateDeviceById: (id: any) => `${DEVICE_SERVICE_URL}/api/devices/${id}`,
        deleteDeviceById: (id: any) => `${DEVICE_SERVICE_URL}/api/devices/${id}`,
    },
    rooms: {
        getRooms: `${DEVICE_SERVICE_URL}/api/rooms`,
        getRoomById: (id: any) => `${DEVICE_SERVICE_URL}/api/rooms/${id}`,
        createRoom: `${DEVICE_SERVICE_URL}/api/rooms`,
        updateRoomById: (id: any) => `${DEVICE_SERVICE_URL}/api/rooms/${id}`,
        deleteRoomById: (id: any) => `${DEVICE_SERVICE_URL}/api/rooms/${id}`,
        assignDeviceToRoom: (deviceId: any) => `${DEVICE_SERVICE_URL}/api/devices/${deviceId}/assign`
    },
    roomPowerData: `${DEVICE_SERVICE_URL}/api/rooms/power`,
    power: {
        powerStats: (period: any) => `${POWER_SERVICE_URL}/api/power/stats?period=${period}`,
        roomsPowerData: (period: any) => `${DEVICE_SERVICE_URL}/api/rooms/power?period=${period}`
    }

};
