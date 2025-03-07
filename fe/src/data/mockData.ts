// Update your mockPieData to reflect rooms
export const mockPieData = [
  {
    id: "living room",
    label: "Living Room",
    value: 8.2,
    color: "hsl(104, 70%, 50%)",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    value: 5.7,
    color: "hsl(162, 70%, 50%)",
  },
  {
    id: "bedroom",
    label: "Bedroom",
    value: 4.3,
    color: "hsl(291, 70%, 50%)",
  },
  {
    id: "bathroom",
    label: "Bathroom",
    value: 2.8,
    color: "hsl(229, 70%, 50%)",
  },
  {
    id: "office",
    label: "Home Office",
    value: 3.6,
    color: "hsl(344, 70%, 50%)",
  }
];

// Update mockBarData for device types
export const mockBarData = [
  {
    category: "HVAC",
    "consumption": 9.7,
    "consumptionColor": "hsl(229, 70%, 50%)",
  },
  {
    category: "Lighting",
    "consumption": 3.2,
    "consumptionColor": "hsl(296, 70%, 50%)",
  },
  {
    category: "Kitchen",
    "consumption": 6.5,
    "consumptionColor": "hsl(72, 70%, 50%)",
  },
  {
    category: "Entertainment",
    "consumption": 2.8,
    "consumptionColor": "hsl(257, 70%, 50%)",
  },
  {
    category: "Other",
    "consumption": 2.4,
    "consumptionColor": "hsl(190, 70%, 50%)",
  }
];


// src/data/mockData.ts
export interface Device {
  deviceId: string;
  name: string;
  status: string;
  amperage: number;
  kilowatts: number;
  time: string;
}


export interface Room {
  roomId: string;
  roomName: string;
  totalAmperage: number;
  totalKw: number;
  devices: Device[];
}

export const mockRoomData: Room[] = [
  {
    roomId: "LR",
    roomName: "Living Room",
    totalAmperage: 6.8,
    totalKw: 1.53,
    devices: [
      {
        deviceId: "LR-001",
        name: "Main Lights",
        status: "active",
        amperage: 1.2,
        kilowatts: 0.27,
        time: "2h 15m",
      },
      // ... other devices
    ]
  },
  // ... other rooms
];