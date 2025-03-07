import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { powerReadings } from './mqtt-service';

let wss: WebSocketServer;

interface PowerUpdate {
  devices: Record<string, any>;
  totalPower: number;
  totalCurrent: number;
}

export function setupWebSocketServer(server: HttpServer): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data when client connects
    const initialData = {
      type: 'initial_data',
      data: {
        devices: powerReadings,
        totalPower: Object.values(powerReadings).reduce((sum, device) => sum + device.power, 0),
        totalCurrent: Object.values(powerReadings).reduce((sum, device) => sum + device.current, 0)
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
export function broadcastUpdate(data: PowerUpdate): void {
  if (!wss) return;
  
  const message = {
    type: 'power_update',
    data
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}