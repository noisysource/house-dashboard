"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = setupWebSocketServer;
exports.broadcastUpdate = broadcastUpdate;
const ws_1 = __importStar(require("ws"));
const mqtt_service_1 = require("./mqtt-service");
let wss;
function setupWebSocketServer(server) {
    wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        // Send initial data when client connects
        const initialData = {
            type: 'initial_data',
            data: {
                devices: mqtt_service_1.powerReadings,
                totalPower: Object.values(mqtt_service_1.powerReadings).reduce((sum, device) => sum + device.power, 0),
                totalCurrent: Object.values(mqtt_service_1.powerReadings).reduce((sum, device) => sum + device.current, 0)
            }
        };
        ws.send(JSON.stringify(initialData));
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    });
    console.log('WebSocket server initialized');
}
// Broadcast updates to all connected clients
function broadcastUpdate(data) {
    if (!wss)
        return;
    const message = {
        type: 'power_update',
        data
    };
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
