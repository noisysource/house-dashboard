export interface IDevice {
    id?: string;
    name: string;
    ip: string;
    type: string;
    location?: string;
    active: boolean;
    roomId?: string;
    room?: {
        id: string;
        name: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    channel?: number;
    topic?: string;
}